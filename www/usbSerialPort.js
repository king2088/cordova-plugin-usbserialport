var exec = require('cordova/exec');

exports.requestPermission = function (opts, success, error) {
    if (typeof opts === 'function') {
        error = success;
        success = opts;
        opts = {};
    }
    exec(success, error, 'usbSerialPort', 'requestPermission', [{ 'opts': opts }]);
}
exports.getDevice = function (success, error) {
    exec(success, error, 'usbSerialPort', 'getDeviceInfo', []);
}
exports.open = function (opts, success, error) {
    exec(success, error, 'usbSerialPort', 'openSerial', [{ 'opts': opts }]);
}
exports.isOpen = function (success, error) {
    exec(success, error, 'usbSerialPort', 'isOpen', []);
}
exports.write = function (data, success, error) {
    exec(success, error, 'usbSerialPort', 'writeSerial', [{ 'data': data }]);
}
exports.writeHex = function (hexString, success, error) {
    exec(success, error, 'usbSerialPort', 'writeSerialHex', [{ 'data': hexString }]);
}
exports.read = function (success, error) {
    exec(success, error, 'usbSerialPort', 'readSerial', []);
}
exports.close = function (success, error) {
    exec(success, error, 'usbSerialPort', 'closeSerial', []);
}
exports.readListener = function (success, error) {
    exec(success, error, 'usbSerialPort', 'registerReadCallback', []);
}