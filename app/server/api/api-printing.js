const fs = require('fs');
const { handleSlice } = require('../cura');

const sliceModel = (req, res) => {
  const { name, type, model3Ddata, path } = req.body;
  handleSlice({ originName: name, uploadName: `${name}.${type}`, model3Ddata, path }).then((result) => {
    const { gcodeFilePath } = result;
    const data = fs.readFileSync(gcodeFilePath, 'utf-8');
    res.send({ gcode: data.split('\n'), result });
    res.end();
  }).catch((err) => {
    res.send({ err });
    res.end();
  });
};
module.exports = {
  sliceModel
};
