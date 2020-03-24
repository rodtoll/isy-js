Object.defineProperty(exports, "__esModule", { value: true });
const ISYConstants_1 = require("../../ISYConstants");
const ISYDevice_1 = require("../ISYDevice");
const InsteonBaseDevice_1 = require("./InsteonBaseDevice");
class InsteonLockDevice extends ISYDevice_1.ISYBinaryStateDevice(InsteonBaseDevice_1.InsteonBaseDevice) {
    constructor(isy, deviceNode) {
        super(isy, deviceNode);
    }
    sendLockCommand(lockState, resultHandler) {
        if (this.deviceType === ISYConstants_1.DeviceTypes.lock) {
            this.sendNonSecureLockCommand(lockState);
        }
        else if (this.deviceType === ISYConstants_1.DeviceTypes.secureLock) {
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
        if (this.deviceType === ISYConstants_1.DeviceTypes.lock) {
            return this.getCurrentNonSecureLockState();
        }
        else if (this.deviceType === ISYConstants_1.DeviceTypes.secureLock) {
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
        return this.ST !== ISYConstants_1.States.Lock.Locked;
    }
    getCurrentSecureLockState() {
        return this.ST > 0;
    }
    async sendNonSecureLockCommand(lockState) {
        if (lockState) {
            return this.isy.sendNodeCommand(this, ISYConstants_1.Commands.Lock.Lock);
        }
        else {
            return this.isy.sendNodeCommand(this, ISYConstants_1.Commands.Lock.Unlock);
        }
    }
    async sendSecureLockCommand(lockState) {
        if (lockState) {
            return this.isy.sendNodeCommand(this, ISYConstants_1.Commands.On, ISYConstants_1.States.SecureLock.Secured);
        }
        else {
            return this.isy.sendNodeCommand(this, ISYConstants_1.Commands.On, ISYConstants_1.States.SecureLock.NotSecured);
        }
    }
}
exports.InsteonLockDevice = InsteonLockDevice;
