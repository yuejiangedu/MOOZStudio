const fs = require('fs');

const FILENAMEARR_LENGTH = 64;

const combineFileSettingData = (fileName, size, transferGodeLength) => {
  const mode = Buffer.allocUnsafe(1);
  mode.writeUInt8(0x0, 0);
  let name = Buffer.from(fileName.split('').map(c => c.charCodeAt(0)));
  if (name.length < FILENAMEARR_LENGTH) {
    name = Buffer.concat([name, Buffer.alloc(FILENAMEARR_LENGTH - name.length, 0)]);
  }
  const fileSize = Buffer.allocUnsafe(4); //fileSize uint32_t Byte0-3
  fileSize.writeUInt32LE(size, 0);
  const packetSize = Buffer.allocUnsafe(2); //packetSize uint16_t Byte4-5
  packetSize.writeUInt16LE(transferGodeLength, 0);
  return Buffer.concat([mode, name, fileSize, packetSize]);
};

const wifiFileVerify = (fileName, size) => {
  let name = Buffer.from(fileName.split('').map(c => c.charCodeAt(0)));
  if (name.length < FILENAMEARR_LENGTH) {
    name = Buffer.concat([name, Buffer.alloc(FILENAMEARR_LENGTH - name.length, 0)]);
  }
  const fileSize = Buffer.allocUnsafe(4); //fileSize uint32_t Byte0-3
  fileSize.writeUInt32LE(size, 0);
  const verityType = Buffer.allocUnsafe(1); //verityType  uint8_t Byte4
  verityType.writeUInt8(0x0, 0);
  const verifyCode = Buffer.allocUnsafe(4); //verifyCode  uint32_t Byte5-8
  verifyCode.writeUInt32LE(0, 0);
  return Buffer.concat([name, fileSize, verityType, verifyCode]);
};

module.exports = {
  combineFileSettingData,
  wifiFileVerify
};
