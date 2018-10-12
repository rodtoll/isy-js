import { AssertionError} from 'assert';
import { DeviceTypes, Families, Categories, States, Props, Commands } from './isyconstants';
import { ISYBinaryStateDevice, ISYLevelDevice, ISYDevice } from './isydevice';
import { byteToPct, pctToByte, byteToDegree } from './utils';
import { get } from 'https';
import { ISY } from './isy';

export class InsteonBaseDevice extends ISYDevice {
	constructor(isy: ISY, node, productInfo) {
		super(isy, node);
		this.family = Families.Insteon;
		this.productName = productInfo.name;
		this.deviceType = productInfo.deviceType;
		this.batteryOperated = this.deviceType == DeviceTypes.motionSensor;
		this.connectionType = productInfo.connectionType;
		this.deviceFriendlyName = this.deviceType;
        this.childDevices = {};
        
	}


	convertFrom(value: any, uom: Number): any {

		switch (uom) {
			case 101:
				return byteToDegree(value);
			case 100:
				return byteToPct(value);
			default:
				return super.convertFrom(value,uom);
		}
	}

	convertTo(value: any, uom: Number): any {
		let nuom = super.convertTo(value, uom);
		switch (uom) {
			case 101:
				return nuom * 2;
			case 100:
				return pctToByte(nuom);
			default:
				return nuom;
		}
    }
    
    async sendBeep(level : Number = 100) : Promise<any> {
        
         return  this.isy.sendNodeCommand(this,'BEEP');
        
    }
}


export const InsteonLampDevice = InsteonBaseDevice =>
	class extends InsteonBaseDevice {
		constructor(isy, node, productInfo) {
			super(isy, node, productInfo);
			this.isDimmable = true;
		}

		get brightnessLevel() {
			return byteToPct(this.status);
		}

		updateBrightnessLevel(level, resultHandler) {
			if (level != this.brightnessLevel) {
				this.isy.sendRestCommand(this.address, Commands.On, pctToByte(level), resultHandler);
			}
		}
	};
export const InsteonSwitchDevice = InsteonBaseDevice =>
	class extends InsteonBaseDevice {
		constructor(isy, node, productInfo) {
			super(isy, node, productInfo);
			this.isDimmable = true;
		}

		get brightnessLevel() {
			return byteToPct(this.status);
		}

		updateBrightnessLevel(level, resultHandler) {
			if (level != this.brightnessLevel) {
				this.sendCommand(Commands.On, pctToByte(level), resultHandler);
			}
		}
	};

export class InsteonRelayDevice extends ISYBinaryStateDevice(InsteonBaseDevice) {
	constructor(isy :ISY, node, productInfo) {
		super(isy, node, productInfo);
	}

	get isOn() {
    
		return this.state;
	}

	async updateIsOn(isOn :boolean) : Promise<any> {
		return super.updateState(isOn);
	}
}

export class InsteonDimmableDevice extends ISYLevelDevice(InsteonRelayDevice) {
    constructor(isy, node, productInfo) {
        super(isy, node,productInfo);
        this.isDimmable = true;
    }

    get brightnessLevel() {
        return this.level;
    }

    async updateBrightnessLevel(level) : Promise<{}>{
        return super.updateLevel(level);
    }
}


export class InsteonRelaySwitchDevice extends InsteonSwitchDevice(InsteonRelayDevice) {
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

export class InsteonDimmerSwitchDevice extends InsteonDimmableDevice
{
	
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

	sendLockCommand(lockState, resultHandler) {
		if (this.deviceType == DeviceTypes.lock) {
			this.sendNonSecureLockCommand(lockState);
		} else if (this.deviceType == DeviceTypes.secureLock) {
			this.sendSecureLockCommand(lockState);
		} else {
			//assert(false, 'Should not ever have lock which is not one of the known lock types');
		}
	}

	get isLocked() {
		return this.state;
	}

	getCurrentLockState() {
		if (this.deviceType == DeviceTypes.lock) {
			return this.getCurrentNonSecureLockState();
		} else if (this.deviceType == DeviceTypes.secureLock) {
			return this.getCurrentSecureLockState();
		} else {
			//assert(false, 'Should not ever have lock which is not one of the known lock types');
		}
	}

	getCurrentNonSecureLockState() {
		return this.ST != States.Lock.Locked;
	}

	getCurrentSecureLockState() {
		return this.ST > 0;
	}

	async sendNonSecureLockCommand(lockState) {
		if (lockState) {
			return this.isy.sendNodeCommand(this, Commands.Lock.Lock);
		} else {
			return this.isy.sendNodeCommand(this, Commands.Lock.Unlock);
		}
	}
	async sendSecureLockCommand(lockState) {
		if (lockState) {
			return this.isy.sendNodeCommand(this, Commands.On, States.SecureLock.Secured);
		} else {
			return this.isy.sendNodeCommand(
				this,
				Commands.On,
				States.SecureLock.NotSecured
				
			);
		}
	}
}

export class InsteonDoorWindowSensorDevice extends ISYBinaryStateDevice(InsteonBaseDevice) {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}

	get isOpen() {
		return this.state;
	}
}

export class InsteonMotionSensorDevice extends InsteonBaseDevice {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
		this._isMotionDetected = false;
	}

	handleEvent(event) {
		if (!super.handleEvent(event)) {
			if (event.control == Commands.On) {
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
    get humidity(){
		return this[Props.Climate.Humidity];
	}

	async updateCoolSetPoint(value) {
		return this.updateProperty(Props.Climate.CoolSetPoint, value);
	}

	async updateHeatSetPoint(value) {
		return this.updateProperty(Props.Climate.HeatSetPoint, value);
	}

	async updateMode(value) {
		return this.updateProperty(Props.Climate.Mode, value);
	}
}

export class InsteonOutletDevice extends InsteonRelayDevice {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}
}

export class InsteonFanDevice extends ISYLevelDevice(ISYBinaryStateDevice(InsteonBaseDevice)) {
	constructor(isy, deviceNode, productInfo) {
		super(isy, deviceNode, productInfo);
	}

	get isOn() {
		return this.state;
	}

	get fanSpeed() {
		return this.level;
	}

	async updateFanSpeed(level) {
		return this.updateLevel(level);
	}

	async updateIsOn(isOn) {
        if(!isOn)
        {
            this.updateLevel(States.Level.Min);
        }
        else
        {
            this.updateLevel(States.Level.Max);
        }
		
	}
}
