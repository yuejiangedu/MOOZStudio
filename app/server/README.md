## search 搜索串口
### 发送
```js
{
  jsonrpc: '2.0',
  method: 'SEARCH',
  id:1
}
```
### 收到
```js
// mac
{
  "id":1,
  "method":"SEARCH",
  "jsonrpc":"2.0",
  "params":[
    {
      "path":"/dev/tty.Bluetooth-Incoming-Port"
    },
    {
      "path":"/dev/tty.usbserial-14130",
      "locationId":"14130000",
      "vendorId":"1a86",
      "productId":"7523"
    }
  ]
}
// win
{
  "id":1,
  "method":"SEARCH",
  "jsonrpc":"2.0",
  "params":[
    {
      "path":"COM1",
      "manufacturer":"(��׼�˿�����)",
      "pnpId":"ACPI\\PNP0501\\0"
    },
    {
      "path":"COM5",
      "manufacturer":"wch.cn",
      "serialNumber":"5&16344afa&0&4",
      "pnpId":"USB\\VID_1A86&PID_7523\\5&16344AFA&0&4",
      "locationId":"Port_#0004.Hub_#0001",
      "vendorId":"1A86",
      "productId":"7523"
    }
  ]
}
```
## connect 连接端口
### 发送

```js
{
  "jsonrpc":"2.0",
  "method":"CONNECT",
  "id":1,
  "params":{
    "port":"/dev/tty.usbserial-14130"
  }
}
```

收到

```js
{
  "id":1,
  "method":"CONNECT",
  "jsonrpc":"2.0",
  "params":"ok"
}
```

## getPos 获取坐标

这是一个主动上报的数据, 数据格式为

```js
{
  "jsonrpc":"2.0",
  "method":"GETPOSE",
  "params":{
    "x":15.660004615783691,
    "y":103.41999816894531,
    "z":158.30003356933594,
    "e":0
  }
}
```

## gcode 发送 gcode

```js
{
  "jsonrpc":"2.0",
  "method":"GCODE",
  "id":1,
  "params":{
    "gcode":"G28"
  }
}
```

## running 运行状态

这是一个主动上报的数据, 数据格式为
```js
{
  "jsonrpc":"2.0",
  "method":"RUNNING",
  "params":{
    "isRunning":0
  }
}
```
比如回零的时候, isRunning 就为 false