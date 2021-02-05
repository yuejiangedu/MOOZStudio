export default class JSONRPC {
  protected _requestID: number

  protected _openRequests: any;


  constructor() {
    this._requestID = 1;
    this._openRequests = {};
  }

  get requestID() {
    return this._requestID++;
  }

  protected _handleReport(data: any) {
    console.log(this, data);
  }

  protected _sendMessage(request: any) {
    console.log(this, request);
  }

  /**
   * Make an RPC request and retrieve the result.
   * @param {string} method - the remote method to call.
   * @param {object} params - the parameters to pass to the remote method.
   * @returns {Promise} - a promise for the result of the call.
   */
  sendRemoteRequest(method: string, params: any) {
    const requestID = this.requestID;
    const promise = new Promise((resolve, reject) => {
      this._openRequests[requestID] = {
        resolve,
        reject
      };
    });

    this._sendRequest(method, params, requestID);

    return promise;
  }

  _sendRequest(method: string, params: any, id: number) {
    const request: any = {
      jsonrpc: '2.0',
      method,
      params
    };

    if (id !== null) {
      request.id = id;
    }

    return this._sendMessage(request);
  }


  _handleResponse(json: any) {
    const {
      params,
      id,
      method,
    } = json;
    // 没有 ID 为主动上传数据
    if (!id) {
      this._handleReport({ method, params });
      return;
    }
    const openRequest = this._openRequests[id];
    if (typeof openRequest === 'function') {
      if (params) {
        openRequest(params);
      }
    } else if (openRequest) {
      delete this._openRequests[id];
      openRequest.resolve(params);
    }
    delete this._openRequests[id];
  }
}
