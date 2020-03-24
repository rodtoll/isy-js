import { ISY } from '../../ISY';
import { Commands, DeviceTypes, States } from '../../ISYConstants';
import { ISYBinaryStateDevice } from '../ISYDevice';
import { InsteonBaseDevice } from './InsteonBaseDevice';

export class InsteonLockDevice extends ISYBinaryStateDevice(InsteonBaseDevice) {
	constructor (isy: ISY, deviceNode: {
		type: string;
	}) {
		super(isy, deviceNode);
	}
	public sendLockCommand(lockState: any, resultHandler: any) {
		if (this.deviceType === DeviceTypes.lock) {
			this.sendNonSecureLockCommand(lockState);
		}
		else if (this.deviceType === DeviceTypes.secureLock) {
			this.sendSecureLockCommand(lockState);
		}
		else {
			// assert(false, 'Should not ever have lock which is not one of the known lock types');
		}
	}
	get isLocked() {
		return this.state;
	}
	public getCurrentLockState() {
		if (this.deviceType === DeviceTypes.lock) {
			return this.getCurrentNonSecureLockState();
		}
		else if (this.deviceType === DeviceTypes.secureLock) {
			return this.getCurrentSecureLockState();
		}
		else {
			// assert(false, 'Should not ever have lock which is not one of the known lock types');
		}
	}
	public async updateIsLocked(isLocked: boolean) {
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
		}
		else {
			return this.isy.sendNodeCommand(this, Commands.Lock.Unlock);
		}
	}
	public async sendSecureLockCommand(lockState: any) {
		if (lockState) {
			return this.isy.sendNodeCommand(this, Commands.On, States.SecureLock.Secured);
		}
		else {
			return this.isy.sendNodeCommand(this, Commands.On, States.SecureLock.NotSecured);
		}
	}
}
