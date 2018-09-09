
import assert from 'assert';
import {DeviceTypes, Families, Categories, States,Props, Commands} from "./isyconstants.js";
import {ISYDevice} from './isydevice.js';
import { byteToPct, pctToByte } from "./utils.js";


export class InsteonBaseDevice extends ISYDevice {
    constructor(/*isy*/ isy, node, productInfo, propertyChangeCallback) {
        super(isy,node,propertyChangeCallback);
        this.family = Families.insteon;
        this.productName = productInfo.name;
        this.deviceType = productInfo.deviceType;
        this.batteryOperated = this.deviceType == DeviceTypes.motionSensor;
        this.connectionType = productInfo.connectionType;
        this._deviceFriendlyName = this.deviceType;
        this.childDevices = {};
        
    }

    get status() {
        return this.ST;
    }
    
    get deviceFriendlyName()
    {
        return this._deviceFriendlyName;
    }

  
}

export const InsteonDimmableDevice = InsteonRelayDevice => class extends InsteonRelayDevice
{
    constructor(isy,node,productInfo)
    {
        super(isy,node,productInfo);
        this.isDimmable = true;
    }

    get brightnessLevel()
    {
        return byteToPct(this.status);
    }

    updateBrightnessLevel(level, resultHandler) {
    
        if(level != this.brightnessLevel)
        {
            this.isy.sendRestCommand(this.address, Commands.on, pctToByte(level), resultHandler);
        }
    }
};

export class InsteonRelayDevice extends InsteonBaseDevice {
    constructor(isy,node,productInfo)
    {
        super(isy, node,productInfo);
    }

    get isOn()
    {
        return this.status > 0;
    }

    updateIsOn(isOn,resultHandler)
    {
        if(isOn != this.isOn)
        {
            this.isy.sendRestCommand(this.address, (isOn) ? Commands.on : Commands.off, null, resultHandler);
        }
    }
}

   
export class InsteonOnOffOutletDevice extends InsteonRelayDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);

    }
}

export class InsteonDimmerOutletDevice extends InsteonDimmableDevice(InsteonRelayDevice)
{
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);

    }

}

export class InsteonSwitchDevice extends InsteonRelayDevice
{}

export class InsteonDimmerSwitchDevice extends InsteonDimmableDevice(InsteonSwitchDevice)
{}

export class InsteonKeypadDevice extends InsteonRelayDevice
{
}

export class InsteonDimmerKeypadDevice extends InsteonDimmableDevice(InsteonKeypadDevice)
{}

export class InsteonLockDevice extends InsteonBaseDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);

    }
    
    sendLockCommand(lockState, resultHandler) {
        if (this.deviceType == this.isy.DEVICE_TYPE_LOCK) {
            this.sendNonSecureLockCommand(lockState, resultHandler);
        } else if (this.deviceType == this.isy.DEVICE_TYPE_SECURE_LOCK) {
            this.sendSecureLockCommand(lockState, resultHandler);
        } else {
            assert(false, 'Should not ever have lock which is not one of the known lock types');
        }
    }

    get isLocked() {
        return this.getCurrentLockState();
    }

    getCurrentLockState() {
        if (this.deviceType == DeviceTypes.lock) {
            return this.getCurrentNonSecureLockState();
        } else if (this.deviceType == DeviceTypes.secureLock) {
            return this.getCurrentSecureLockState();
        } else {
            assert(false, 'Should not ever have lock which is not one of the known lock types');
        }
    }

    getCurrentNonSecureLockState() {
        return (this.ST != States.lockUnlocked);
    }

    getCurrentSecureLockState() {
        return (this.ST > 0);
    }

    sendNonSecureLockCommand(lockState, resultHandler) {
        if (lockState) {
            this.isy.sendRestCommand(this.address, Commands.lock.lock, null, resultHandler);
        } else {
            this.isy.sendRestCommand(this.address, Commands.lock.unlock, null, resultHandler);
        }
    }
    sendSecureLockCommand(lockState, resultHandler) {
        if (lockState) {
            this.isy.sendRestCommand(this.address, Commands.on, States.secureLock.secured, resultHandler);
        } else {
            this.isy.sendRestCommand(this.address, Commands.on, States.secureLock.notSecured, resultHandler);
        }
    }
}

export class InsteonDoorWindowSensorDevice extends InsteonBaseDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);

    }

    get isOpen() {
        return (this.ST != States.doorWindow.open);
    }
}


export class InsteonMotionSensorDevice extends InsteonBaseDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);
        this._isMotionDetected = false;
    }

    handleEvent(event)
    {
        this.logger("handle event entered");
        if(!super.handleEvent(event))
        {
            if(event.control == Commands.on)
            {
                this.logger("motion detected.");
                this._isMotionDetected = true;
                
                this.propertyChanged.once('','motionDetected',true,true);
                
                setTimeout(() => 
                {
                    this.logger("no motion detected in last 30 seconds.")
                    this._isMotionDetected = false;
                    this.propertyChanged.
                    this.propertyChanged.emit('','motionDetected',false,false);
                },30000);
                
            }
            else if (event.control === Commands.off)
            {
                this._isMotionDetected = false;
                this.logger("no motion detected.")
                this.propertyChanged.emit('','motionDetected',false,false);
                
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
        super(isy, deviceNode,productInfo);

    }

    get currentTemperature() {
        return this.ST / 2;
    }

    get coolSetPoint() {
        return this[Props.climate.coolSetPoint] / 2;
    }
    get heatSetPoint() {
        return this[Props.climate.heatSetPoint] / 2;
    }
    get mode() {
        return this[Props.climate.mode];
    }
    get operatingMode() {
        return this[Props.climate.operatingMode];
    }
    get fanMode() {
        return this[Props.climate.fanMode];
    }
    get humidity() {
        return byteToPct(this[Props.climate.humidity]);
    }

    updateCoolSetPoint(value, resultHandler)
    {
        this.isy.sendRestCommand(this.address, Props.climate.coolSetPoint, value * 2, resultHandler);
    }

    updateHeatSetPoint(value, resultHandler) {

        this.isy.sendRestCommand(this.address, Props.climate.heatSetPoint, value * 2, resultHandler);

    }

    updateMode(value, resultHandler) {
        this.isy.sendRestCommand(this.address, Props.climate.mode, value * 2, resultHandler);
    }
}


export class InsteonOutletDevice extends InsteonRelayDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);
    }

    get CurrentOutletState() {
        return (this.status > 0) ? true : false;
    }
    updateOutletState(outletState, resultHandler) {
        this.isy.sendRestCommand(this.address, (outletState) ? Commands.on : Commands.off, null, resultHandler);
    }
}


export class InsteonFanDevice extends InsteonBaseDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);
    }

    get FanState() {
        if (this.status == 0) {
            return Props.fan.off;
        } else if (this.status == States.fan.low) {
            return Props.fan.low;
        } else if (this.status == States.fan.medium) {
            return Props.fan.medium;
        } else if (this.status == States.fan.high) {
            return Props.fan.high;
        } else {
            assert(false, `Unexpected fan state: ${this.status} (${this.formatted.ST})`);
        }
    }

    updateFanState(fanState, resultHandler) {
        if (fanState == Props.fan.off) {
            this.isy.sendRestCommand(this.address, Commands.fan.off, null, resultHandler);
        } else if (fanState == Props.fan.low) {
            this.isy.sendRestCommand(this.address, Commands.fan.on, States.fan.low, resultHandler);
        } else if (fanState == Props.fan.medium) {
            this.isy.sendRestCommand(this.address, Commands.fan.on, States.fan.medium, resultHandler);
        } else if (fanState == Props.fan.high) {
            this.isy.sendRestCommand(this.address, Commands.fan.on, States.fan.high, resultHandler);
        } else {
            assert(false, 'Unexpected fan level: ' + fanState);
        }
    }


   
}

