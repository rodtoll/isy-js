import { ISYBinaryStateDevice } from './Devices/ISYDevice';

export enum Family {
	Insteon = 1,
	UPB = 2,
	ZigBee = 3,
	ZWave = 4,
	Generic = 7,
	Poly = 10
}

export enum EventType {
	PropertyChanged = '',
	Heartbeat = '_0',
	Trigger = '_1',
	DriverSpecific = '_2',
	NodeChanged = '_3',
	SystemConfigChanged = '_4',
	SystemStatusChanged = '_5',
	InternetAccessChanged = '_6',
	ProgressReport = '_7',
	SecuritySystem = '_8',
	SystemAlert = '_9',
	OpenADR = '_10',
	Climate = '_11',
	APISEP = '_12',
	EnergyMonitoring = '_13',
	UPBLinker = '_14',
	UPBDeviceAdder = '_15',
	UPBDeviceStatus = '_16',
	GasMeter = '_17',
	ZigBee = '_18',
	Elk = '_19',
	DeviceLinker = '_20',
	ZWave = '_21',
	Billing = '_22',
	Portal = '_23'



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
