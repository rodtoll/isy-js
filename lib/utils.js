"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isyconstants_1 = require("./isyconstants");
const restler_1 = require("restler");
function byteToPct(value) {
    return Math.round(value * 100 / 255);
}
exports.byteToPct = byteToPct;
function pctToByte(value) {
    return Math.round(value * 255 / 100);
}
exports.pctToByte = pctToByte;
function byteToDegree(value) {
    return Math.fround(value / 2);
}
exports.byteToDegree = byteToDegree;
let lastrequest = Promise.resolve();
async function getAsync(url, options) {
    let p = new Promise((resolve, reject) => restler_1.get(url, options).on('complete', result => {
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
    await lastrequest;
    lastrequest = p;
    return p;
}
exports.getAsync = getAsync;
function getCategory(device) {
    try {
        let s = device.type.split('.');
        return Number(s[0]);
    }
    catch (err) {
        return isyconstants_1.Categories.Unknown;
    }
}
exports.getCategory = getCategory;
function getSubcategory(device) {
    try {
        let s = device.type.split('.');
        return Number(s[1]);
    }
    catch (err) {
        return isyconstants_1.Categories.Unknown;
    }
}
exports.getSubcategory = getSubcategory;
