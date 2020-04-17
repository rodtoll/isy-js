import { Family } from '../../Families';
import { ISYDevice } from '../ISYDevice';
export declare class ELKAlarmPanelDevice extends ISYDevice<Family> {
    alarmTripState: AlarmTripState;
    alarmState: AlarmState;
    alarmMode: AlarmMode;
    constructor(isy: any, area: any, node: any);
    sendCommand(command: any): Promise<any>;
    sendSetAlarmModeCommand(alarmState: any): Promise<any>;
    clearAllBypasses(): Promise<any>;
    getAlarmStatusAsText(): string;
    getAlarmTripState(): AlarmTripState;
    getAlarmState(): AlarmState;
    getAlarmMode(): AlarmMode;
    handleEvent(event: any): boolean;
}
export declare enum AlarmPanelProperty {
    AlarmMode = 3,
    AlarmState = 2,
    AlarmTripState = 1
}
export declare enum AlarmMode {
    DISARMED = 0,
    AWAY = 1,
    STAY = 2,
    STAY_INSTANT = 3,
    NIGHT = 4,
    NIGHT_INSTANT = 5,
    VACATION = 6
}
export declare enum AlarmTripState {
    DISARMED = 0,
    EXIT_DELAY = 1,
    TRIPPED = 2
}
export declare enum AlarmState {
    NOT_READY_TO_ARM = 0,
    READY_TO_ARM = 1,
    READY_TO_ARM_VIOLATION = 2,
    ARMED_WITH_TIMER = 3,
    ARMED_FULLY = 4,
    FORCE_ARMED_VIOLATION = 5,
    ARMED_WITH_BYPASS = 6
}
export declare class ElkAlarmSensorDevice extends ISYDevice<Family> {
    constructor(isy: any, name: any, area: any, zone: any, deviceType: any);
    sendBypassToggleCommand(): Promise<any>;
    getPhysicalState(): any;
    isBypassed(): boolean;
    getLogicalState(): any;
    getCurrentDoorWindowState(): boolean;
    getSensorStatus(): string;
    isPresent(): boolean;
    handleEvent(event: any): boolean;
}
