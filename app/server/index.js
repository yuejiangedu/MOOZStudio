const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('./http');
const DOBOTJSONRPC = require('./socket/dobotJSONRPC');

const app = express();
app.use(express.static(path.join(__dirname, '../app')));

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.all('*', cors());

http.registerApis(app);

app.listen(9093, () => {
  const mooz = new DOBOTJSONRPC();
});
