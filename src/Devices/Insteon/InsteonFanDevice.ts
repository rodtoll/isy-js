import { Family } from '../../Families';
import { ISY, ISYNode } from '../../ISY';
import { States } from '../../ISYConstants';
import { ISYBinaryStateDevice, ISYDevice, ISYLevelDevice } from '../ISYDevice';
import { InsteonBaseDevice } from './InsteonBaseDevice';
import { InsteonDimmableDevice } from './InsteonDimmableDevice';

export class InsteonFanMotorDevice extends ISYLevelDevice(ISYBinaryStateDevice(InsteonBaseDevice)) {
    constructor (isy: ISY, deviceNode: {
        type: string;
    }) {
        super(isy, deviceNode);
        this.hidden = true;
    }

    get isOn() {
        return this.state;
    }
    get fanSpeed() {
        return this.level;
    }

    public async updateFanSpeed(level: number) {
        return this.updateLevel(level);
    }
    public async updateIsOn(isOn: boolean) {
        if (!isOn) {
            this.updateLevel(States.Level.Min);
        }
        else {
            this.updateLevel(States.Level.Max);
        }
    }


}

export class InsteonFanDevice extends InsteonBaseDevice {
    constructor (isy: ISY, deviceNode: {
        type: string;
    }) {
        super(isy, deviceNode);
        this.Light = new InsteonDimmableDevice(isy, deviceNode);
        this.addChild(this.Light);

    }
    public Light: InsteonDimmableDevice;
    public Motor: InsteonFanMotorDevice;

    public handleEvent(event): boolean {
        const child = this.children.find(p => p.address === event.node);
        if (child !== undefined) {
            return child.handleEvent(event);
        }
        return null;
    }

    public addChild(childDevice: ISYDevice<Family.Insteon>) {
        super.addChild(childDevice);
        if (childDevice instanceof InsteonFanMotorDevice) {
            this.logger('Fan Motor Found');
            this.Motor = childDevice as InsteonFanMotorDevice;
        }
    }

    public async updateFanSpeed(level: number) {
        return this.Motor.updateLevel(level);
    }
    public async updateIsOn(isOn: boolean) {
        if (!isOn) {
            this.Motor.updateLevel(States.Level.Min);
        }
        else {
            this.updateLevel(States.Fan.High);
        }
    }


}
