import { Categories } from "./isyconstants";
import * as rest from "restler";

export function byteToPct(value) {
    return Math.floor(value * 100 / 255);
}
export function pctToByte(value) {
    return Math.ceil(value * 255 / 100);
}

export function byteToDegree(value)
{
    return Math.fround(value/2);
}

export function  getAsync(url,options)
{
    return new Promise((resolve,reject) => rest.get(url,options).on('complete',result =>
    {
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

export function getCategory(device) {
    try {
        let s = device.type.split('.');
        return Number(s[0]);
    }
    catch (err) {
        return Categories.unknown;
    }
}
export function getSubcategory(device) {
    try {
        let s = device.type.split('.');
        return Number(s[1]);
    }
    catch (err) {
        return Categories.unknown;
    }
}