import { Categories } from "./isyconstants";

export function byteToPct(value) {
    return Math.floor(value * 100 / 255);
}
export function pctToByte(value) {
    return Math.ceil(value * 255 / 100);
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