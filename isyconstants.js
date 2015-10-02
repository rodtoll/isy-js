///////////////////////////////
// Constants for ISY devices

//  Device types
module.exports.DEVICE_TYPE_SECURE_LOCK = 'SecureLock';
module.exports.DEVICE_TYPE_LIGHT = 'Light';
module.exports.DEVICE_TYPE_OUTLET = 'Outlet';
module.exports.DEVICE_TYPE_FAN = 'Fan';
module.exports.DEVICE_TYPE_UNKNOWN = 'Unknown';

// Underlying constants for Rest commands to ISY
module.exports.ISY_COMMAND_LIGHT_ON = 'DON';
module.exports.ISY_COMMAND_LIGHT_OFF = 'DOF';
module.exports.ISY_COMMAND_OUTLET_ON = 'DON';
module.exports.ISY_COMMAND_OUTLET_OFF = 'DOF';
module.exports.ISY_COMMAND_SECURE_LOCK_BASE = 'SECMD';
module.exports.ISY_COMMAND_SECURE_LOCK_PARAMETER_LOCK = '1';
module.exports.ISY_COMMAND_SECURE_LOCK_PARAMETER_UNLOCK = '0';
module.exports.ISY_COMMAND_FAN_BASE = 'DON';
module.exports.ISY_COMMAND_FAN_OFF = 'DOF';
module.exports.ISY_COMMAND_FAN_PARAMETER_LOW = '63';
module.exports.ISY_COMMAND_FAN_PARAMETER_MEDIUM = '191';
module.exports.ISY_COMMAND_FAN_PARAMETER_HIGH = '255';

// User commands
module.exports.USER_COMMAND_LIGHT_ON = 'On';
module.exports.USER_COMMAND_LIGHT_OFF = 'Off';
module.exports.USER_COMMAND_OUTLET_ON = 'On';
module.exports.USER_COMMAND_OUTLET_OFF = 'Off';
module.exports.USER_COMMAND_LOCK_LOCK = 'Lock';
module.exports.USER_COMMAND_LOCK_UNLOCK = 'Unlock';
module.exports.USER_COMMAND_FAN_OFF = 'Off';
module.exports.USER_COMMAND_FAN_LOW = 'Low';
module.exports.USER_COMMAND_FAN_MEDIUM = 'Medium';
module.exports.USER_COMMAND_FAN_HIGH = 'High';
