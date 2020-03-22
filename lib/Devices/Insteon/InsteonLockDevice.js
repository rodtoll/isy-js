Object.defineProperty(exports, "__esModule", { value: true });
const isyconstants_1 = require("../../isyconstants");
const isydevice_1 = require("../../isydevice");
const InsteonBaseDevice_1 = require("./InsteonBaseDevice");
class InsteonLockDevice extends isydevice_1.ISYBinaryStateDevice(InsteonBaseDevice_1.InsteonBaseDevice) {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
    sendLockCommand(lockState, resultHandler) {
        if (this.deviceType === isyconstants_1.DeviceTypes.lock) {
            this.sendNonSecureLockCommand(lockState);
        }
        else if (this.deviceType === isyconstants_1.DeviceTypes.secureLock) {
            this.sendSecureLockCommand(lockState);
        }
        else {
            // assert(false, 'Should not ever have lock which is not one of the known lock types');
        }
    }
    get isLocked() {
        return this.state;
    }
    getCurrentLockState() {
        if (this.deviceType === isyconstants_1.DeviceTypes.lock) {
            return this.getCurrentNonSecureLockState();
        }
        else if (this.deviceType === isyconstants_1.DeviceTypes.secureLock) {
            return this.getCurrentSecureLockState();
        }
        else {
            // assert(false, 'Should not ever have lock which is not one of the known lock types');
        }
    }
    async updateIsLocked(isLocked) {
        return super.updateState(isLocked);
    }
    getCurrentNonSecureLockState() {
        return this.ST !== isyconstants_1.States.Lock.Locked;
    }
    getCurrentSecureLockState() {
        return this.ST > 0;
    }
    async sendNonSecureLockCommand(lockState) {
        if (lockState) {
            return this.isy.sendNodeCommand(this, isyconstants_1.Commands.Lock.Lock);
        }
        else {
            return this.isy.sendNodeCommand(this, isyconstants_1.Commands.Lock.Unlock);
        }
    }
    async sendSecureLockCommand(lockState) {
        if (lockState) {
            return this.isy.sendNodeCommand(this, isyconstants_1.Commands.On, isyconstants_1.States.SecureLock.Secured);
        }
        else {
            return this.isy.sendNodeCommand(this, isyconstants_1.Commands.On, isyconstants_1.States.SecureLock.NotSecured);
        }
    }
}
exports.InsteonLockDevice = InsteonLockDevice;
