import { ISYBinaryStateDevice } from './Devices/ISYDevice';
import { InsteonBaseDevice } from './ISY';

export enum Family {
	Insteon = 1,
	UPB = 2,
	ZigBee = 3,
	ZWave = 4,
	Generic = 7,
	Poly = 10
}

export interface Insteon
{
	family : Family.Insteon;
}

export enum EventType {
	PropertyChanged = -1,
	Heartbeat = 0,
	Trigger = 1,
	DriverSpecific = 2,
	NodeChanged = 3,
	SystemConfigChanged = 4,
	SystemStatusChanged = 5,
	InternetAccessChanged = 6,
	ProgressReport = 7,
	SecuritySystem = 8,
	SystemAlert = 9,
	OpenADR = 10,
	Climate = 11,
	APISEP = 12,
	EnergyMonitoring = 13,
	UPBLinker = 14,
	UPBDeviceAdder = 15,
	UPBDeviceStatus = 16,
	GasMeter = 17,
	ZigBee = 18,
	Elk = 19,
	DeviceLinker = 20,
	ZWave = 21,
	Billing = 22,
	Portal = 23

}
class ISYEvent<TAction> {

	action: TAction;
	eventInfo: any;

	constructor(eventData :any) {
		this.action = eventData.action;
		this.eventInfo = eventData.eventInfo;
	}

}

class GenericEvent extends ISYEvent<string>
{

}

class NodeEvent<TActionType> extends ISYEvent<TActionType>
{
	nodeAddress: string;

	constructor (eventData: any) {

		super(eventData);
		this.nodeAddress = eventData.node;
	}
}

class GenericNodeEvent extends NodeEvent<string>
{

}

class PropertyChangedEvent extends NodeEvent<string>
{
	property: string;

	formattedValue: string;

	constructor(eventData: any)
	{
		super(eventData);

		this.property = eventData.control;
		this.formattedValue = eventData.fmtAct;
	}


}
