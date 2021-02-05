const log = require('electron-log');
const { slice } = require('./slice');
const { heartbeatEvent, eventNames } = require('../socket/events');

const handleSlice = (params) => {
  return new Promise((resolve, reject) => {
    slice(
      params,
      (progress) => {
        heartbeatEvent.emit(eventNames.SLICEPROGRESS, { progress: progress * 100 });
      },
      (sliceResult) => {
        resolve(sliceResult);
        log.info('slice success', sliceResult);
        setTimeout(() => {
          heartbeatEvent.emit(eventNames.SLICEPROGRESS, { progress: 0 });
        }, 500);
      },
      (err) => {
        reject(err);
        log.error('slice error', err);
      }
    );
  });
};

module.exports = {
  handleSlice
};
