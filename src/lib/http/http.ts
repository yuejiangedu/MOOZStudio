import axios from 'axios';

class CustomAxios {
  static baseURL = 'http://localhost:9093/'

  static withCredentials = true;

  static timeout = 10000

  static post(url: string, data: any, option: any = {}) {
    return axios.post(`${this.baseURL}${url}`, data, option);
  }

  static get(url: string, data: any = {}) {
    const query = [];
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        query.push(`${key}=${data[key]}`);
      }
    }
    const queryStr = query.length !== 0 ? `?${query.join('&')}` : '';
    return axios.get(`${this.baseURL}${url}${queryStr}`);
  }
}
export default CustomAxios;
