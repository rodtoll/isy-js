import { Family } from '../../Families';
import { ISYDevice } from '../ISYDevice';


/////////////////////////////
// ELKAlarmPanelDevice

//
export class ELKAlarmPanelDevice extends ISYDevice<Family> {

	 alarmTripState : AlarmTripState;
	 alarmState : AlarmState;
	 alarmMode : AlarmMode;

	constructor (isy, area, node) {
		super(isy, node);

		this.area = area;
		this.alarmTripState = AlarmTripState.DISARMED;
		this.alarmState = AlarmState.NOT_READY_TO_ARM;
		this.alarmMode = AlarmMode.DISARMED;
		// this.name = "Elk Alarm Panel " + area;
		// this.address = "ElkPanel" + area;
		this.deviceFriendlyName = 'Elk Main Alarm Panel';
		this.deviceType = isy.DEVICE_TYPE_ALARM_PANEL;
		this.connectionType = 'Elk Network Module';
		this.batteryOperated = false;
		this.voltage = 71;
		this
			.lastChanged = new Date();
	}


	async sendCommand(command): Promise<any> {

		return this.isy.sendISYCommand(`elk/area/${this.area}/cmd/${command}`);

	}

	async sendSetAlarmModeCommand(alarmState) {
		if (alarmState === 'disarm') {
			return this.sendCommand('disarm');
		}
		else {
			return this.sendCommand(`arm?armType=${alarmState}`);
		}
	}
	async clearAllBypasses() {
		return this.sendCommand('unbypass');
	}
	getAlarmStatusAsText() {
		return `AM [${this.alarmMode}] AS [${this.alarmState}] ATS [${this.alarmTripState}]`;
	}
	getAlarmTripState() {
		return this.alarmTripState;
	}
	getAlarmState() {
		return this.alarmState;
	}
	getAlarmMode() {
		return this.alarmMode;
	}
	handleEvent(event) {
		const areaUpdate = event.eventInfo.ae
		const areaId = areaUpdate.attr.area;
		const updateType = areaUpdate.attr.type;
		const valueToSet = Number(areaUpdate.attr.val);
		let valueChanged = false;
		if (areaId == this.area) {

			if (updateType == AlarmPanelProperty.AlarmTripState) {
				if (this.alarmTripState != valueToSet) {
					this.alarmTripState = valueToSet;
					valueChanged = true;
				}
			}
			else if (updateType == AlarmPanelProperty.AlarmState) {
				if (this.alarmState != valueToSet) {
					this.alarmState = valueToSet;
					valueChanged = true;
				}
			}
			else if (updateType == AlarmPanelProperty.AlarmMode) {
				if (this.alarmMode != valueToSet) {
					this.alarmMode = valueToSet;
					valueChanged = true;
				}
			}
		}
		if (valueChanged) {
			this.lastChanged = new Date();
		}
		return valueChanged;
	}

}

export enum AlarmPanelProperty {
	AlarmMode = 3,
	AlarmState = 2,
	AlarmTripState = 1
}

export  enum AlarmMode
{
	DISARMED = 0,
	AWAY = 1,
	STAY = 2,
	STAY_INSTANT = 3,
	NIGHT = 4,
	NIGHT_INSTANT = 5,
	VACATION = 6
}

export enum AlarmTripState {
	DISARMED = 0,
	EXIT_DELAY = 1,
	TRIPPED = 2

}

export enum AlarmState
{
	NOT_READY_TO_ARM = 0,
	READY_TO_ARM = 1,
	READY_TO_ARM_VIOLATION = 2,
	ARMED_WITH_TIMER = 3,
	ARMED_FULLY = 4,
	FORCE_ARMED_VIOLATION = 5,
	ARMED_WITH_BYPASS = 6

};

// Alarm mode constanrs
ELKAlarmPanelDevice.prototype.ALARM_MODE_DISARMED = 0;
ELKAlarmPanelDevice.prototype.ALARM_MODE_AWAY = 1;
ELKAlarmPanelDevice.prototype.ALARM_MODE_STAY = 2;
ELKAlarmPanelDevice.prototype.ALARM_MODE_STAY_INSTANT = 3;
ELKAlarmPanelDevice.prototype.ALARM_MODE_NIGHT = 4;
ELKAlarmPanelDevice.prototype.ALARM_MODE_NIGHT_INSTANT = 5;
ELKAlarmPanelDevice.prototype.ALARM_MODE_VACATION = 6;

// Alarm trip state
ELKAlarmPanelDevice.prototype.ALARM_TRIP_STATE_DISARMED = 0;
ELKAlarmPanelDevice.prototype.ALARM_TRIP_STATE_EXIT_DELAY = 1;
ELKAlarmPanelDevice.prototype.ALARM_TRIP_STATE_TRIPPED = 2;

// Alarm state
ELKAlarmPanelDevice.prototype.ALARM_STATE_NOT_READY_TO_ARM = 0;
ELKAlarmPanelDevice.prototype.ALARM_STATE_READY_TO_ARM = 1;
ELKAlarmPanelDevice.prototype.ALARM_STATE_READY_TO_ARM_VIOLATION = 2;
ELKAlarmPanelDevice.prototype.ALARM_STATE_ARMED_WITH_TIMER = 3;
ELKAlarmPanelDevice.prototype.ALARM_STATE_ARMED_FULLY = 4;
ELKAlarmPanelDevice.prototype.ALARM_STATE_FORCE_ARMED_VIOLATION = 5;
ELKAlarmPanelDevice.prototype.ALARM_STATE_ARMED_WITH_BYPASS = 6;








/////////////////////////////
// ELKAlarmSensor
//
export class ElkAlarmSensorDevice extends ISYDevice<Family> {
	constructor (isy, name, area, zone, deviceType) {
		super(isy, area);

		this.area = area;
		this.zone = zone;
		// this.name = name;
		// this.address = "ElkZone" + zone;
		this.deviceFriendlyName = 'Elk Connected Sensor';
		this.deviceType = deviceType;
		this.connectionType = 'Elk Network';
		this.batteryOperated = false;
		this.physicalState = this.SENSOR_STATE_PHYSICAL_NOT_CONFIGURED;
		this.logicalState = this.SENSOR_STATE_LOGICAL_NORMAL;
		this.lastChanged = new Date();
	}

	async sendBypassToggleCommand() {
		return this.isy.sendISYCommand('elk/zone/' + this.zone + '/cmd/toggle/bypass');
	}
	getPhysicalState() {
		return this.physicalState;
	}
	isBypassed() {
		return (this.logicalState === 3);
	}
	getLogicalState() {
		return this.logicalState;
	}
	getCurrentDoorWindowState() {
		return (this.physicalState == this.SENSOR_STATE_PHYSICAL_OPEN || this.logicalState == this.SENSOR_STATE_LOGICAL_VIOLATED);
	}
	getSensorStatus() {
		return 'PS [' + this.physicalState + '] LS [' + this.logicatState + ']';
	}
	isPresent() {
		if (this.voltage < 65 || this.voltage > 80) {
			return true;
		}
		else {
			return false;
		}
	}
	setFromZoneUpdate(zoneUpdate) {
		const zone = zoneUpdate.attr.zone;
		const updateType = zoneUpdate.attr.type;
		const valueToSet = zoneUpdate.attr.val;
		let valueChanged = false;
		if (zone == this.zone) {
			if (updateType == 51) {
				if (this.logicalState != valueToSet) {
					this.logicalState = valueToSet;
					// Not triggering change update on logical state because physical always follows and don't want double notify.
					// valueChanged = true;
				}
			}
			else if (updateType == 52) {
				if (this.physicalState != valueToSet) {
					this.physicalState = valueToSet;
					valueChanged = true;
				}
			}
			else if (updateType == 53) {
				if (this.voltage != valueToSet) {
					this.voltage = valueToSet;
					valueChanged = true;
				}
			}
		}
		if (valueChanged) {
			this.lastChanged = new Date();
		}
		return valueChanged;
	}
}

// Logical Status for sensors
ElkAlarmSensorDevice.prototype.SENSOR_STATE_PHYSICAL_NOT_CONFIGURED = 0;
ElkAlarmSensorDevice.prototype.SENSOR_STATE_PHYSICAL_OPEN = 1;
ElkAlarmSensorDevice.prototype.SENSOR_STATE_PHYSICAL_EOL = 2;
ElkAlarmSensorDevice.prototype.SENSOR_STATE_PHYSICAL_SHORT = 3;

// Physical status for sensors
ElkAlarmSensorDevice.prototype.SENSOR_STATE_LOGICAL_NORMAL = 0;
ElkAlarmSensorDevice.prototype.SENSOR_STATE_LOGICAL_TROUBLE = 1;
ElkAlarmSensorDevice.prototype.SENSOR_STATE_LOGICAL_VIOLATED = 2;
ElkAlarmSensorDevice.prototype.SENSOR_STATE_LOGICAL_BYPASSED = 3;
