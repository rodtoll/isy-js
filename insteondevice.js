
import assert from 'assert';
import {DeviceTypes, Families, Categories, States,Props, Commands} from "./isyconstants.js";
import {ISYDevice,ISYBinaryStateDevice,ISYLevelDevice} from './isydevice.js';
import { byteToPct, pctToByte,byteToDegree } from "./utils.js";
import { get } from 'https';



export class InsteonBaseDevice extends ISYDevice {
    constructor(/*isy*/ isy, node, productInfo, propertyChangeCallback) {
        super(isy,node,propertyChangeCallback);
        this.family = Families.Insteon;
        this.productName = productInfo.name;
        this.deviceType = productInfo.deviceType;
        this.batteryOperated = this.deviceType == DeviceTypes.motionSensor;
        this.connectionType = productInfo.connectionType;
        this.deviceFriendlyName = this.deviceType;
        this.childDevices = {};
        
    }

    get status() {
        return this.ST;
    }
    
    

    convertFrom(value,uom)
    {
        switch(Number(uom))
        {
            case 101:
                return byteToDegree(value);
            case 100:
                return byteToPct(value);
            default:
                return value;
        }
    }

    convertTo(value,uom)
    {
        switch(Number(uom))
        {
            case 101:
                return value * 2;
            case 100:
                return pctToByte(value);
            default:
                return value;

        }
    }
}

export const InsteonDimmableDevice = InsteonRelayDevice => class extends ISYLevelDevice(InsteonRelayDevice)
{
    constructor(isy,node,productInfo)
    {
        super(isy,node,productInfo);
        this.isDimmable = true;
    }

    get brightnessLevel()
    {
        return this.level;
    }

    updateBrightnessLevel(level, resultHandler) {
    
       this.updateLevel(level,resultHandler);
                
    }
};

export const InsteonLampDevice = InsteonBaseDevice => class extends InsteonBaseDevice
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
            this.isy.sendRestCommand(this.address, Commands.On, pctToByte(level), resultHandler);
        }
    }
};
export const InsteonSwitchDevice = InsteonBaseDevice => class extends InsteonBaseDevice
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
            this.sendCommand(Commands.On, pctToByte(level), resultHandler);
        }
    }
};

export class InsteonRelayDevice extends ISYBinaryStateDevice(InsteonBaseDevice) {
    constructor(isy,node,productInfo)
    {
        super(isy, node,productInfo);
    }

    get isOn()
    {
        return this.state;
    }

    updateIsOn(isOn,resultHandler)
    {
       this.updateState(isOn,resultHandler);
    }
}

export class InsteonRelaySwitchDevice extends InsteonSwitchDevice(InsteonRelayDevice)
{
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);

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


export class InsteonDimmerSwitchDevice extends InsteonDimmableDevice(InsteonSwitchDevice(InsteonRelayDevice))
{
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);

    }
}

export class InsteonKeypadDevice extends InsteonRelayDevice
{
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);

    }
}

export class InsteonDimmerKeypadDevice extends InsteonDimmableDevice(InsteonKeypadDevice)
{
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);

    }
}

export class InsteonLockDevice extends InsteonBaseDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);

    }
    
    sendLockCommand(lockState, resultHandler) {
        if (this.deviceType == DeviceTypes.lock) {
            this.sendNonSecureLockCommand(lockState, resultHandler);
        } else if (this.deviceType == DeviceTypes.secureLock) {
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
            this.isy.sendRestCommand(this.address, Commands.On, States.secureLock.secured, resultHandler);
        } else {
            this.isy.sendRestCommand(this.address, Commands.On, States.secureLock.notSecured, resultHandler);
        }
    }
}

export class InsteonDoorWindowSensorDevice extends ISYBinaryStateDevice(InsteonBaseDevice) {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);

    }

    get isOpen() {
        return this.state;
    }
}


export class InsteonMotionSensorDevice extends InsteonBaseDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);
        this._isMotionDetected = false;
    }

    handleEvent(event)
    {
      
        if(!super.handleEvent(event))
        {
            if(event.control == Commands.On)
            {
                this.logger("Motion detected.");
                this._isMotionDetected = true;
                
                this.propertyChanged.emit('','motionDetected',true,true);
                
                setTimeout(() => 
                {
                    this.logger("No motion detected in last 30 seconds.");
                    this._isMotionDetected = false;
                    this.propertyChanged.emit('','motionDetected',false,false);
                },30000);
                
            }
            else if (event.control === Commands.Off)
            {
                this._isMotionDetected = false;
                this.logger("No motion detected.");
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

    updateCoolSetPoint(value, resultHandler)
    {
        this.updateProperty(Props.Climate.CoolSetPoint, value, resultHandler);
    }

    updateHeatSetPoint(value, resultHandler) {

        this.updateProperty(Props.Climate.HeatSetPoint, value, resultHandler);

    }

    updateMode(value, resultHandler) {
        this.updateProperty(Props.Climate.Mode, value,resultHandler);
    }
}


export class InsteonOutletDevice extends InsteonRelayDevice {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);
    }
}


export class InsteonFanDevice extends ISYLevelDevice(ISYBinaryStateDevice(InsteonBaseDevice)) {
    constructor(isy, deviceNode, productInfo) {
        super(isy, deviceNode,productInfo);
    }

    get isOn()
    {
        return this.state;
    }

    get fanSpeed() {
        return this.level;
    }

    updateFanSpeed(level, resultHandler) {
        this.updateLevel(level,resultHandler);
    }

    updateIsOn(isOn, resultHandler) {
        this.updateLevel(States.DimLevel.Max,resultHandler);
    }

}

