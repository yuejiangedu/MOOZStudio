# 概述
## 本项目基于开源软件 CNCJS 基础上进行二次开发, 专用于实现 MOOZ 的硬件控制

## 将包括以下功能

- [ ] 激光雕刻

- [ ] CNC 雕刻

- [ ] 3D打印

## 开发流程

`yarn` 安装依赖

`yarn dev` 启动开发环境

`yarn build:win-x64` 打包 64 位 windows 客户端

`yarn build:win-ia32` 打包 32 位 windows 客户端

`yarn build:mac-x64` 打包 macOS 客户端

以下为原软件翻译的 README, 可对其有更深入的了解

# CNCjs 

[![NPM](https://nodei.co/npm/cncjs.png?downloads=true&stars=true)](https://www.npmjs.com/package/cncjs)
![cncjs](https://raw.githubusercontent.com/cncjs/cncjs/master/media/banner.png)

CNCjs 是一个完整功能并给予 web 接口的 CNC 控制器, 包括 [Grbl](https://github.com/grbl/grbl), [Marlin](https://github.com/MarlinFirmware/Marlin), [Smoothieware](https://github.com/Smoothieware/Smoothieware), or [TinyG](https://github.com/synthetos/TinyG).

如果需要更多的信息请参考 wiki [Introduction](https://github.com/cncjs/cncjs/wiki/Introduction) 

![cncjs](https://cloud.githubusercontent.com/assets/447801/24392019/aa2d725e-13c4-11e7-9538-fd5f746a2130.png)

## 功能

* 支持的控制器
    - [Grbl](https://github.com/gnea/grbl) ([Download](https://github.com/gnea/grbl/releases))
    - [Grbl-Mega](https://github.com/gnea/grbl-Mega) ([Download](https://github.com/gnea/grbl-Mega/releases))
    - [Marlin](https://github.com/MarlinFirmware/Marlin) ([Download](http://marlinfw.org/meta/download/))
    - [Smoothieware](https://github.com/Smoothieware/Smoothieware) ([Download](https://github.com/Smoothieware/Smoothieware/tree/edge/FirmwareBin))
    - [TinyG](https://github.com/synthetos/TinyG) (_Recommend: firmware version 0.97 build 449.xx_) ([Download](http://synthetos.github.io/))
    - [g2core](https://github.com/synthetos/g2)
* [跨平台桌面端应用 Linux, Mac OS X, and Windows](https://github.com/cncjs/cncjs/wiki/Desktop-App)
*  6 轴数字读出 6-axis digital readout (DRO)
* 3D 虚拟化路径工具
* 多个客户端进行同时通信
* 响应式布局, 适配小于 720 px 的小屏
    - <i>Safari on an iPhone 5S</i> [\[1\]](https://cloud.githubusercontent.com/assets/447801/15633749/b817cd4a-25e7-11e6-9beb-600c65ea1324.PNG) [\[2\]](https://cloud.githubusercontent.com/assets/447801/15633750/b819b5f6-25e7-11e6-8bfe-d3e6247e443b.PNG)
* 可自定义的工作区
* [自定义组件](https://github.com/cncjs/cncjs-widget-boilerplate) (since 1.9.10)
* 自定义MDI (Multiple Document Interface) 命令按钮 (since 1.9.13)
* 账户
* 命令
* 事件
* [键盘快捷键](https://cnc.js.org/docs/user-guide/#keyboard-shortcuts)
* [Contour ShuttleXpress](https://cnc.js.org/docs/user-guide/#contour-shuttlexpress)
* 多语言支持 
* 资源管理
* [工具更换](https://github.com/cncjs/cncjs/wiki/Tool-Change) (since 1.9.11)
* Z-Probe

## 自定义组件

* [自定义组件模板](https://github.com/cncjs/cncjs-widget-boilerplate) - 为 CNCJS 创建自定义的组件

## 挂件

### 模板代码

* [样板文件]](https://github.com/cncjs/cncjs-pendant-boilerplate) - 开发挂件的最小代码文件

### 已有的挂件

* [cncjs-pendant-keyboard](https://github.com/cncjs/cncjs-pendant-keyboard) - 一个简单的使用无线或 usb 键盘的挂件
* [cncjs-pendant-lcd](https://github.com/cncjs/cncjs-pendant-lcd) - 为树莓派提供触摸显示
* [cncjs-pendant-ps3](https://github.com/cncjs/cncjs-pendant-ps3) - Dual Shock / PS3 蓝牙远程挂件
* [cncjs-pendant-raspi-gpio](https://github.com/cncjs/cncjs-pendant-raspi-gpio) - 树莓派的 GPIO 控制挂件

## 平板 UI

* [cncjs-pendant-tinyweb](https://github.com/cncjs/cncjs-pendant-tinyweb) -  一个最小化网页调试窗口 320x240 LCD 显示.<br>
    ![cncjs-pendant-tinyweb](https://raw.githubusercontent.com/cncjs/cncjs/master/media/tinyweb-axes.png)
* [cncjs-shopfloor-tablet](https://github.com/cncjs/cncjs-shopfloor-tablet) - 一个简化的为平板优化的 UI<br>
    ![cncjs-shopfloor-tablet](https://user-images.githubusercontent.com/4861133/33970662-4a8244b2-e018-11e7-92ab-5a379e3de461.PNG)

## 浏览器支持

![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png)<br>Chrome | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png)<br>Edge | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png)<br>Firefox | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png)<br>IE | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png)<br>Opera | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png)<br>Safari
--- | --- | --- | --- | --- | --- |
 Yes | Yes | Yes| Not supported | Yes | Yes | 

##  Node.js支持

 Version | Supported Level
:------- |:---------------
 4       | Dropped support
 6       | Supported
 8       | Supported
 10      | Supported

## 上手指南

### Node.js 安装

安装 6 以上的[版本](https://nodejs.org/en/)

### 安装

使用非 root 权限安装 CNCJS 否则 [serialport](https://github.com/node-serialport/node-serialport) 模块可能在某些平台(比如树莓派)不会正常安装
```
npm install -g cncjs
```

如果要使用 sudo 或 root 权限安装 cncjs, 需要使用具体的命令选项 `--unsafe-perm` 来执行 root 权限
```
sudo npm install --unsafe-perm -g cncjs
```

参考其他安装方式[https://github.com/cncjs/cncjs/wiki/Installation](https://github.com/cncjs/cncjs/wiki/Installation)


### 使用

运行`cncjs`来启动服务器,访问 `http://yourhostname:8000/` 查看 web 页面, 添加 `--help` 在 `cncjs`后 来获取更多信息, 如下

```
pi@rpi3$ cncjs -h

  Usage: cncjs [options]


  Options:

    -V, --version                       output the version number
    -p, --port <port>                   Set listen port (default: 8000)
    -H, --host <host>                   Set listen address or hostname (default: 0.0.0.0)
    -b, --backlog <backlog>             Set listen backlog (default: 511)
    -c, --config <filename>             Set config file (default: ~/.cncrc)
    -v, --verbose                       Increase the verbosity level (-v, -vv, -vvv)
    -m, --mount <route-path>:<target>   Add a mount point for serving static files
    -w, --watch-directory <path>        Watch a directory for changes
    --access-token-lifetime <lifetime>  Access token lifetime in seconds or a time span string (default: 30d)
    --allow-remote-access               Allow remote access to the server (default: false)
    --controller <type>                 Specify CNC controller: Grbl|Marlin|Smoothie|TinyG|g2core (default: '')
    -h, --help                          output usage information

  Examples:

    $ cncjs -vv
    $ cncjs --mount /pendant:/home/pi/tinyweb
    $ cncjs --mount /widget:~+/widget --mount /pendant:~/pendant
    $ cncjs --mount /widget:https://cncjs.github.io/cncjs-widget-boilerplate/v1/
    $ cncjs --watch-directory /home/pi/watch
    $ cncjs --access-token-lifetime 60d  # e.g. 3600, 30m, 12h, 30d
    $ cncjs --allow-remote-access
    $ cncjs --controller Grbl
```

如果不通过命令行选项 `--watch-directory`, `--access-token-lifetime`, `--allow-remote-access`, 和 `--controller`, 可以创建一个 `~/.cncrc` 文件包含如下的JSON格式的配置:
```json
{
    "mountPoints": [
        {
            "route": "/pendant",
            "target": "/home/pi/tinyweb"
        },
        {
            "route": "/widget",
            "target": "https://cncjs.github.io/cncjs-widget-boilerplate/v1/"
        }
    ],
    "watchDirectory": "/path/to/dir",
    "accessTokenLifetime": "30d",
    "allowRemoteAccess": false,
    "controller": ""
}
```

### 配置文件

配置文件 <b>.cncrc</b> 包含了与命令行相同的的配置项, 配置文件储存在用户 home 目录, 为了找到 home 目录, 可使用以下命令

* Linux/Mac
  ```sh
  echo $HOME
  ```

* Windows
  ```sh
  echo %USERPROFILE%
  ```

 [点击此处](https://github.com/cncjs/cncjs/blob/master/examples/.cncrc)查看配置样例.

### 文件格式

[点击查看](https://github.com/cncjs/cncjs/issues/242#issuecomment-352294549)更详细的解释

```json
{
  "ports": [
     {
       "comName": "/dev/ttyAMA0",
       "manufacturer": ""
     }
  ],
  "baudrates": [115200, 250000],
  "mountPoints": [
    {
      "route": "/widget",
      "target": "https://cncjs.github.io/cncjs-widget-boilerplate/v1/"
    }
  ],
  "watchDirectory": "/path/to/dir",
  "accessTokenLifetime": "30d",
  "allowRemoteAccess": false,
  "controller": "",
  "state": {
    "checkForUpdates": true,
    "controller": {
      "exception": {
        "ignoreErrors": false
      }
    }
  },
  "commands": [
    {
      "title": "Update (root user)",
      "commands": "sudo npm install -g cncjs@latest --unsafe-perm; pkill -a -f cncjs"
    },
    {
      "title": "Update (non-root user)",
      "commands": "npm install -g cncjs@latest; pkill -a -f cncjs"
    },
    {
      "title": "Reboot",
      "commands": "sudo /sbin/reboot"
    },
    {
      "title": "Shutdown",
      "commands": "sudo /sbin/shutdown"
    }
  ],
  "events": [],
  "macros": [],
  "users": []
}
```

## 文档

https://cnc.js.org/docs/

## 样例

有一些 gcode 格式文件在`example`文件夹中可以使用 GCode 组件加载 GCode 代码并尝试运行

如果没有 CAM 软件, 尝试使用[jscut](http://jscut.org/) 来将 *.svg 转成 GCode.  这是一个可以运行在 web 上非常小的 CAM 包

点击此处查看 [demo](http://jscut.org/jscut.html) .

## 本地化

You can help translate resource files in both of [app](https://github.com/cncjs/cncjs/tree/master/src/app/i18n) and [web](https://github.com/cncjs/cncjs/tree/master/src/web/i18n) directories from English to other languages. Check out [Localization guide](https://github.com/cncjs/cncjs/blob/master/CONTRIBUTING.md#localization) to learn how to get started. If you are not familiar with GitHub development, you can [open an issue](https://github.com/cncjs/cncjs/issues) or send your translations to cheton@gmail.com.

Locale | Language | Status | Contributors 
:----- | :------- | :----- | :-----------
[cs](https://github.com/cncjs/cncjs/tree/master/src/web/i18n/cs) | Čeština (Czech) | ✔ | [Miroslav Zuzelka](https://github.com/dronecz)
[de](https://github.com/cncjs/cncjs/tree/master/src/web/i18n/de) | Deutsch (German) | ✔ | [Thorsten Godau](https://github.com/dl9sec), [Max B.](https://github.com/mbs38)
[es](https://github.com/cncjs/cncjs/tree/master/src/web/i18n/es) | Español (Spanish) | ✔ | [Juan Biondi](https://github.com/yeyeto2788)
[fr](https://github.com/cncjs/cncjs/tree/master/src/web/i18n/fr) | Français (French) | ✔ | [Simon Maillard](https://github.com/maisim), [CorentinBrulé](https://github.com/CorentinBrule)
[hu](https://github.com/cncjs/cncjs/tree/master/src/web/i18n/hu) | Magyar (Hungarian) | ✔ | Sipos Péter
[it](https://github.com/cncjs/cncjs/tree/master/src/web/i18n/it) | Italiano (Italian) | ✔ | [vince87](https://github.com/vince87)
[ja](https://github.com/cncjs/cncjs/tree/master/src/web/i18n/ja) | 日本語 (Japanese) | ✔ | [Naoki Okamoto](https://github.com/toonaoki)
[nl](https://github.com/cncjs/cncjs/tree/master/src/web/i18n/nl) | Nederlands (Netherlands) | ✔ | [dutchpatriot](https://github.com/dutchpatriot)
[pt-br](https://github.com/cncjs/cncjs/tree/master/src/web/i18n/pt-br) | Português (Brasil) | ✔ | [cmsteinBR](https://github.com/cmsteinBR)
[ru](https://github.com/cncjs/cncjs/tree/master/src/web/i18n/ru) | Ру́сский (Russian) | ✔ | [Denis Yusupov](https://github.com/minithc)
[tr](https://github.com/cncjs/cncjs/tree/master/src/web/i18n/tr) | Türkçe (Turkish) | ✔ | Ali GÜNDOĞDU
[zh-cn](https://github.com/cncjs/cncjs/tree/master/src/web/i18n/zh-cn) | 简体中文 (Simplified Chinese) | ✔ | [Mandy Chien](https://github.com/MandyChien), [Terry Lee](https://github.com/TerryShampoo)
[zh-tw](https://github.com/cncjs/cncjs/tree/master/src/web/i18n/zh-tw) | 繁體中文 (Traditional Chinese) | ✔ | [Cheton Wu](https://github.com/cheton)

## License

Licensed under the [MIT License](https://raw.githubusercontent.com/cncjs/cncjs/master/LICENSE).
