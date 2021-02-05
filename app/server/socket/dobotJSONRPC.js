const MOOZWebsocket = require('./websocket');
const { heartbeatEvent, eventNames } = require('./events');
const MOOZSerial = require('../control/communicate');

const requestPromises = {};
class DOBOTJSONRPC extends MOOZWebsocket {
  constructor() {
    super();
    heartbeatEvent.on(eventNames.GETPOSE, this.handleHeartbeat.bind(this, eventNames.GETPOSE));
    heartbeatEvent.on(eventNames.RUNNING, this.handleHeartbeat.bind(this, eventNames.RUNNING));
    heartbeatEvent.on(eventNames.GETTEMP, this.handleHeartbeat.bind(this, eventNames.GETTEMP));
    heartbeatEvent.on(eventNames.GCODE, this.handleHeartbeat.bind(this, eventNames.GCODE));
    heartbeatEvent.on(eventNames.ERROR, this.handleHeartbeat.bind(this, eventNames.ERROR));
    heartbeatEvent.on(eventNames.TRANSFERGCODE, this.handleHeartbeat.bind(this, eventNames.TRANSFERGCODE));
    heartbeatEvent.on(eventNames.UPDATEERROR, this.handleHeartbeat.bind(this, eventNames.UPDATEERROR));
    heartbeatEvent.on(eventNames.ENDTRANSFERFILE, this.handleHeartbeat.bind(this, eventNames.ENDTRANSFERFILE));
    heartbeatEvent.on(eventNames.ENDSTOP, this.handleHeartbeat.bind(this, eventNames.ENDSTOP));
    heartbeatEvent.on(eventNames.SLICEPROGRESS, this.handleHeartbeat.bind(this, eventNames.SLICEPROGRESS));
    heartbeatEvent.on(eventNames.READSTLFILES, this.handleHeartbeat.bind(this, eventNames.READSTLFILES));
    heartbeatEvent.on(eventNames.DOWNLOADNEWFILE, this.handleHeartbeat.bind(this, eventNames.DOWNLOADNEWFILE));
  }

  handleHeartbeat(method, data) {
    this.send(JSON.stringify({
      jsonrpc: '2.0',
      method,
      params: data
    }));
  }

  handleMessage(data) {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.error('sent data cannot JSONfy', data);
      return;
    }
    if (data.id) {
      const newPromise = new Promise(resolve => {
        requestPromises[data.id] = resolve;
      });
      newPromise.then(result => {
        this.send(result);
        delete requestPromises[data.id];
      });
    }
    DOBOTJSONRPC.filterMethods(data);
  }

  static parseResponse(result, originData) {
    const { id, method } = originData;
    return JSON.stringify({
      id,
      method,
      jsonrpc: '2.0',
      params: result
    });
  }

  static filterMethods(data) {
    if (!data.method) {
      console.error(Error('Message need Method to execute!'));
      return;
    }
    const method = data.method.toLowerCase();
    if (!MOOZSerial[method]) {
      throw Error('Method not defined');
    }
    MOOZSerial[method](data).then(res => {
      const result = DOBOTJSONRPC.parseResponse(res, data);
      const resolver = requestPromises[data.id];
      if (typeof resolver === 'function') {
        resolver(result);
      }
    });
  }
}

module.exports = DOBOTJSONRPC;
