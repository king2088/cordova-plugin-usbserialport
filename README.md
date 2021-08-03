# cordova-plugin-usbserialport

**[Read English README.md](./README.md)**  
此插件是基于[cordovarduino](https://github.com/xseignard/cordovarduino)基础上，升级了[usb-serial-for-android](https://github.com/mik3y/usb-serial-for-android)库后增加了相应的方法，目前可以很好的适用于常见的一些USB/Type-C转串口的串口硬件。使用此插件，可以在android手机上直接使用USB或Type-C接口的USB转458/232等串口。  
**此插件仅适用于Android**

## 简介

此 Cordova/Phonegap 插件允许使用 *USB On-The-Go* (OTG) 从您的 Android 设备到您的串口板或其他USB供电的串行IO设备进行双向串行通信。

这意味着您可以使用 cordova-plugin-usbserialport 插件开发关于串口收发数据的Android应用

### 安装

cordova项目运行:

```bash
cordova plugin add cordovcordova-plugin-usbserialport
```

### 使用方法

您首先需要了解如何创建和上传一个简单的 Cordova 项目。 这里有一些关于 [如何开始](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html) 在 Android 上使用 Cordova 的信息，这里是一个 [简单的 Cordova plugin](https://github.com/apache/cordova-plugin-vibration) 可以用来熟悉插件系统。

使用方法:

android权限的原因，需要首先请求USB权限，使用以下代码请求权限:

```js
usbSerialPort.requestPermission(function success(), function error());
```

获取设备信息（可选）:

```js
usbSerialPort.getDevice(function success(), function error());
```

获取串口打开状态（可选）:

```js
usbSerialPort.isOpen(function success(), function error());
```

其次，打开串口:

```js
usbSerialPort.open(opts, function success(), function error());
```

`opts` 是JSON对象，包含如下属性:  

- baudRate: 波特率，默认9600  
- dataBits: 数据位，默认8  
- stopBits: 停止位，默认1  
- parity: 奇偶检验，默认0  
- dtr: 默认false (对于部分串口需要为true)  
- rts: 默认false (部分模块需要为true, 包括monkeyboard dab 模块)  
- sleepOnPause: 默认true. 如果为 false，则当应用程序进入后台（或屏幕关闭）时，OTG 端口将保持打开状态。 否则，端口会自动关闭，并在应用程序返回前台后恢复。  

再次，写入和读取串口数据:

```js
usbSerialPort.write(data, function success(), function error());
usbSerialPort.read(function success(buffer), function error());
```

`data` 是要写入串行端口的字符串表示形式。  
`buffer` 读取的数据为 JavaScript ArrayBuffer。  
  
除了使用`usbSerialPort.write`，您还可以使用`usbSerialPort.writeHex` 来发送**hex-strings** 并使用**RS232 协议** 驱动的硬件。  

简而言之，`usbSerialPort.writeHex('ff')` 只会写入一个字节，而 `usbSerialPort.write('ff')` 会写入2个到串行端口。  

除此之外，`usbSerialPort.writeHex` 的工作方式与 `usbSerialPort.write` 的工作方式相同。  
  
然后，需要使用 `usbSerialPort.readListener` 监听串口数据返回。返回的数据为ArrayBuffer，可参考如下代码：

```js
usbSerialPort.readListener(
function success(data){
    var view = new Uint8Array(data);
    console.log(view);
},
function error(){
    new Error("Failed to register read callback");
});
```

最后，关闭串口:

```js
usbSerialPort.close(function success(), function error())
```

### 简单的代码示例

```js
var errorCallback = function(message) {
    alert('Error: ' + message);
};

usbSerialPort.requestPermission(
    function(successMessage) {
        usbSerialPort.open(
            {baudRate: 9600},
            function(successMessage) {
                usbSerialPort.write(
                    '1',
                    function(successMessage) {
                        alert(successMessage);
                    },
                    errorCallback
                );
            },
            errorCallback
        );
    },
    errorCallback
);
```

### 完整的示例

创建 `index.html`:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *">
        <meta name="format-detection" content="telephone=no">
        <meta name="msapplication-tap-highlight" content="no">
        <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width">
        <link rel="stylesheet" type="text/css" href="css/index.css">
        <title>串口操作</title>
    </head>
    <body>
        <div class="app">
            <h1>串口操作</h1>
            <p>值 <span id="pot">...</span></p>
            <p id="delta">...</p>
            <button id="on">写入1</button>
            <button id="off">写入0</button>
        </div>
        <script type="text/javascript" src="cordova.js"></script>
        <script type="text/javascript" src="js/index.js"></script>
    </body>
</html>
```

创建 `index.js`:

```js
var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        var potText = document.getElementById('pot');
        var delta = document.getElementById('delta');
        var on = document.getElementById('on');
        var off = document.getElementById('off');
        var str = '';
        var lastRead = new Date();

        var errorCallback = function(message) {
            alert('Error: ' + message);
        };
        // 首先请求USB权限
        usbSerialPort.requestPermission(
            // 如果用户授权
            function(successMessage) {
                // 打开串口
                usbSerialPort.open(
                    {baudRate: 9600},
                    // 如果串口成功打开
                    function(successMessage) {
                        // 监听串口
                        usbSerialPort.readListener(
                            function success(data){
                                // 解码返回的数据
                                var view = new Uint8Array(data);
                                if(view.length >= 1) {
                                    for(var i=0; i < view.length; i++) {
                                        // 如果我们收到一个\n，则消息完成，显示它
                                        if(view[i] == 13) {
                                            // 检查读取速率是否对应于串行打印速率 
                                            var now = new Date();
                                            delta.innerText = now - lastRead;
                                            lastRead = now;
                                            // 显示消息
                                            var value = parseInt(str);
                                            pot.innerText = value;
                                            str = '';
                                        }
                                        // 如果不是\n，则将所有消息累加
                                        else {
                                            var temp_str = String.fromCharCode(view[i]);
                                            var str_esc = escape(temp_str);
                                            str += unescape(str_esc);
                                        }
                                    }
                                }
                            },
                            // 监听错误信息
                            errorCallback
                        );
                    },
                    // 打开串口错误信息
                    errorCallback
                );
            },
            // 未授权错误
            errorCallback
        );

        on.onclick = function() {
            usbSerialPort.isOpen(opened => {
                if(opened) {
                    usbSerialPort.write('1');
                }
            }, err => {
                console.log(`发生错误：${err}`)
            })
        };
        off.onclick = function() {
            usbSerialPort.isOpen(opened => {
                if(opened) {
                    usbSerialPort.write('0');
                }
            }, err => {
                console.log(`发生错误：${err}`)
            })
        }
    }
};

app.initialize();
```

### 您的设备为未知设备？

感谢 [usb-serial-for-android](https://github.com/mik3y/usb-serial-for-android) 库，您可以与 CDC、FTDI、Serial 等设备进行通信。  

您的设备可能未在 <https://github.com/mik3y/usb-serial-for-android> 中列出。  
如果您知道您的设备 VID（供应商 ID）和 PID（产品 ID），您可以尝试  

```js
usbSerialPort.requestPermission({vid: '1d50', pid: '607d'}, function success(), function error()); // 16进制
or
usbSerialPort.requestPermission({vid: 7504, pid: 24701}, function success(), function error()); // 整数
```

您还可以选择要使用的驱动程序。 选项是：

- `CdcAcmSerialDriver`
- `Ch34xSerialDriver`
- `Cp21xxSerialDriver`
- `FtdiSerialDriver`
- `ProlificSerialDriver`

如果为空或不是其中之一，则默认为“CdcAcmSerialDriver”。  

```js
usbSerialPort.requestPermission({
        vid: '1d50',
        pid: '607d',
        driver: 'FtdiSerialDriver' // or any other
    },
    function success(),
    function error()
);
```

您可以使用“lsusb”（以十六进制返回 VID:PID）或查看您的 dmesg 日志在android上找到您的设备 VID 和 PID。
