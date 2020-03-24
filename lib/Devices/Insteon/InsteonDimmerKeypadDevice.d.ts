declare const InsteonDimmerKeypadDevice_base: {
    new (isy: any, node: any): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class InsteonDimmerKeypadDevice extends InsteonDimmerKeypadDevice_base {
    constructor(isy: any, deviceNode: any);
}
export {};
