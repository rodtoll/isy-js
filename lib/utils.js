"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.byteToPct = byteToPct;
exports.pctToByte = pctToByte;
exports.byteToDegree = byteToDegree;
exports.getAsync = getAsync;
exports.getCategory = getCategory;
exports.getSubcategory = getSubcategory;

var _isyconstants = require("./isyconstants");

var _restler = require("restler");

var rest = _interopRequireWildcard(_restler);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function byteToPct(value) {
    return Math.floor(value * 100 / 255);
}
function pctToByte(value) {
    return Math.ceil(value * 255 / 100);
}

function byteToDegree(value) {
    return Math.fround(value / 2);
}

function getAsync(url, options) {
    return new Promise((resolve, reject) => rest.get(url, options).on('complete', result => {
        resolve(result);
    }).on('error', (err, response) => {
        reject(err);
    }).on('fail', (data, response) => {
        reject(data);
    }).on('abort', () => {

        reject();
    }).on('timeout', ms => {
        reject(ms);
    }));
}

function getCategory(device) {
    try {
        let s = device.type.split('.');
        return Number(s[0]);
    } catch (err) {
        return _isyconstants.Categories.unknown;
    }
}
function getSubcategory(device) {
    try {
        let s = device.type.split('.');
        return Number(s[1]);
    } catch (err) {
        return _isyconstants.Categories.unknown;
    }
}