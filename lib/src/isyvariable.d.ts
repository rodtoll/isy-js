import { ISY } from './isy';
export declare class ISYVariable {
    isy: ISY;
    id: any;
    name: any;
    value: any;
    init: any;
    type: any;
    lastChanged: Date;
    constructor(isy: ISY, id: string, name: string, type: any);
    markAsChanged(): void;
    sendSetValue(value: any, onComplete: any): void;
    updateValue(value: any): Promise<void>;
}
