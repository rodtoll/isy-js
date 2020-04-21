declare const InsteonRelaySwitchDevice_base: {
    new (isy: any, node: any): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class InsteonRelaySwitchDevice extends InsteonRelaySwitchDevice_base {
    constructor(isy: any, deviceNode: any);
}
export {};
