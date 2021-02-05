
const api = require('./api');

function registerApis(app) {
  //base
  app.get('/', api.base.getIndex);
  app.get('/update', api.base.getUpdateJson);
  app.post('/updateMoozVersion', api.base.updateMoozVersion);
  app.get('/getMac', api.base.getMac);
  app.post('/api/file/openBrowser', api.base.openNewBrowserWindow);
  // print3D
  app.post('/api/slice', api.printing.sliceModel);
  //file
  app.post('/api/file/uploadUpdateFile', api.file.uploadUpdateFile);
  app.post('/api/file/addCustomConfigFile', api.file.addCustomConfigFile);
  app.get('/api/file/getConfigFileData', api.file.getConfigFileData);
  app.get('/api/file/getConfigFileList', api.file.getConfigFileList);
  app.post('/api/file/modifyConfigFile', api.file.modifyConfig);
  app.post('/api/file/deleteCustomConfigFile', api.file.deleteCustomConfigFile);
  app.post('/api/file/readStl', api.file.readStl);
  app.post('/api/file/deleteFiles', api.file.deleteFiles);
  app.post('/api/file/renameFile', api.file.renameFile);
  app.post('/api/file/newFoder', api.file.newFoder);
  app.post('/api/file/readFileData', api.file.readFileData);
  app.post('/api/file/unzipDir', api.file.unzipDir);
  app.post('/api/file/removeFile', api.file.removeFile);
  app.post('/api/file/readAllFilesOrDirs', api.file.readAllFilesOrDirs);
  app.get('/api/file/getVersionConfig', api.file.getVersionConfig);
  app.post('/api/file/writeVersionConfig', api.file.writeVersionConfig);
}
module.exports = { registerApis };
