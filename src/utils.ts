import { RequestOptions } from 'https';
import { get } from 'restler';

import { Categories } from './Categories';

//import { get } from 'http';

export function byteToPct(value) {
	return Math.round((value * 100) / 255);
}

export function pctToByte(value) {
	return Math.round((value * 255) / 100);
}

export function byteToDegree(value) {
	return Math.fround(value / 2);
}

let lastrequest = Promise.resolve();

export async function getAsync(url: string, options: RequestOptions): Promise<any> {
	const p = new Promise<any>((resolve, reject) => {
		// console.log('Calling: ' + url);
		get(url, options)
			.on('complete', (result: any) => {
				console.log(JSON.stringify(result));
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

export enum Family {
	Insteon = 1,
	UPB = 7
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
