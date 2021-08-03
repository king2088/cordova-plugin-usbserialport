# cordova-plugin-usbserialport

**[阅读中文版README.md](./README.md)**  
  
This plug-in is modified according to [cordovarduino](https://github.com/xseignard/cordovarduino) and updated [usb-serial-for-android](https://github.com/mik3y/usb-serial-for-android) library.

## Description

This Cordova/Phonegap plugin allows two-way serial communication using *USB On-The-Go* (OTG) from your Android device to your usb serial port board or other USB-powered serial IO device.

And that means that ability to give your cordova-plugin-usbserialport project a mobile app (web-view) interface as well as powering it using the rechargeable battery on your phone!

### Install it

From the root folder of your cordova project, run :

```bash
cordova plugin add cordova-plugin-usbserialport
# or
cordova plugin add https://github.com/king2088/cordova-plugin-usbserialport.git
```

### How to use it

Your first need to understand how to create and upload a simple Cordova Project. Here is some info on [how to get started](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html) with Cordova on Android, and here is a [simple Cordova plugin](https://github.com/apache/cordova-plugin-vibration) you can use to get familiar with the plugin system.

The plugin API for this behaves as follows:

Because you're polite, first request the permission to use the serial port to the system:

```js
usbSerialPort.requestPermission(function success(), function error());
```

You can get device infomation:

```js
usbSerialPort.getDevice(function success(), function error());
```

You can get open status:

```js
usbSerialPort.isOpen(function success(), function error());
```

You can now open the serial port:

```js
usbSerialPort.open(opts, function success(), function error());
```

`opts` is a JSON object with the following properties:

- baudRate: defaults to 9600
- dataBits: defaults to 8
- stopBits: defaults to 1
- parity: defaults to 0
- dtr: defaults to false (it may be needed to be true for some cordova-plugin-usbserialport)
- rts: defaults to false (it may be needed to be true for some modules, including the monkeyboard dab module)
- sleepOnPause: defaults to true. If false, the the OTG port will remain open when the app goes to the background (or the screen turns off). Otherwise, the port with automatically close, and resume once the app is brought back to foreground.

You're now able to read and write:

```js
usbSerialPort.write(data, function success(), function error());
usbSerialPort.read(function success(buffer), function error());
```

`data` is the string representation to be written to the serial port.
`buffer` is a JavaScript ArrayBuffer containing the data that was just read.

Apart from using `usbSerialPort.write`, you can also use `usbSerialPort.writeHex` to have an easy way to work with **RS232 protocol** driven hardware from your javascript by using **hex-strings**.

In a nutshell, `usbSerialPort.writeHex('ff')` would write just a single byte where `usbSerialPort.write('ff')` would let java write 2 bytes to the serial port.

Apart from that, `usbSerialPort.writeHex` works the same way as `usbSerialPort.write` does.

Register a callback that will be invoked when the driver reads incoming data from your serial device. The success callback function will recieve an ArrayBuffer filled with the data read from serial:

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

And finally close the port:

```js
usbSerialPort.close(function success(), function error())
```

### A Simple Example

A callback-ish example.

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

### A Complete Example

Here is your `index.html`:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *">
        <meta name="format-detection" content="telephone=no">
        <meta name="msapplication-tap-highlight" content="no">
        <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width">
        <link rel="stylesheet" type="text/css" href="css/index.css">
        <title>Hello World</title>
    </head>
    <body>
        <div class="app">
            <h1>Potentiometer value</h1>
            <p>Value <span id="pot">...</span></p>
            <p id="delta">...</p>
            <button id="on">On</button>
            <button id="off">Off</button>
        </div>
        <script type="text/javascript" src="cordova.js"></script>
        <script type="text/javascript" src="js/index.js"></script>
    </body>
</html>
```

Here is the `index.js` file:

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
        // request permission first
        usbSerialPort.requestPermission(
            // if user grants permission
            function(successMessage) {
                // open serial port
                usbSerialPort.open(
                    {baudRate: 9600},
                    // if port is succesfuly opened
                    function(successMessage) {
                        // register the read callback
                        usbSerialPort.readListener(
                            function success(data){
                                // decode the received message
                                var view = new Uint8Array(data);
                                if(view.length >= 1) {
                                    for(var i=0; i < view.length; i++) {
                                        // if we received a \n, the message is complete, display it
                                        if(view[i] == 13) {
                                            // check if the read rate correspond to the cordova-plugin-usbserialport serial print rate
                                            var now = new Date();
                                            delta.innerText = now - lastRead;
                                            lastRead = now;
                                            // display the message
                                            var value = parseInt(str);
                                            pot.innerText = value;
                                            str = '';
                                        }
                                        // if not, concatenate with the begening of the message
                                        else {
                                            var temp_str = String.fromCharCode(view[i]);
                                            var str_esc = escape(temp_str);
                                            str += unescape(str_esc);
                                        }
                                    }
                                }
                            },
                            // error attaching the callback
                            errorCallback
                        );
                    },
                    // error opening the port
                    errorCallback
                );
            },
            // user does not grant permission
            errorCallback
        );

        on.onclick = function() {
            usbSerialPort.isOpen(opened => {
                if(opened) {
                    usbSerialPort.write('1');
                }
            }, openError => {
                console.log(`open serial error ：${openError}`)
            })
        };
        off.onclick = function() {
            usbSerialPort.isOpen(opened => {
                if(opened) {
                    usbSerialPort.write('0');
                }
            }, openError => {
                console.log(`open serial error ：${openError}`)
            })
        }
    }
};

app.initialize();
```

### Your Device is not (yet) known?

Thanks to [usb-serial-for-android](https://github.com/mik3y/usb-serial-for-android) library, you can communicate with CDC, FTDI, cordova-plugin-usbserialport and other devices. 

Your device might not be listed over at <https://github.com/mik3y/usb-serial-for-android> .
If you know your devices VID (Vendor ID) and PID (Product ID) you could however try

```js
usbSerialPort.requestPermission({vid: '1d50', pid: '607d'}, function success(), function error()); //hex strings
or
usbSerialPort.requestPermission({vid: 7504, pid: 24701}, function success(), function error()); //integers
```

You can also choose the driver to use. Options are:

- `CdcAcmSerialDriver`
- `Ch34xSerialDriver`
- `Cp21xxSerialDriver`
- `FtdiSerialDriver`
- `ProlificSerialDriver`


It defaults to `CdcAcmSerialDriver` if empty or not one of these (please feel free to add a PR to support more).

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

You can find your devices VID and PID on linux or android using "lsusb" (returning VID:PID in hex) or by looking at your dmesg log.
