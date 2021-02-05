import axios from "./http";

export const versionUpdate = () => axios.get("update");

export const getMac = () => axios.get("getMac");

export const uploadModel = (data: any, options: any) =>
  axios.post("api/file/uploadUpdateFile", data, {
    ...options,
    transformRequest: [
      function (data: any) {
        return data;
      },
    ],
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const sliceModel = (data: any) => axios.post("api/slice", data, {});

export const addCustomConfigFile = (data: any) =>
  axios.post("api/file/addCustomConfigFile", data, {});

export const getConfigFileData = (data: any) =>
  axios.get("api/file/getConfigFileData", data);

export const getConfigFileList = (data: any) =>
  axios.get("api/file/getConfigFileList", data);

export const updateMoozVersion = (data: any) =>
  axios.post("updateMoozVersion", data);

export const modifyConfigFile = (data: any) =>
  axios.post("api/file/modifyConfigFile", data);

export const deleteCustomConfigFile = (data: any) =>
  axios.post("api/file/deleteCustomConfigFile", data);

export const readStl = (data: any) => axios.post("api/file/readStl", data);

export const deleteFiles = (data: any) =>
  axios.post("api/file/deleteFiles", data);

export const renameFile = (data: any) =>
  axios.post("api/file/renameFile", data);

export const newFoder = (data: any) => axios.post("api/file/newFoder", data);

export const readFileData = (data: any) =>
  axios.post("api/file/readFileData", data);

export const openBrowser = (data: any) =>
  axios.post("api/file/openBrowser", data);

export const unzipDir = (data: any) => axios.post("api/file/unzipDir", data);

export const removeFile = (data: any) =>
  axios.post("api/file/removeFile", data);

export const readAllFilesOrDirs = (data: any) =>
  axios.post("api/file/readAllFilesOrDirs", data);

export const getVersionConfig = () => axios.get("api/file/getVersionConfig");

export const writeVersionConfig = (data: { name: string; value: string }) =>
  axios.post("api/file/writeVersionConfig", data);
