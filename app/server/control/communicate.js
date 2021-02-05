const SerialPort = require('serialport');
const net = require('net');
const crc = require('node-crc');

const { heartbeatEvent, eventNames } = require('../socket/events');
const { combineFileSettingData, wifiFileVerify } = require('./filesHandle.js');
const { getWlANIP, formatFileName, writeGcodeFile } = require('../units.js');
const { CustomPort } = require('./CustomPort.js');

const cmdIDMap = {
  'gcode': 0,
  'flat': 1,
  'currentPos': 2,
  'currentTemp': 3,
  'currentPower': 4,
  'endStopType': 5,
  'running': 6,
  'fileTransferSetting': 22,
  'transferGcode': 23,
  'transferVerify': 24,
  'verifyFileGroup': 25,
  'setClient': 36,
};

let seqNumNow = 1;
class MOOZSerial {
  constructor() {
    this.gcodeQueue = 0;
    this.gcodeWaitQueue = [];
    this.messageQueue = [];
    this.transferQueue = [];
    this.errorPacketQueue = [];
    this.connected = false;
    this.connectType = '';
    this.part = './gcodeFile';
    this.transferGcodeBuf = null;
    this.totalPacketNum = 0;
    this.gcodeCurrentPacket = 0;
    this.transferGodeLength = 5000;
    this.trSpeed = 300;
    this.fileName = '';
    this.fileMsg = {};
    this.wlanIP = '';
    this.tcpServerPort = 8000;
    this._openHeartBeat = true;
    this.openTrVerify = true;
    this.fileGroupIndex = 0;
    this.ipArrLength = 128;
    this.fileNameArrLength = 64;
    this.fileGroupLength = 100;
    this.errorPacketArrLength = 100;
    this.standardIntervalTime = 1000;
    this.serialIntervalTime = 100;
    this.openResendGcode = true;
    this.endWriteFile = false;
    this.beatTimeOut = null;
    this.currentSpeed = 35;
    this.transferProgram = 0;
    this.writePromise = null;
    this.writeReceive = true;
    this.currentCmdId = null;
    this.firstWrite = true;
    this.resendTimer = null;
    this.transferTimer = null;
    this.writePrg = 98;
    this.connectTimerOutTimer = null;
    this.connectPort = '';
  }

  /**
   * 传输文件，设置文件参数
   */
  transfer(data) {
    this.toggleHeartBeat(false);
    return new Promise((resolve) => {
      const gcodeData = data.params.gcode;
      this.transferGcodeBuf = Buffer.from(gcodeData.split('').map(c => c.charCodeAt(0)));
      this.totalPacketNum = Math.ceil(this.transferGcodeBuf.length / this.transferGodeLength);
      this.initTransferState();
      writeGcodeFile(this.fileName, gcodeData).then((fileMsg) => {
        this.fileMsg = fileMsg;
        const buf = combineFileSettingData(this.fileName, fileMsg.size, this.transferGodeLength);
        const idBuffer = Buffer.from([cmdIDMap.fileTransferSetting]);
        const msg = MOOZSerial.messageFactory(buf, idBuffer);
        this.transferQueue.push({ msg, id: cmdIDMap.fileTransferSetting });
      });
      resolve('OK');
    });
  }

  /**
   * 初始化传输参数
   */
  initTransferState() {
    this.gcodeCurrentPacket = 0;
    this.fileGroupIndex = 0;
    this.transferProgram = 0;
    this.fileName = formatFileName();
    this.fileName += '.gcode';
  }

  /**
   * 搜索接口
   */
  // eslint-disable-next-line class-methods-use-this
  search() {
    return new Promise((resolve) => {
      SerialPort.list().then((res) => resolve(res.filter((item) => {
        return item.locationId != undefined;
      })))
    })
  }

  /**
   * 连接串口
   * @param {{params: {port:string}}} data
   */
  connect(data) {
    this.connectType = data.params.type;
    return new Promise(resolve => {
      this.connectPort = data.params.port;

      this.port = new CustomPort(this.connectType, data.params.port);

      this.connectCountDown(data.params.type);

      this.port.on('data', (data => {
        this.handleData(data);
      }));

      this.port.on('connect', (() => {
        if (this.connectType === 'wifi') {
          this.createTcpServer().then(() => {
            this.changeHeartBeatSpeed(this.standardIntervalTime);
            this.connected = true;
            clearTimeout(this.connectTimerOutTimer);
            resolve('ok');
          });
        } else {
          this.changeHeartBeatSpeed(this.serialIntervalTime);
          this.connected = true;
          clearTimeout(this.connectTimerOutTimer);
          this.getEndStopType();
          resolve('ok');
        }
      }));

      this.port.on('error', ((e) => {
        console.error(e);
        heartbeatEvent.emit(eventNames.ERROR);
        this.disconnect();
      }));
    });
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (!this.port) {
      return Promise.reject(Error('No port at all'));
    }
    clearInterval(this.beatTimeOut);
    clearInterval(this.transferTimer);
    this.toggleHeartBeat(true);
    this.connected = false;
    this.connectType === 'serial' && this.port && this.port.close();
    this.server && this.server.close();
    this.port = null;
    return Promise.resolve('ok');
  }

  createTcpServer = () => {
    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket) => {
        this.port = socket;
        this.port.on('data', (data => {
          this.handleData(data);
        }));
        this.port.on('error', (error => {
          console.log('error', error);
        }));
        resolve();
      });

      this.server.listen(this.tcpServerPort, () => {
        this.wlanIP = getWlANIP(this.connectPort);

        if (!this.wlanIP) {
          heartbeatEvent.emit(eventNames.UPDATEERROR, { error: 'Unable to connect to this IP' });
          reject();
          return;
        }

        let ip = Buffer.from(this.wlanIP.split('').map(c => c.charCodeAt(0)));
        if (ip.length < this.ipArrLength) {
          ip = Buffer.concat([ip, Buffer.alloc(this.ipArrLength - ip.length, 0)]);
        }
        const port = Buffer.allocUnsafe(4); // uint32_t port Byte0-3
        port.writeUInt32LE(this.tcpServerPort, 0);
        const buf = Buffer.concat([ip, port]);
        const idBuffer = Buffer.from([cmdIDMap.setClient]);
        const msg = MOOZSerial.messageFactory(buf, idBuffer);
        this.transferQueue.push({ msg, id: cmdIDMap.setClient });
        this.write();
      });
    });
  }


  connectCountDown = (type) => {
    this.connectTimerOutTimer = setTimeout(() => {
      console.log('error', 'Connection timed out');

      if (type === 'serial') {
        heartbeatEvent.emit(eventNames.UPDATEERROR, { error: 'Port Connection timed out' });
      }
      else {
        heartbeatEvent.emit(eventNames.UPDATEERROR, { error: 'Wifi Connection timed out' });
      }
    }, 10000);
  };

  /**
   * 打开关闭心跳包
   * @param {boolean} bool  判断开关
   */
  toggleHeartBeat = (bool) => {
    this._openHeartBeat = bool;
    if (!bool) {
      clearTimeout(this._poseTimeout);
      clearTimeout(this._tempTimeout);
      this._poseTimeout = null;
      this._tempTimeout = null;
    }
  }

  changeHeartBeatSpeed = (sp) => {
    clearInterval(this.beatTimeOut);
    this.beatTimeOut = null;
    this.beatTimeOut = setTimeout(() => {
      this.startHeartBeat();
      this.changeHeartBeatSpeed(sp);
    }, sp);
  }

  /**
   * 传输 gcode
   * @param {{params: {gcode:string}}} data 待传输数据
   */
  gcode(data) {
    return new Promise((resolve) => {
      const gcodeCharArray = data.params.gcode.split('').map(c => c.charCodeAt(0));
      const gcodeBuffer = Buffer.from(gcodeCharArray);
      const idBuffer = Buffer.from([cmdIDMap.gcode]);
      const msg = MOOZSerial.messageFactory(gcodeBuffer, idBuffer);
      this.gcodeWaitQueue.push({ msg, id: cmdIDMap.gcode });
      resolve('ok');
    });
  }


  _poseTimeout = null

  _tempTimeout = null

  /**
   * 心跳包, 用于维护与 MOOZ 的连接
   */
  startHeartBeat() {
    if (!this.connected) {
      return;
    }
    if (!this._poseTimeout && this._openHeartBeat) {
      this._poseTimeout = setTimeout(() => {
        this.getPose();
        this._poseTimeout = null;
      }, this.standardIntervalTime);
    }
    if (!this._tempTimeout && this._openHeartBeat) {
      this._tempTimeout = setTimeout(() => {
        this.getTemp();
        this._tempTimeout = null;
      }, this.standardIntervalTime);
    }
    if (this._openHeartBeat) {
      const runningBufferId = Buffer.from([cmdIDMap.running]);
      const runningMsg = MOOZSerial.messageFactory(null, runningBufferId);
      this.messageQueue.push({ msg: runningMsg, id: cmdIDMap.running });
    }
    this.write();
  }

  getEndStopType = () => {
    const bufferId = Buffer.from([cmdIDMap.endStopType]);
    const msg = MOOZSerial.messageFactory(null, bufferId);
    this.messageQueue.push({ msg, id: cmdIDMap.endStopType });
  }

  getPose() {
    const posBufferId = Buffer.from([cmdIDMap.currentPos]);
    const posMsg = MOOZSerial.messageFactory(null, posBufferId);
    this.messageQueue.push({ msg: posMsg, id: cmdIDMap.currentPos });
  }

  getTemp() {
    const tempBufferId = Buffer.from([cmdIDMap.currentTemp]);
    const tempMsg = MOOZSerial.messageFactory(null, tempBufferId);
    this.messageQueue.push({ msg: tempMsg, id: cmdIDMap.currentTemp });
  }

  /**
   * 接收数据入口函数
   * @param {object} data
   */
  handleData(data) {
    const bufferArr = MOOZSerial.splitData(data);
    bufferArr.forEach((buffer) => {
      const handledData = this.prepareMerge(buffer);
      if (!handledData) {
        return;
      }
      const cmdID = Number(handledData.readInt8(13));
      const payloadLength = handledData.readUInt16LE(2);
      const payload = handledData.slice(15, 15 + payloadLength);

      //判断包已经被接收
      if (cmdID === this.currentCmdId) {
        this.writeReceive = true;
        clearTimeout(this.resendTimer);
      }
      if (Object.values(cmdIDMap).includes(cmdID)) {
        this.resolveData(payload, cmdID);
      }
    });
  }

  /**
   * 准备数据合并
   * @param {Buffer} data 收到的数据
   */
  prepareMerge(data) {
    if (this.toMergeLength) {
      data = Buffer.concat([this.toMergeData, data]);
    } else if (this.isAllff(data)) {
      return false;
    } else if (data.indexOf(Buffer.from([0xAA])) !== 0) {
      this.toMergeLength = 0;
      return false;
    }

    const dataLength = data.length;
    const realLength = dataLength > 4 ? data.readUInt16LE(2) + 17 : 17; //数据除payload外长度为17
    this.toMergeLength = realLength - dataLength;
    if (this.toMergeLength > 0) {
      this.toMergeData = data;
      return false;
    } else {
      this.toMergeLength = 0;
    }
    return data;
  }

  isAllff = (data) => {
    const buf = Buffer.alloc(data.length, 0xff);
    return buf.equals(data);
  }

  /**
   * 分包
   * @param {object} data
   */
  static splitData(data) {
    const arr = [];
    const arrIndex = [];
    const seq = Buffer.from([0xAA]);
    const len = seq.length;
    let current;
    let offset = 0;
    while ((current = data.indexOf(seq, offset)) !== -1) {
      arrIndex.push(current);
      offset = current + len;
    }
    if ((arrIndex.length === 1 && arrIndex[0] === 0) || arrIndex.length === 0) {
      arr.push(data);
    } else {
      arrIndex.reduce((pre, cur, curIndex) => {
        const sliceBuffer = data.slice(pre, cur);
        sliceBuffer.length !== 0 && arr.push(sliceBuffer);
        if (curIndex === arrIndex.length - 1) {
          arr.push(data.slice(cur));
        }
        return cur;
      }, 0);
    }
    return arr;
  }


  /**
   * 解析数据, 获取 payload
   * @param {Buffer} data 待解析对象
   */
  resolveData(payload, cmdId) {
    switch (cmdId) {
      case 0:
        return this.resolveGcode(payload);
      case 2:
        return MOOZSerial.resolvePos(payload);
      case 6:
        return MOOZSerial.resolveRunning(payload);
      case 3:
        return MOOZSerial.resolveTemp(payload);
      case 5:
        return MOOZSerial.resolveEndStop(payload);
      case 22:
        return this.resolveFileSetting(payload);
      case 23:
        return this.resolveFileTransfer(payload);
      case 24:
        return this.resolveWifiFileVerify(payload);
      case 25:
        return this.resolveFileGroupVerify(payload);
      default:
        break;
    }
    return null;
  }


  write() {
    if ((this.writeReceive || !this.openTrVerify) && this.port && !this.writePromise) {
      let msgObj;
      if (this.gcodeWaitQueue.length !== 0 && this.gcodeQueue < 8) {
        msgObj = this.gcodeWaitQueue.shift();
        this.gcodeQueue++;
        heartbeatEvent.emit(eventNames.GCODE, {
          gcode: 'ok'
        });
      } else if (this.errorPacketQueue.length !== 0) {
        msgObj = this.errorPacketQueue.shift();
      } else if (this.transferQueue.length !== 0) {
        msgObj = this.transferQueue.shift();
        this.updateTransferProgram();
        if (msgObj.currentIndex === this.totalPacketNum - 1) {
          this.endTransferWrite();
        }
      } else if (this.messageQueue.length !== 0) {
        msgObj = this.messageQueue.shift();
      } else {
        return;
      }
      this.rawWrite(msgObj.msg, msgObj.id);
    }
  }

  reSendGcode(msg, id) {
    this.resendTimer = setTimeout(() => {
      if (!this.writeReceive) {
        this.writePromise = null;
        this.rawWrite(msg, id);
      }
    }, this.standardIntervalTime);
  }

  stoptransmission() {
    return new Promise((resolve) => {
      clearInterval(this.transferTimer);
      this.toggleHeartBeat(true);
      this.openResendGcode = true;
      resolve();
    });
  }

  updateTransferProgram() {
    //更新传输进度
    this.transferProgram++;
    //进度转化为百分比
    const progress = Math.min(parseInt(this.transferProgram / this.totalPacketNum * 100), this.writePrg);
    const prePrg = Math.min(parseInt((this.transferProgram - 1) / this.totalPacketNum * 100), this.writePrg);
    if ((progress - prePrg) >= 1) {
      heartbeatEvent.emit(eventNames.TRANSFERGCODE, { progress });
    }
  }

  rawWrite(msg, id) {
    if (!this.writePromise) {
      this.currentCmdId = id;
      !this.firstWrite && (this.writeReceive = false);
      id === 23 && (this.writeReceive = true);
      this.firstWrite = false;
      this.writePromise = new Promise(resolve => {
        this.port && this.port.write(msg, (() => {
          const { openResendGcode } = this;
          if (openResendGcode && id !== 23) {
            this.reSendGcode(msg, id);
          }
          resolve();
          this.writePromise = null;
        }));
      });
    } else {
      this.writePromise.then(() => {
        this.rawWrite(msg, id);
      });
    }
  }


  /**
   * 结束数据传输，进行数据检验
   */
  endTransferWrite = () => {
    //最后一包为错误包检验包，开启重发及包回调检验
    this.openTrVerify = true;
    this.openResendGcode = true;
    this.endWriteFile = true;
    this.verifyFileGroup();
  }


  /**
   * 开始传输文件流
   * @param {*}
   */
  startTransfer = () => {
    if (this.gcodeCurrentPacket > (this.totalPacketNum - 1)) {
      this.stoptransmission();
      return;
    }
    if (this.fileGroupIndex >= this.fileGroupLength) {
      this.verifyFileGroup();
      this.fileGroupIndex = 0;
      return;
    }
    this.combineFilePacket();
    this.fileGroupIndex++;
  }

  verifyFileGroup = () => {
    let name = Buffer.from(this.fileName.split('').map(c => c.charCodeAt(0)));
    if (name.length < this.fileNameArrLength) {
      name = Buffer.concat([name, Buffer.alloc(this.fileNameArrLength - name.length, 0)]);
    }
    const endPkIndex = Buffer.allocUnsafe(2); //uint16_t  endPacket byte2-3
    endPkIndex.writeUInt16LE(this.gcodeCurrentPacket - 1, 0); //结束包编号为当前包编号的上一位

    //倒数第二包校验包不发送，防止与最后一包校验包间隔过短
    if ((this.totalPacketNum - this.gcodeCurrentPacket) < this.fileGroupLength && this.totalPacketNum !== this.gcodeCurrentPacket) {
      return;
    }


    const beginPkIndex = Buffer.allocUnsafe(2); //uint16_t  beginPacket byte0-1
    beginPkIndex.writeUInt16LE(Math.max(this.gcodeCurrentPacket - this.fileGroupLength, 0), 0);
    const payload = Buffer.concat([name, beginPkIndex, endPkIndex]);
    const idBuf = Buffer.from([cmdIDMap.verifyFileGroup]);
    const msg = MOOZSerial.messageFactory(payload, idBuf);
    this.transferQueue.push({ msg, id: cmdIDMap.verifyFileGroup });
  }

  combineFilePacket = (packetIndex) => {
    const startPacketIndex = (packetIndex === undefined) ? this.gcodeCurrentPacket : packetIndex;

    const sendGcodeBuf = this.transferGcodeBuf.slice(startPacketIndex * this.transferGodeLength, (startPacketIndex + 1) * this.transferGodeLength);
    const startIndex = Buffer.allocUnsafe(2);
    startIndex.writeUInt16LE(startPacketIndex, 0);

    (packetIndex === undefined) && this.gcodeCurrentPacket++;

    const endIndex = Buffer.allocUnsafe(2);
    endIndex.writeUInt16LE(this.totalPacketNum, 0);


    const supplementFlag = Buffer.allocUnsafe(1);
    const flag = (packetIndex === undefined) ? 0 : 1;
    supplementFlag.writeUInt8(flag);

    const payload = Buffer.concat([startIndex, endIndex, supplementFlag, sendGcodeBuf]);
    const transferGcode = Buffer.from([cmdIDMap.transferGcode]);
    const msg = MOOZSerial.messageFactory(payload, transferGcode);

    if (packetIndex === undefined) {
      this.transferQueue.push({ msg, id: cmdIDMap.transferGcode, currentIndex: this.gcodeCurrentPacket - 1 });
    } else {
      this.errorPacketQueue.push({ msg, id: cmdIDMap.transferGcode, currentIndex: packetIndex });
      this.errorPacketUnique();
    }
  }


  errorPacketUnique = () => {
    const map = new Map();
    this.errorPacketQueue = this.errorPacketQueue.filter((item) => {
      return !map.has(item.currentIndex) && map.set(item.currentIndex, 1);
    });
  }

  wifiFileVerify = () => {
    this.endWriteFile = false;
    const payload = wifiFileVerify(this.fileName, this.fileMsg.size);
    const transferVerify = Buffer.from([cmdIDMap.transferVerify]);
    const msg = MOOZSerial.messageFactory(payload, transferVerify);
    this.transferQueue.push({ msg, id: cmdIDMap.transferVerify });
    heartbeatEvent.emit(eventNames.TRANSFERGCODE, { progress: 100 }); //更新进度为100%
    heartbeatEvent.emit(eventNames.ENDTRANSFERFILE, { fileMsg: { name: this.fileName, size: this.fileMsg.size } });
  }

  reSendErrorPacket = (buf, count, originNum) => {
    for (let index = 0; index < count * 2; index += 2) {
      const subBuf = buf.slice(index, index + 2);
      this.combineFilePacket(subBuf.readUInt16LE(0));
    }

    if (originNum > this.errorPacketArrLength) {
      this.verifyFileGroup();
    }
  }

  resolveFileGroupVerify(data) {
    const num = data.slice(2, 4);
    const originNum = num.readUInt16LE(0);
    const errorNum = Math.min(originNum, 100);
    const errorPacketBuf = data.slice(4, errorNum * 2 + 4);
    errorNum && this.reSendErrorPacket(errorPacketBuf, errorNum, originNum);
    const speed = Math.min(originNum + this.currentSpeed, 1000);
    this.changeHeartBeatSpeed(speed);
    if (this.endWriteFile) {
      errorNum ? this.verifyFileGroup() : this.wifiFileVerify();
    }
  }


  /**
   * 解析 Gcode payload
   * @param {Buffer} data 待解析对象
   */
  resolveGcode(data) {
    const executeRes = data.toString();
    if (executeRes.includes('ok')) {
      this.gcodeQueue--;
    }
  }

  /**
   * 解析 位置 payload
   * @param {Buffer} data 待解析对象
   */
  static resolvePos(data) {
    const [x, y, z, e] = [data.readFloatLE(0), data.readFloatLE(4), data.readFloatLE(8), data.readFloatLE(12)];
    heartbeatEvent.emit(eventNames.GETPOSE, {
      x, y, z, e
    });
  }

  static resolveRunning(data) {
    const isRunning = data.readInt8(0);
    heartbeatEvent.emit(eventNames.RUNNING, {
      isRunning
    });
  }

  static resolveTemp(data) {
    const tempBedNow = data.readFloatLE(4);
    heartbeatEvent.emit(eventNames.GETTEMP, {
      temp: tempBedNow
    });
  }

  static resolveEndStop(data) {
    const endStop = data.readInt8(0);
    heartbeatEvent.emit(eventNames.ENDSTOP, {
      endStop: endStop
    });
  }

  resolveWifiFileVerify = () => {
    //10秒钟后再开启心跳
    setTimeout(() => {
      this.toggleHeartBeat(true);
    }, 10000);
    //停止写入，等待模块重置
    this.transferQueue = [];
    this.errorPacketQueue = [];
    this.messageQueue = [];

    this.endWriteFile = false;
    this.openResendGcode = true;
    this.changeHeartBeatSpeed(this.standardIntervalTime);
  }

  resolveFileSetting = (data) => {
    const state = data.readUInt8(0);
    if (state === 0 && this.transferGcodeBuf) {
      this.openResendGcode = false;
      this.openTrVerify = false; //测试
      this.endWriteFile = false;
      this.changeHeartBeatSpeed(this.currentSpeed);
      this.transferTimer = setInterval(() => {
        this.startTransfer();
      }, 20);
    } else {
      console.log('Setting Error', state);
      heartbeatEvent.emit(eventNames.UPDATEERROR, { error: 'Cannot find the U disk or there is a file with the same name, please check again' });
      this.toggleHeartBeat(true);
      this.changeHeartBeatSpeed(this.standardIntervalTime);
    }
  }

  resolveFileTransfer = (data) => {
    const state = data.slice(0, 1).readUInt8(0);
    if (state !== 0) {
      console.log('Transfer Error', state);
      heartbeatEvent.emit(eventNames.UPDATEERROR, { error: 'Failed to transfer file' });
      this.changeHeartBeatSpeed(this.standardIntervalTime);
      this.stoptransmission();
    }
  }

  static messageFactory(asciiPayload, idBuffer) {
    const header = Buffer.from([0xAA, 0xBB]);
    const version = Buffer.from([0x10]);
    const config = Buffer.from([0x14]);
    // 源地址为PC
    const src = Buffer.from([0x00]);
    // 目的地为MOOZ
    const dest = Buffer.from([0x10]);
    const seqBuffer = Buffer.alloc(4);
    seqBuffer.writeUInt32LE(seqNumNow);
    seqNumNow += 1;
    // MOOZ 指令集
    const cmdSet = Buffer.from([0x04]);

    const HEADLENGTH = 14;
    const payloadLen = asciiPayload ? asciiPayload.length : 0;
    const lengthBuffer = Buffer.alloc(2);
    lengthBuffer.writeUInt16LE(payloadLen);
    // 参考MOOZ协议文档 https://shimo.im/docs/5b25368127f74628/read
    // const msgBuffer = Buffer.alloc(HEADLENGTH)
    const headbuffer = Buffer.concat([header, lengthBuffer, version, config, seqBuffer, src, dest, cmdSet, idBuffer], HEADLENGTH);
    const checkHeader = crc.crc8(headbuffer);
    const packetArray = asciiPayload ? [headbuffer, checkHeader, asciiPayload] : [headbuffer, checkHeader];
    const packetBuffer = Buffer.concat(packetArray, HEADLENGTH + 1 + payloadLen);
    const checkPacket = crc.crc16ibm(packetBuffer);
    const totalBuffer = Buffer.concat([packetBuffer, checkPacket.reverse()], HEADLENGTH + 1 + payloadLen + 2);
    return totalBuffer;
  }
}
const moozSerial = new MOOZSerial();
module.exports = moozSerial;
