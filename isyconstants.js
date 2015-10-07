///////////////////////////////
// Constants for ISY devices

//  Device types
module.exports.DEVICE_TYPE_LOCK = 'DoorLock';
module.exports.DEVICE_TYPE_SECURE_LOCK = 'SecureLock';
module.exports.DEVICE_TYPE_LIGHT = 'Light';
module.exports.DEVICE_TYPE_DIMMABLE_LIGHT = 'DimmableLight';
module.exports.DEVICE_TYPE_OUTLET = 'Outlet';
module.exports.DEVICE_TYPE_FAN = 'Fan';
module.exports.DEVICE_TYPE_UNKNOWN = 'Unknown';
module.exports.DEVICE_TYPE_DOOR_WINDOW_SENSOR = "DoorWindowSensor";
module.exports.DEVICE_TYPE_ALARM_DOOR_WINDOW_SENSOR = 'AlarmDoorWindowSensor';
module.exports.DEVICE_TYPE_CO_SENSOR = 'COSensor';
module.exports.DEVICE_TYPE_ALARM_PANEL = 'AlarmPanel';


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
module.exports.ISY_COMMAND_FAN_PARAMETER_LOW = 63;
module.exports.ISY_COMMAND_FAN_PARAMETER_MEDIUM = 191;
module.exports.ISY_COMMAND_FAN_PARAMETER_HIGH = 255;
module.exports.ISY_COMMAND_LOCK_LOCK = 'DON';
module.exports.ISY_COMMAND_LOCK_UNLOCK = 'DOF';

module.exports.ISY_STATE_DOOR_WINDOW_CLOSED = '0';
module.exports.ISY_STATE_LOCK_UNLOCKED = '0';

// Elk

// Alarm mode constants
module.exports.ELK_ALARM_MODE_DISARMED = 0;
module.exports.ELK_ALARM_MODE_AWAY = 1;
module.exports.ELK_ALARM_MODE_STAY = 2;
module.exports.ELK_ALARM_MODE_STAY_INSTANT = 3;
module.exports.ELK_ALARM_MODE_NIGHT = 4;
module.exports.ELK_ALARM_MODE_NIGHT_INSTANT = 5;
module.exports.ELK_ALARM_MODE_VACATION = 6;

// Alarm trip state
module.exports.ELK_ALARM_TRIP_STATE_DISARMED = 0;
module.exports.ELK_ALARM_TRIP_STATE_EXIT_DELAY = 1;
module.exports.ELK_ALARM_TRIP_STATE_TRIPPED = 2;

// Alarm state
module.exports.ELK_ALARM_STATE_NOT_READY_TO_ARM = 0;
module.exports.ELK_ALARM_STATE_READY_TO_ARM = 1;
module.exports.ELK_ALARM_STATE_READY_TO_ARM_VIOLATION = 2;
module.exports.ELK_ALARM_STATE_ARMED_WITH_TIMER = 3;
module.exports.ELK_ALARM_STATE_ARMED_FULLY = 4;
module.exports.ELK_ALARM_STATE_FORCE_ARMED_VIOLATION = 5;
module.exports.ELK_ALARM_STATE_ARMED_WITH_BYPASS = 6;

// Logical Status for sensors
module.exports.ELK_SENSOR_STATE_PHYSICAL_NOT_CONFIGURED = 0;
module.exports.ELK_SENSOR_STATE_PHYSICAL_OPEN = 1;
module.exports.ELK_SENSOR_STATE_PHYSICAL_EOL = 2;
module.exports.ELK_SENSOR_STATE_PHYSICAL_SHORT = 3;

// Physical status for sensors
module.exports.ELK_SENSOR_STATE_LOGICAL_NORMAL = 0;
module.exports.ELK_SENSOR_STATE_LOGICAL_TROUBLE = 1;
module.exports.ELK_SENSOR_STATE_LOGICAL_VIOLATED = 2;
module.exports.ELK_SENSOR_STATE_LOGICAL_BYPASSED = 3;

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
module.exports.USER_COMMAND_BYPASS_TOGGLE = 'Bypass';






