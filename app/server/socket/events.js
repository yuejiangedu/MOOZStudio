const EventEmitter = require('events');

const eventNames = {
  GETPOSE: 'GETPOSE',
  RUNNING: 'RUNNING',
  GETTEMP: 'GETTEMP',
  ERROR: 'ERROR',
  GCODE: 'GCODE',
  TRANSFERGCODE: 'TRANSFERGCODE',
  UPDATEERROR: 'UPDATEERROR',
  ENDTRANSFERFILE: 'ENDTRANSFERFILE',
  ENDSTOP: 'ENDSTOP',
  SLICEPROGRESS: 'SLICEPROGRESS',
  READSTLFILES: 'READSTLFILES',
  DOWNLOADNEWFILE: 'DOWNLOADNEWFILE'
};
const heartbeatEvent = new EventEmitter();

module.exports = {
  heartbeatEvent,
  eventNames
};
