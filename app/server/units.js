const fs = require('fs');
const path = require('path');
const LocalStorageData = require('./LocalStorageData');


const getWlANIP = (port) => {
  const portArr = port.split('.');
  const portHeader = [portArr[0], portArr[1], portArr[2]].join('.');
  const os = require('os');
  const netInfo = os.networkInterfaces(); //网络信息
  let ip = '';
  for (const dev in netInfo) {
    if (dev in netInfo) {
      for (let j = 0; j < netInfo[dev].length; j++) {
        if (!netInfo[dev][j].internal && netInfo[dev][j].family === 'IPv4' && !netInfo[dev][j].address.includes('::') && netInfo[dev][j].address !== '127.0.0.1') {
          const verifyIp = netInfo[dev][j].address;
          verifyIp.includes(portHeader) && (ip = verifyIp);
          break;
        }
      }
    }
  }
  return ip;
};

const formatFileName = (originName) => {
  const date = new Date();
  let min = date.getMinutes();
  let sec = date.getSeconds();
  let random = Math.floor(Math.random() * 100);
  min < 10 && (min = '0' + min);
  sec < 10 && (sec = '0' + sec);
  random < 10 && (random = '0' + sec);
  const name = originName || 'gcode';
  return `${name}_${min}${sec}${random}`;
};

/**
 * 保存Gcode 文件
 * @param {string} name 
 * @param {*} data 
 * @param {*} callback 
 */
const writeGcodeFile = (name, data, callback) => {
  const dir = path.join(LocalStorageData.gcodeDir, name);
  return new Promise((resolve) => {
    fs.writeFile(dir, data, (error) => {
      if (error) {
        return;
      }
      fs.stat(dir, (err, stat) => {
        stat && stat.isFile() && resolve(stat);
      });
    });
  });
};



/**
 * 检测路径中是否有同名文件
 * @param {*} path 
 * @param {*} name 带后缀
 * return new file name
 */

const verifyFileUnique = (path, name) => {
  let index = 0;
  let nameArr = name.split('.');
  const suffix = nameArr.pop();
  const filename = nameArr.join('')

  if (fs.lstatSync(path).isDirectory()) {
    const fn = (in_path, in_name) => {
      const dir = fs.readdirSync(in_path);
      if (dir.some(item => item === `${in_name}.${suffix}`)) {
        index++;
        return fn(in_path, `${filename}(${index})`)
      } else {
        return `${in_name}.${suffix}`
      }
    };
    return fn(path, filename)
  } else {
    console.log('Path Invalid');
    return null;
  }
}

module.exports = { getWlANIP, formatFileName, writeGcodeFile, verifyFileUnique };
