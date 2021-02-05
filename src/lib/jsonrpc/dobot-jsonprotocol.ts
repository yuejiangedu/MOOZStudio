
import JSONPROTOCOL from './jsonprotocol';

export default class DobotJsonProtocol extends JSONPROTOCOL {
  protected _ws: null | WebSocket;

  protected addr: string;

  protected isSocketConnect = false;

  protected handleWebsocketClose: any;

  constructor(addr: string) {
    super();
    this.addr = addr;
    this._ws = null;
  }

  /**
     * 初始化 websocket
     */
  init() {
    return new Promise((resolve, reject) => {
      if (this._ws) {
        return resolve(this._ws);
      }
      this._ws = new WebSocket(this.addr);
      this._ws.onopen = () => {
        this._onSocketOpen();
        resolve(this._ws);
      };
      return null;
    });
  }


  /**
   * 销毁 websocket
   */
  dispose() {
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
  }

  /**
   * 当 websocket 打开时的操作
   */
  _onSocketOpen() {
    if (this._ws) {
      this.isSocketConnect = true;
      this._ws.onmessage = this._onSocketMessage.bind(this);
      this._ws.onclose = this._onSocketClose.bind(this);
      this._ws.onerror = this._onSocketClose.bind(this);
    }
  }

  // override from WebSocket
  _onSocketClose() {
    this._ws = null;
    this.isSocketConnect = false;
    if (typeof this.handleWebsocketClose === 'function') {
      this.handleWebsocketClose();
    }
  }

  // override from WebSocket
  _onSocketMessage(res: any) {
    const json = JSON.parse(res.data);
    this._handleResponse(json);
  }

  // override from JSONPROTOCOL
  _sendMessage(message: any) {
    const toSend = () => {
      const messageText = JSON.stringify(message);
      this._ws && this._ws.send(messageText);
    };
    if (this._ws) {
      toSend();
    } else {
      this.init().then(toSend);
    }
  }

  execTask({ method, params, resolve, reject }: { [index: string]: any }) {
    if (this.isSocketConnect) {
      this.sendRemoteRequest(method, params)
        .then(data => {
          resolve(data);
        })
        .catch(e => {
          reject(Error(e.message));
        });
    }
  }
}
