Object.defineProperty(exports, "__esModule", { value: true });
const restler_1 = require("restler");
const Categories_1 = require("./Categories");
//import { get } from 'http';
function byteToPct(value) {
    return Math.round((value * 100) / 255);
}
exports.byteToPct = byteToPct;
function pctToByte(value) {
    return Math.round((value * 255) / 100);
}
exports.pctToByte = pctToByte;
function byteToDegree(value) {
    return Math.fround(value / 2);
}
exports.byteToDegree = byteToDegree;
let lastrequest = Promise.resolve();
async function getAsync(url, options) {
    const p = new Promise((resolve, reject) => {
        // console.log('Calling: ' + url);
        restler_1.get(url, options)
            .on('complete', (result) => {
            //console.log(JSON.stringify(result));
            resolve(result);
        })
            .on('error', (err, response) => {
            reject(err);
        })
            .on('fail', (data, response) => {
            reject(data);
        })
            .on('abort', () => {
            reject();
        })
            .on('timeout', (ms) => {
            reject(ms);
        });
    });
    await lastrequest;
    lastrequest = p;
    return p;
}
exports.getAsync = getAsync;
var Family;
(function (Family) {
    Family[Family["Insteon"] = 1] = "Insteon";
    Family[Family["UPB"] = 7] = "UPB";
})(Family = exports.Family || (exports.Family = {}));
function getCategory(device) {
    try {
        const s = device.type.split('.');
        return Number(s[0]);
    }
    catch (err) {
        return Categories_1.Categories.Unknown;
    }
}
exports.getCategory = getCategory;
function getSubcategory(device) {
    try {
        const s = device.type.split('.');
        return Number(s[1]);
    }
    catch (err) {
        return Categories_1.Categories.Unknown;
    }
}
exports.getSubcategory = getSubcategory;
