'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.byteToPct = byteToPct;
exports.pctToByte = pctToByte;
exports.getCategory = getCategory;
exports.getSubcategory = getSubcategory;

var _isyconstants = require('./isyconstants');

function byteToPct(value) {
    return Math.floor(value * 100 / 255);
}
function pctToByte(value) {
    return Math.ceil(value * 255 / 100);
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