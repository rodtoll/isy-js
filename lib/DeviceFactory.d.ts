import { ISYDevice } from './ISY';
export declare class DeviceFactory {
    static createDevice(nodeDef: any): {
        name: string;
        modelNumber: string;
        version: string;
        class: typeof ISYDevice;
    };
    static getDeviceDetails(family: number, typeCode: string): {
        name: string;
        modelNumber: string;
        version: string;
        class: typeof ISYDevice;
    };
    static getInsteonDeviceDetails(typeCode: string): {
        name: string;
        modelNumber: string;
        version: string;
        class: typeof ISYDevice;
    };
    static getNLSNetworkBridgeInfo(device: number): any;
    static getNLSIrrigationControlInfo(device: number): string;
    static getNLSSwitchLightInfo(device: number): {
        name: string;
        modelNumber: string;
        version: string;
        class: typeof ISYDevice;
    };
    private static getNLSDimLightInfo;
    private static getNLSControllerInfo;
    private static getNLSIOControlInfo;
    private static getNLSSHS;
    private static getNLSClimateControlInfo;
    private static getNLSAccessControlInfo;
    private static getNLSEnergyManagement;
    private static getNLSWindowsCovering;
}
