import { ISYDevice } from './isydevice.js';
export declare class ELKAlarmPanelDevice extends ISYDevice {
    constructor(isy: any, area: any, node: any);
    sendSetAlarmModeCommand(alarmState: any): Promise<any>;
    clearAllBypasses(): Promise<any>;
    getAlarmStatusAsText(): string;
    getAlarmTripState(): any;
    getAlarmState(): any;
    getAlarmMode(): any;
    setFromAreaUpdate(areaUpdate: any): boolean;
}
export declare class ElkAlarmSensorDevice extends ISYDevice {
    constructor(isy: any, name: any, area: any, zone: any, deviceType: any);
    sendBypassToggleCommand(): Promise<any>;
    getPhysicalState(): any;
    isBypassed(): boolean;
    getLogicalState(): any;
    getCurrentDoorWindowState(): boolean;
    getSensorStatus(): string;
    isPresent(): boolean;
    setFromZoneUpdate(zoneUpdate: any): boolean;
}
