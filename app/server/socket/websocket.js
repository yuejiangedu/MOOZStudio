const Server = require('ws').Server;

class MOOZWebsocket {
  constructor() {
    this.server = new Server({ port: 9094 });
    this.connection = null;
    this.server.on('error', (err) => {
      console.log('ws error', err);
    });

    this.server.on('connection', (connection) => {
      if (this.connection) {
        console.error('Do not support multiple connections for now');
        this.handleMessage();
      }
      this.connection = connection;
      console.log('ws connected');
      connection.on('message', this.handleMessage.bind(this));
      connection.on('close', this.handleConnectionClean.bind(this));
      connection.on('error', this.handleConnectionClean.bind(this));
    });

    this.server.on('close', () => {
      console.log('ws close');
    });
  }

  handleConnectionClean() {
    if (this.connection) {
      this.connection.removeAllListeners();
      this.connection = null;
    }
  }

  handleMessage() {
    throw Error('Must Override handleMessage', this);
  }

  send(data) {
    this.connection && this.connection.send(data);
  }
}

module.exports = MOOZWebsocket;
