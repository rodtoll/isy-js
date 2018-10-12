import {get} from 'restler';
import { Categories } from './isyconstants';

export function byteToPct(value) 
{
    return Math.round(value * 100 / 255);
}
export function pctToByte(value) {
    return Math.round(value * 255 / 100);
}

export function byteToDegree(value) {
    return Math.fround(value / 2);
}

let lastrequest = Promise.resolve();

export async function getAsync(url: string, options): Promise<any> {
    const p = new Promise<any>((resolve, reject) => get(url, options).on('complete', (result) => {
        resolve(result);
    }).on('error', (err, response) => {
       reject(err);
    }).on('fail', (data, response) => {
        reject(data);
    }).on('abort', () => {

       reject();
    }).on('timeout', (ms) => {
        reject(ms);
    }));
    await lastrequest;

    lastrequest = p;

    return p;
}

export function getCategory(device) {
    try {
        const s = device.type.split('.');
        return Number(s[0]);
    } catch (err) {
        return Categories.Unknown;
    }
}
export function getSubcategory(device) {
    try {
        const s = device.type.split('.');
        return Number(s[1]);
    } catch (err) {
        return Categories.Unknown;
    }
}
