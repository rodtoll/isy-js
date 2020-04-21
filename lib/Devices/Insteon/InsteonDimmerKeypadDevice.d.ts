declare const InsteonKeypadDimmerDevice_base: {
    new (isy: any, node: any): {
        [x: string]: any;
        addChild(childDevice: import("../ISYDevice").ISYDevice<import("../../Families").Family.Insteon>): void;
    };
    [x: string]: any;
};
export declare class InsteonKeypadDimmerDevice extends InsteonKeypadDimmerDevice_base {
    constructor(isy: any, deviceNode: any);
}
declare const InsteonKeypadRelayDevice_base: {
    new (isy: any, node: any): {
        [x: string]: any;
        addChild(childDevice: import("../ISYDevice").ISYDevice<import("../../Families").Family.Insteon>): void;
    };
    [x: string]: any;
};
export declare class InsteonKeypadRelayDevice extends InsteonKeypadRelayDevice_base {
    constructor(isy: any, deviceNode: any);
}
export {};
