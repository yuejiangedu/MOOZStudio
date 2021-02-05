const Net = require('net');
const SerialPort = require('serialport');

class CustomPort {
  constructor(type, params) {
    this.connectType = type;
    const portConfig = {
      serial: {
        constructor: SerialPort,
        connect: 'open',
        data: 'data',
        error: 'error',
        close: 'close',
        port: params,
        defaultOption: {
          baudRate: 115200,
          dataBits: 8,
          parity: 'none',
          stopBits: 1,
          flowControl: false
        }
      },
      wifi: {
        constructor: Net.createConnection,
        connect: 'connect',
        data: 'data',
        error: 'error',
        close: 'end',
        port: params.split(':')[1],
        defaultOption: params.split(':')[0]
      }
    };
    this.config = portConfig[type];
    this.server = this.init();
  }

  init() {
    const { config } = this;
    return config.constructor(config.port, config.defaultOption);
  }

  on(event, callback) {
    this.server.on(this.config[event], callback);
  }

  close() {
    const { config } = this;
    this.server[config.close]();
  }

  write(msg, callback) {
    this.server.write(msg, callback);
  }
}
module.exports = { CustomPort };
