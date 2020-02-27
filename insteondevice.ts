import { ISY } from './isy';
import { Commands, DeviceTypes, Families, Props, States } from './isyconstants';
import { ISYBinaryStateDevice, ISYDevice, ISYLevelDevice } from './isydevice';
import { byteToDegree, byteToPct, pctToByte } from './utils';

export class InsteonBaseDevice extends ISYDevice {
	constructor(isy: ISY, node, productInfo) {
		super(isy, node);
		this.family = Families.Insteon;
		this.productName = productInfo.name;
		this.deviceType = productInfo.deviceType;
		this.batteryOperated = this.deviceType === DeviceTypes.motionSensor;
		this.connectionType = productInfo.connectionType;
		this.deviceFriendlyName = this.deviceType;
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

export const InsteonLampDevice = (InsteonBaseDevice) =>
	class extends InsteonBaseDevice{
		constructor(isy, node, productInfo) {
			super(isy, node, productInfo);
			this.isDimmable = true;
		}

		get brightnessLevel() {
			return byteToPct(this.status);
		}

		public updateBrightnessLevel(level, resultHandler) {
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
export const InsteonSwitchDevice = (InsteonBaseDevice) =>
	class extends InsteonBaseDevice {
		constructor(isy, node, productInfo) {
			super(isy, node, productInfo);
			
		}

		
	};

export const KeypadDevice = (InsteonBaseDevice) =>
	class extends InsteonBaseDevice {
		constructor (isy, node, productInfo) {
			super(isy, node, productInfo)
			
		}

		
	};	


export class InsteonRelayDevice extends ISYBinaryStateDevice(
	InsteonBaseDevice
) {
	constructor(isy: ISY, node, productInfo) {
		super(isy, node, productInfo);
	}

	get isOn() {
		return this.state;
	}

	public async updateIsOn(isOn: boolean): Promise<any> {
		return super.updateState(isOn);
	}
}

export class InsteonDimmableDevice extends ISYLevelDevice(InsteonRelayDevice) {
	constructor(isy, node, productInfo) {
		super(isy, node, productInfo);
		this.isDimmable = true;
	}


	public async updateBrightnessLevel(level): Promise<{}> {
		return super.updateLevel(level);
	}
}

export class InsteonRelaySwitchDevice extends InsteonSwitchDevice(
	InsteonRelayDevice
) {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}
}
export class InsteonOnOffOutletDevice extends InsteonRelayDevice {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}
}

export class InsteonDimmerOutletDevice extends InsteonDimmableDevice {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}
}

export class InsteonDimmerSwitchDevice extends InsteonSwitchDevice(InsteonDimmableDevice) {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}
}

export class InsteonKeypadDevice extends InsteonRelayDevice {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}
}

export class InsteonDimmerKeypadDevice extends InsteonDimmableDevice {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}
}



export class InsteonLockDevice extends ISYBinaryStateDevice(InsteonBaseDevice) {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}

	public sendLockCommand(lockState, resultHandler) {
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

	public async sendNonSecureLockCommand(lockState) {
		if (lockState) {
			return this.isy.sendNodeCommand(this, Commands.Lock.Lock);
		} else {
			return this.isy.sendNodeCommand(this, Commands.Lock.Unlock);
		}
	}
	public async sendSecureLockCommand(lockState) {
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
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}

	get isOpen() {
		return this.state;
	}
}

export class InsteonLeakSensorDevice extends ISYBinaryStateDevice(
	InsteonBaseDevice
) {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}

	get leakDetected() {
		return this.state;
	}
}

export class InsteonCOSensorDevice extends ISYBinaryStateDevice(
	InsteonBaseDevice
) {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}

	get monoxideDetected() {
		return this.state;
	}
}

export class InsteonMotionSensorDevice extends InsteonBaseDevice {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
		this._isMotionDetected = false;
	}

	public handleEvent(event) {
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
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
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

	public async updateCoolSetPoint(value) {
		return this.updateProperty(Props.Climate.CoolSetPoint, value);
	}

	public async updateHeatSetPoint(value) {
		return this.updateProperty(Props.Climate.HeatSetPoint, value);
	}

	public async updateMode(value) {
		return this.updateProperty(Props.Climate.Mode, value);
	}
}

export class InsteonOutletDevice extends InsteonRelayDevice {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}
}

export class InsteonFanDevice extends ISYLevelDevice(
	ISYBinaryStateDevice(InsteonBaseDevice)
) {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}

	public Light : InsteonDimmableDevice;

	get isOn() {
		return this.state;
	}

	get fanSpeed() {
		return this.level;
	}

	public addChild(childDevice)
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
