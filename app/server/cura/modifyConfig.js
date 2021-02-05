
const fs = require('fs');
const path = require('path');
const localStorageData = require('../LocalStorageData');



const modifyConfigFile = function (fileName, property, value) {
  return new Promise((resolve, reject) => {
    const dir = path.join(localStorageData.configDir, localStorageData.moozVersion, fileName);
    if (fs.existsSync(dir)) {
      fs.readFile(dir, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          throw err;
        }
        const objData = JSON.parse(data);

        let jsString = 'objData';
        for (let i = 0; i < property.length; i++) {
          const dirArr = property[i];
          for (let j = 0; j < dirArr.length; j++) {
            const name = dirArr[j];
            jsString += `['${name}']`;
          }
          eval(`${jsString}=${value[i]}`);
          jsString = 'objData';
        }
        const newContent = JSON.stringify(objData);
        fs.writeFile(dir, newContent, 'utf8', (err) => {
          if (err) {
            reject(err);
            throw err;
          }
          resolve();
        });
      });
    }
  });
};

const getModelPosConfigPath = function () {
  return [
    ['settings', 'command_line_settings', 'children', 'mesh_position_x', 'default_value'],
    ['settings', 'command_line_settings', 'children', 'mesh_position_y', 'default_value'],
    ['settings', 'command_line_settings', 'children', 'mesh_rotation_matrix', 'default_value']
  ];
};

const addRelatedParamsWithWallThickness = function (category, key, val) {
  const isSpiralize = localStorageData.curConfigData.quality.overrides.blackmagic.children.magic_spiralize.default_value
  const wallLineCount = isSpiralize ? 1 : Math.max(1, Math.round((val - 0.4) / 0.4) + 1); //wall_line_width_0，wall_line_width_x 取0.4
  return [
    [['overrides', category, 'children', key, 'default_value'], ['overrides', category, 'children', 'wall_line_count', 'default_value']], [val, wallLineCount]
  ];
}

const addRelatedParamsWithInfillDensity = function (category, key, val) {
  const infillLineDistance = val === 0 ? 0 : (0.4 * 100) / val * 2; //infill_line_width 取0.4，infill_pattern取2
  return [
    [['overrides', category, 'children', key, 'default_value'], ['overrides', category, 'children', 'infill_line_distance', 'default_value']], [val, infillLineDistance]
  ];
}

const addRelatedParamsWithInfillSupportDensity = function (category, key, val) {
  const supportLindDistance = val === 0 ? 0 : (0.4 * 100) / val * 2; //support_line_width 取0.4
  return [
    [['overrides', category, 'children', key, 'default_value'], ['overrides', category, 'children', 'support_infill_rate', 'children', 'support_line_distance', 'default_value'], ['overrides', category, 'children', 'support_infill_rate', 'children', 'support_initial_layer_line_distance', 'default_value']], [val, supportLindDistance, supportLindDistance]
  ];
}

const addRelatedParams = {
  "wall_thickness": addRelatedParamsWithWallThickness,
  "infill_sparse_density": addRelatedParamsWithInfillDensity,
  'support_infill_rate': addRelatedParamsWithInfillSupportDensity
}

const getModifyConfigParams = function (category, key, val) {
  if (addRelatedParams[key]) {
    return addRelatedParams[key](category, key, val)
  }
  return [
    [['overrides', category, 'children', key, 'default_value']], [val]
  ];
};

const getMaterualConfigParams = function (key, val) {
  return [
    [['overrides', key, 'default_value']], [val]
  ];
};


module.exports = {
  modifyConfigFile,
  getModelPosConfigPath,
  getModifyConfigParams,
  getMaterualConfigParams
};
