import { ISY } from './isy';
import { Commands, DeviceTypes, Families, Props, States } from './isyconstants';
import { ISYBinaryStateDevice, ISYDevice, ISYLevelDevice } from './isydevice';
import { byteToDegree, byteToPct, pctToByte } from './utils';
//import { InsteonNLS } from './insteonfam'

export class InsteonBaseDevice extends ISYDevice {
	constructor(isy: ISY, node: { type: string }) {
		super(isy, node);
		this.family = Families.Insteon;		
		//this.productName = InsteonNLS.getDeviceDescription(String.fromCharCode(category,device,version));
	
		this.childDevices = {};
	}

	public convertFrom(value: any, uom: number): any {
		switch (uom) {
			case 101:
				return byteToDegree(value);
			case 100:
				return byteToPct(value);
			default:
				return super.convertFrom(value, uom);
		}
	}

	public convertTo(value: any, uom: number): any {
		const nuom = super.convertTo(value, uom);
		switch (uom) {
			case 101:
				return nuom * 2;
			case 100:
				return pctToByte(nuom);
			default:
				return nuom;
		}
	}

	public async sendBeep(level: number = 100): Promise<any> {
		return this.isy.sendNodeCommand(this, 'BEEP');
	}
}

export const InsteonLampDevice = (InsteonBaseDevice: any) =>
	class extends InsteonBaseDevice{
		constructor(isy: any, node: any) {
			super(isy, node);
			this.isDimmable = true;
		}

		get brightnessLevel() {
			return byteToPct(this.status);
		}

		public updateBrightnessLevel(level: number, resultHandler: any) {
			if (level !== this.brightnessLevel) {
				this.isy.sendRestCommand(
					this.address,
					Commands.On,
					pctToByte(level),
					resultHandler
				);
			}
		}
	};
export const InsteonSwitchDevice = (InsteonBaseDevice: typeof InsteonRelayDevice) =>
	class extends InsteonBaseDevice {
		constructor(isy: any, node: any) {
			super(isy, node);
			
		}

		
	};

export const KeypadDevice = (InsteonBaseDevice: any) =>
	{
		return class extends InsteonBaseDevice {
			constructor (isy: any, node: any) {
				super(isy, node);
			}
		}
	};	


export class InsteonRelayDevice extends ISYBinaryStateDevice(
	InsteonBaseDevice
) {
	constructor(isy: ISY, node: { type: string }) {
		super(isy, node);
		
	}

	get isOn() {
		return this.state;
	}

	public async updateIsOn(isOn: boolean): Promise<any> {
		return super.updateState(isOn);
	}
}

export class InsteonDimmableDevice extends ISYLevelDevice(InsteonRelayDevice) {
	constructor(isy: ISY, node: any) {
		super(isy, node);
		this.isDimmable = true;
	}

	get brightnessLevel()
	{
		return this.level;
	}

	public async updateBrightnessLevel(level: number): Promise<{}> {
		return super.updateLevel(level);
	}
}

export class InsteonRelaySwitchDevice extends InsteonSwitchDevice(
	InsteonRelayDevice
) {
	constructor(isy: any, deviceNode: any) {
		super(isy, deviceNode);
	}
}
export class InsteonOnOffOutletDevice extends InsteonRelayDevice {
	constructor(isy: ISY, deviceNode: any) {
		super(isy, deviceNode);
	}
}

export class InsteonDimmerOutletDevice extends InsteonDimmableDevice {
	constructor(isy: any, deviceNode: any) {
		super(isy, deviceNode);
	}
}

export class InsteonDimmerSwitchDevice extends InsteonSwitchDevice(InsteonDimmableDevice) {
	constructor(isy: any, deviceNode: any) {
		super(isy, deviceNode);
	}
}

export class InsteonKeypadDevice extends InsteonRelayDevice {
	constructor(isy: ISY, deviceNode: any) {
		super(isy, deviceNode);
	}
}

export class InsteonDimmerKeypadDevice extends InsteonDimmableDevice {
	constructor(isy: any, deviceNode: any) {
		super(isy, deviceNode);
	}
}



export class InsteonLockDevice extends ISYBinaryStateDevice(InsteonBaseDevice) {
	constructor(isy: ISY, deviceNode: { type: string }) {
		super(isy, deviceNode);
	}

	public sendLockCommand(lockState: any, resultHandler: any) {
		if (this.deviceType === DeviceTypes.lock) {
			this.sendNonSecureLockCommand(lockState);
		} else if (this.deviceType === DeviceTypes.secureLock) {
			this.sendSecureLockCommand(lockState);
		} else {
			// assert(false, 'Should not ever have lock which is not one of the known lock types');
		}
	}

	get isLocked() {
		return this.state;
	}

	public getCurrentLockState() {
		if (this.deviceType === DeviceTypes.lock) {
			return this.getCurrentNonSecureLockState();
		} else if (this.deviceType === DeviceTypes.secureLock) {
			return this.getCurrentSecureLockState();
		} else {
			// assert(false, 'Should not ever have lock which is not one of the known lock types');
		}
	}

	public async updateIsLocked(isLocked: boolean)
	{
		return super.updateState(isLocked);
	}

	public getCurrentNonSecureLockState() {
		return this.ST !== States.Lock.Locked;
	}

	public getCurrentSecureLockState() {
		return this.ST > 0;
	}

	public async sendNonSecureLockCommand(lockState: any) {
		if (lockState) {
			return this.isy.sendNodeCommand(this, Commands.Lock.Lock);
		} else {
			return this.isy.sendNodeCommand(this, Commands.Lock.Unlock);
		}
	}
	public async sendSecureLockCommand(lockState: any) {
		if (lockState) {
			return this.isy.sendNodeCommand(
				this,
				Commands.On,
				States.SecureLock.Secured
			);
		} else {
			return this.isy.sendNodeCommand(
				this,
				Commands.On,
				States.SecureLock.NotSecured
			);
		}
	}
}

export class InsteonDoorWindowSensorDevice extends ISYBinaryStateDevice(
	InsteonBaseDevice
) {
	constructor(isy: ISY, deviceNode: { type: string }) {
		super(isy, deviceNode);
	}

	get isOpen() {
		return this.state;
	}
}

export class InsteonLeakSensorDevice extends ISYBinaryStateDevice(
	InsteonBaseDevice
) {
	constructor(isy: ISY, deviceNode: { type: string }) {
		super(isy, deviceNode);
	}

	get leakDetected() {
		return this.state;
	}
}

export class InsteonCOSensorDevice extends ISYBinaryStateDevice(
	InsteonBaseDevice
) {
	constructor(isy: ISY, deviceNode: { type: string }) {
		super(isy, deviceNode);
	}

	get monoxideDetected() {
		return this.state;
	}
}

export class InsteonMotionSensorDevice extends InsteonBaseDevice {
	constructor(isy: ISY, deviceNode: { type: string }) {
		super(isy, deviceNode);
		this._isMotionDetected = false;
	}

	public handleEvent(event: { control: string }) {
		if (!super.handleEvent(event)) {
			if (event.control === Commands.On) {
				this.logger('Motion detected.');
				this._isMotionDetected = true;

				this.propertyChanged.emit('', 'motionDetected', true, true);

				setTimeout(() => {
					this.logger('No motion detected in last 30 seconds.');
					this._isMotionDetected = false;
					this.propertyChanged.emit('', 'motionDetected', false, false);
				}, 30000);
			} else if (event.control === Commands.Off) {
				this._isMotionDetected = false;
				this.logger('No motion detected.');
				this.propertyChanged.emit('', 'motionDetected', false, false);
			}
		}
		return true;
	}

	get isMotionDetected() {
		return this._isMotionDetected;
	}
}

export class InsteonThermostatDevice extends InsteonBaseDevice {
	constructor(isy: ISY, deviceNode: { type: string }) {
		super(isy, deviceNode);
	}

	get currentTemperature() {
		return this.ST;
	}

	get coolSetPoint() {
		return this[Props.Climate.CoolSetPoint];
	}
	get heatSetPoint() {
		return this[Props.Climate.HeatSetPoint];
	}
	get mode() {
		return this[Props.Climate.Mode];
	}
	get operatingMode() {
		return this[Props.Climate.OperatingMode];
	}
	get fanMode() {
		return this[Props.Climate.FanMode];
	}
	get humidity() {
		return this[Props.Climate.Humidity];
	}

	public async updateCoolSetPoint(value: string) {
		return this.updateProperty(Props.Climate.CoolSetPoint, value);
	}

	public async updateHeatSetPoint(value: string) {
		return this.updateProperty(Props.Climate.HeatSetPoint, value);
	}

	public async updateMode(value: string) {
		return this.updateProperty(Props.Climate.Mode, value);
	}
}

export class InsteonOutletDevice extends InsteonRelayDevice {
	constructor(isy: ISY, deviceNode: any) {
		super(isy, deviceNode);
	}
}

export class InsteonFanDevice extends ISYLevelDevice(
	ISYBinaryStateDevice(InsteonBaseDevice)
) {
	constructor(isy: ISY, deviceNode: { type: string }) {
		super(isy, deviceNode);
	}

	public Light : InsteonDimmableDevice;

	get isOn() {
		return this.state;
	}

	get fanSpeed() {
		return this.level;
	}

	public addChild(childDevice: ISYDevice)
	{
		super.addChild(childDevice);
		if(childDevice instanceof InsteonDimmableDevice)
		{
			this.Light = childDevice;
			
		}

	}

	public async updateFanSpeed(level: number) {
		return this.updateLevel(level);
	}

	public async updateIsOn(isOn: boolean) {
		if (!isOn) {
			this.updateLevel(States.Level.Min);
		} else {
			this.updateLevel(States.Level.Max);
		}
	}
}
