
# isy-js
(C) Rod Toll 2015-2017, Licensed under the MIT-LICENSE.

# ACTIVE DEVELOPMENT & SUPPORT DISCONTINUED
I am sad to announce that I am discontinuing support for this library. This means I will no longer be addressing any open bugs, responding to feature requests or 
releasing new versions. Between work and my home life there simply isn't the time. I will leave the repository online and the 
package on npm but that is it. As this code is licensed under the MIT license you are of course welcome to branch this code and make it your own and use it in your 
own projects -- but you do so, as always, with no warranty or support from me. 

I want to thank everyone who helped along the way through questions and issues and code contributions -- your assistance was very much appreciated. And it made the 
late nights and testing worth it. 

If you find a good alternative and want others to know about it then open a new issue and provide a pointer. I might post a link here.

# Old Readme..

Javascript library for interfacing with the ISY-99i from Universal Devices. (http://www.universal-devices.com).

Getting Started
---------------

First, clone the repository:

```
1. $ git clone https://github.com/rodtoll/isy-js.git
2. $ cd isy-js
3. $ npm install
```

Testing
-------

If you wish to test the library against a simulator I recommend fake-isy-994i project. (Full disclosure, I use it to test this library). For more details see https://github.com/rodtoll/fake-isy-994i/.

There is a mocha based set of tests in the tests directory now. Install and run the fake-isy-994i project in the background and then you can use npm test from the root directory of your enlistment to check for issues. 

Travis CI is used for CI. You can see the .travis.yml to see the config used to run the tests.

Features
--------

* Enumeration of devices along with basic metadata.
* Basic commands for several device types.
* Automatic updating of current state of devices while operating.
* Change notifications when device state changes.
* Support for elk connected alarm.
* Support for elk sensors. 
* Support for scenes
* Support for generic devices through ISYBaseDevice
* Support for variables (thanks @bdstark)

Setup
-----

First create an instance of the ISY root object:

```
var ISY = require('isy-js');

var isy = new ISY.ISY('<ADDRESS>', '<AdminUserName>', '<PAssword>', changeCallback, useHttps, scenesInDeviceList, enableDebugLog, variableChangeCallback);
```

Next, initialize the device list and start the websocket listening for updates:

```
isy.initialize(handleInitialized);
```

The callback, handleInitialized, takes no parameters and is called when the entire device list has been enumerated. Once this callback is called then the object is safe to use.

You can then retrieve a list of devices, and operate on them, by calling isy.getDeviceList(). You can then operate on the device objects through their properties and functions.

DEBUG MESSAGES
--------------
You can get debug messages to the console by specifying true for the enableDebugLog parameter in the constructor. Debug logs will
be written to the console.

Alternatively you can set the environment variable ISYJSDEBUG to a value to have the same effect.

DEVICE TYPES
------------

### Specific Support

For devices which are supported specifically a class is available which is specific to that type. To support a device specifically it needs to be defined in the isydevicetypes.json file
or be appropriately identified with the ISY device class information. If you would like a device to be identified specifically then request it be added to isydevicetypes.json or file a
bug against the project with device information so the ISY device class algorithm can be updated.

For these devices a ISYXXXXDevice object will be available.

### Generic Support

For devices which are not specifically supported through the isydevicetypes.json file or the ISY device class information a ISYBaseDevice object will be available. It contains all
support operations that this library supports. It *does not* prevent you from making a command call against a device that makes no sense. For example you could get the current
lighting status on a device which isn't a light. The results should not be harmful but likely don't make sense.

But if you know what a device is then you can use those functions to send the right commands.

DESIGN
------

The ISY object enumerates devices. The set of ISYXXXDevice and ELkXXXX hide all the complexity of sending commands and transating updates into state for callers. The ISY object uses WebSockets to get live updates. Events are raised when state changes (once enumeration is done).

API - SPECIFIC DEVICES
----------------------

### ISY

Properties:
* `address` - Address of the ISY.

Functions:
* `new ISY(address, username, password, elkEnabled, changeCallback, useHttps,scenesInDeviceList,enableDebugLog,variableCallback)` - Creates a new instance. address indicates the ip address of your
isy, username the username for the admin user and password the password for the admin user, elkEnabled indicates if an elk
alarm system is connected or not (boolean) and changeCallback is called when the property of a device changes. Takes two
parameters the pointer to the ISY object and the device. The useHttps parameter is optional and if specified and set to true will have the library use https to talk to isy.
It uses http by default. The next parameter scenesInDeviceList specifies if scenes should be included in the list of devices.
This defaults to false. The next parameter enableDebugLog, which is optional, specifies if debug log should be dumped to the
console during execution. Useful for debugging problems. The final parameter is the callback function which should be called when a variable value changes.
* `initialize(handleInitialized)` - Connects to the isy, retrieves the list of devices, updates their status and starts the websocket callbacks for updating the local objects.
* `getDeviceList()` - Gets the array of devices, each represented as an ISYDevice object.
* `getDevice(address)` - Gets the device identified by the specified isy address.
* `getSceneList()` - Gets the array of scenes, each represented as an ISYScene object.
* `getScene(address)` - Gets the scene identified by the specified isy address.
* `getElkAlarmPanel()` - Returns a device representing the elk alarm panel
* `getVariableList()` - Returns a list of ISYVariable objects, one for each variable the ISY supports.
* `getVariable(type,id)` - Returns the ISYVariable object representing the ISY variable of the specified type and id. null if not found.

Constants:
* `DEVICE_TYPE_LOCK` - Indicates a morninglinc lock device.
* `DEVICE_TYPE_SECURE_LOCK` - Indicates a zwave lock device.
* `DEVICE_TYPE_LIGHT` - Indicates a light, non-dimmable device type.
* `DEVICE_TYPE_DIMMABLE_LIGHT` - Indicates a dimmable light device type.
* `DEVICE_TYPE_OUTLET` - Indicates a outlet device type. 
* `DEVICE_TYPE_FAN` - Indicates a fan device type. 
* `DEVICE_TYPE_DOOR_WINDOW_SENSOR` - Indicates a door/window sensor device type.
* `DEVICE_TYPE_LEAK_SENSOR` - Indicates a leak sensor device type.
* `DEVICE_TYPE_ALARM_DOOR_WINDOW_SENSOR` - Indicates an elk door/window sensor device type.
* `DEVICE_TYPE_CO_SENSOR` - Indicates an Elk CO sensor device type.
* `DEVICE_TYPE_ALARM_PANEL` - Indicates an Elk alarm panel device type. 
* `DEVICE_TYPE_MOTION_SENSOR` - Indicates an Insteon motion sensor
* `DEVICE_TYPE_SCENE` - Indicates an Insteon scene
* `VARIABLE_TYPE_INTEGER` - Indicates that the variable is of type integer
* `VARIABLE_TYPE_STATE` - Indicates that the variable is of type state.

### Notifications - Devices/Scenes

The function `changeCallback` specified in the constructor will be called when a device state changes. It will also be
called when a scene changes as a result of a device changing. Note that if a scene is changed then each individual
device in the scene will end up getting change notifications. Also note that for each device change in a scene an
individual change notification is raised for the scene - so you can track the changes as each device is changed.

Function should be of the form:
* `changeCallback(isy,device)` - Isy is the isy instance the notification is from and device is the device which changed.

### Notifications - Variables

If a variable changes value then the `variableCallback` specified in the constructor will be called.

Function should be of the form:
* `variableCallback(isy,variable)` - Isy is the isy instance the notification is from and the variable is the variable which changed.

### All Devices/Scenes

Properties:
* `isy` - Gets the isy instance this device is from.
* `name` - Name for the device.
* `address` - ISY address for the device.
* `isyType` - ISY type identifier for the device. see isydevicetypes.json for the map from isy types to friendly device names.
* `deviceFriendlyName` - Friendly name for the type of device.
* `deviceType` - Type of device. See ISY.DEVICE_TYPE_XXXXX for possible values.
* `connectionType` - Type of connection to the Insteon network. Possible values - "Insteon Wired", "Insteon Wireless", "Insteon MorningLinc", "ZWave". See isydevicetypes.json for the map.
* `batteryOperated` - true if this is a battery powered device, false otherwise.
* `lastChanged` - Date/time the last time this library saw that the device characteristics have changed.

The sendXXXCommand are functions which tell the device to move the specified state. The local device will not update it's state until the ISY has acknowledged the change. To get the last acknowledged state call the getXXXXState commands.

The resultCallback parameter specifies a required callback that will specify true if the command succeeded, false otherwise. 

### ISYLightDevice

Represents an Insteon SwitchLinc Dimmer, KeypadLinc, KeypadLinc Relay.

Properties:
* `isDimmable` - Returns boolean indicating if this light device is dimmable.

Functions (All Lights):
* `getCurrentLightState()` - Gets the current Light power state. true for on, false for off.
* `sendLightCommand(state,resultCallback(success))` - Sends the command to set the Light power state. true to turn it on, false to turn it off

Functions (Dimmable Lights):
* `sendLightDimCommand(level,resultCallback(success))` - Sets the dim level of the light to the specified value. Range: DIM_LEVEL_MINIMUM to DIM_LEVEL_MAXIMUM.
* `getCurrentLightDimState()` - Gets the current dim level of the light. Range: DIM_LEVEL_MINIMUM to DIM_LEVEL_MAXIMUM.

Constants:
* `DIM_LEVEL_MINIMUM` - Minimum dim level. (Full off)
* `DIM_LEVEL_MAXIMUM` - Maximum dim level. (Full on)

### ISYScene

Represents an Inseton Scene. Currently supports only lighting commands against the scene. NOTE: Changes to any devices in a scene will result in a change notification for the scene.

NOTE: name and address properties are valid but the other general properties are set to default values as they don't make sense for a scene.

Properties:
* `childDevices` - Array of devices which are in the scene.

Functions (All Lights):
* `getCurrentLightState()` - Gets the virtual light state for all the lights in the scene. true if any lights are on, false if none are on.
* `sendLightCommand(state,resultCallback(success))` - Sends the command to set the Light power state for all lights in the scene. true to turn them on, false to turn them off
* `getAreAllLightsInSpecifiedState(state)` - Returns boolean indicating if all the lights in the scene are in the specified state.

Functions:
* `getCurrentLightDimState()` - Gets the average dim level of all the lights in the scene. Range: DIM_LEVEL_MINIMUM to DIM_LEVEL_MAXIMUM.

NOTE: You cannot dim scenes. ISY does not support it.

### ISYLockDevice

Represents a ZWave Lock or a MorningLinc connected Lock. 

Functions:
* `getCurrentLockState()` - Gets the current locked state of the lock device. true for locked, false for unlocked.
* `sendLockCommand(state,resultCallback(success))` - Sends the command to set the Lock state to the specified state. true to lock the door, false to unlock it.

### ISYOutletDevice

Represents an Insteon ApplianceLinc or LampLinc. 

Functions:
* `getCurrentOutletState()` - Gets the current state of the outlet. true for on, false for off.
* `sendOutletCommand(state,resultCallback(success))` - Sends the command to set the outlet state to the specified state. true to turn it on, false to turn it off. 

### ISYFanDevice

Represents an Insteon fan device. 

Functions:
* `getCurrentFanState()`- Gets the current state of the fan. See the FAN_XXX constants for possible values. 
* `sendFanCommand(state,resultCallback(success))` - Sends the command to set the fan state to the specified state. See the FAN_XXX constants for possible values.

Constants:
* `FAN_OFF` - Fan should be off.
* `FAN_LEVEL_LOW` - Fan level is low.
* `FAN_LEVEL_MEDIUM` - Fan level is medium.
* `FAN_LEVEL_HIGH` - Fan level is high.

### ISYDoorWindowDevice

Represents an Insteon door/window sensor like I/O Linc, TriggerLinc. 

Functions:
* `getCurrentDoorWindowState()` - Gets the current state of the door window sensor. true is open, false is closed. 

### ISYLeakDevice

Represents an Insteon leak sensor. 

Functions:
* `getCurrentLeakState()` - Gets the current state of the leak sensor. true is leak detected, false is no leak detected. 

### ISYMotionSensorDevice

Represents an Insteon motion sensor.

Functions:
* `getCurrentMotionSensorState()` - Gets the current state of the motion sensor.


### ELKAlarmSensor

Represents a door/window sensor connected via wired or wireless to the Elk alarm panel. 

Functions:
* `sendBypassToggleCommand()` - Sends a command to toggle if device is bypassed or not
* `isBypassed()` - Returns boolean indicating if sensor is bypassed
* `getCurrentDoorWindowState()` - Returns a boolean indicating if the door/window is open or violated
* `getPhysicalState()` - Returns physical state of the sensor. Possible values are SENSOR_STATE_PHYSICAL_XXX.
* `getLogicalState()` - Returns logical state of the sensor. Possible values are SENSOR_STATE_LOGICAL_XXX.

Constants:
* `SENSOR_STATE_PHYSICAL_NOT_CONFIGURED` - The sensor is not configured.
* `SENSOR_STATE_PHYSICAL_OPEN` - The sensor is physically open (tripped).
* `SENSOR_STATE_PHYSICAL_EOL` - The sensor is in a EOL state.
* `SENSOR_STATE_PHYSICAL_SHORT` - The sensor is in a short state.
* `SENSOR_STATE_LOGICAL_NORMAL` - The sensor is in a normal state.
* `SENSOR_STATE_LOGICAL_TROUBLE` - The sensor has sensed trouble. (Tamper)
* `SENSOR_STATE_LOGICAL_VIOLATED` - The sensor has been violated/open/tripped.
* `SENSOR_STATE_LOGICAL_BYPASSED` - The sensor has been bypassed.

### ElkAlarmPanel

Represents an Elk alarm panel. One is available per isy when elk is present. Only area 1 is supported. 

Functions:
* `sendSetAlarmModeCommand(mode)` - Sends the command to the alarm system to arm in the specified mode. See getAlarmMode() for possible values. 
* `clearAllBypasses()` - Clears all current bypasses.
* `getAlarmTripState()` - Returns the current alarm trip state. Possible values are ElkAlarmPanel.ALARM_TRIP_STATE_XXXX.
* `getAlarmState()` - Returns the current alarm state. Possible values are ElkAlarmPanel.ALARM_STATE_XXXX.
* `getAlarmMode()` - Returns the current alarm mode. Possible values are ElkAlarmPanel.ALARM_MODE_XXXX.

Constants:
* `ALARM_MODE_DISARMED` - Indicates the disarmed alarm mode.
* `ALARM_MODE_AWAY` - Indicates the away alarm mode.
* `ALARM_MODE_STAY` - Indicates the stay alarm mode.
* `ALARM_MODE_STAY_INSTANT` - Indicates the stay instant alarm mode.
* `ALARM_MODE_NIGHT` - Indicates the night alarm mode.
* `ALARM_MODE_NIGHT_INSTANT` - Indicates the night instant alarm mode.
* `ALARM_MODE_VACATION` - Indicates the vacation alarm mode.
* `ALARM_TRIP_STATE_DISARMED` - Indicates the alarm system is currently disarmed.
* `ALARM_TRIP_STATE_EXIT_DELAY` - Indicates the alarm is in exit delay mode.
* `ALARM_TRIP_STATE_TRIPPED` - Indicates the alarm is tripped.
* `ALARM_STATE_NOT_READY_TO_ARM` - Current state of the alarm is not ready to arm.
* `ALARM_STATE_READY_TO_ARM` - Current state of the alarm is ready to arm.
* `ALARM_STATE_READY_TO_ARM_VIOLATION` - Current state of the alarm is armed with a violation.
* `ALARM_STATE_ARMED_WITH_TIMER` - Current state of the alarm is armed and counting down.
* `ALARM_STATE_ARMED_FULLY` - Current state of the alarm is armed. 
* `ALARM_STATE_FORCE_ARMED_VIOLATION` - Current state of the alarm is armed and has a violation.
* `ALARM_STATE_ARMED_WITH_BYPASS` - Current state of the alarm is armed with a bypass.

API - VARIABLES
---------------

### ISYVariable

Represents an individual ISY variable and it's value. You can retrieve the object representing a variable either
through the variable change callback, through a call to getVariables() to get a full list or getVariable() to get
a specific variable.

Properties:
* `isy` - The ISY instance this variable is from
* `id` - The Id of the variable
* `name` - The name of the variable
* `value` - The current value of the variable
* `init` - The value the variable is initialized to at startup
* `type` - The type of variable. This will be set to the value of VARIABLE_TYPE_INTEGER or VARIABLE_TYPE_STATE depending on the variable type.
* `lastModified` - The date/time that the local isy library last saw a change for this variable.

Functions:
* `sendSetValue(value,callback)` - Send a command to set the specified variable to the specified value. callback will be called with a true
on success, false on failure when the call is complete. The local value will be updated when a notification is received.

API - GENERIC DEVICES
---------------------

### ISYBaseDevice

For devices which are not specifically supported the following generic object can be used to interact with the device.
The operations you can use may or may not make sense for the given device. It is recommended that you only use the
operations which you know what the type of device is but the library doesn't. By it's nature these operations have not
been tested.

Functions:

All of the device specific operations offered by the specific device types are supported on these objects. See the
documentation for each of the specific device types ISYXXXDevice. Beyond those the following operations are supported:
* `getCurrentNonSecureLockState()` - Gets the current locked state of the Insteon lock device. true for locked, false for unlocked.
* `sendNonSecureLockCommand(state,resultCallback(success))` - Sends the command to set the Insteon Lock state to the specified state. true to lock the door, false to unlock it.
* `getCurrentSecureLockState()` - Gets the current locked state of the secure lock device (usually zwave locks). true for locked, false for unlocked.
* `sendSecureLockCommand(state,resultCallback(success))` - Sends the command to set the lock device (usually zwave locks) lock state to the specified state. true to lock the door, false to unlock it.

CHANGELOG
---------

* 0.4.5 - 2017/07/04 - Support suspended. Active development ended. 
* 0.4.4 - 2017/01/14 - Restored chatty scene notifications, logic to quiet them wasn't right. Better chatty and correct then wrong and less chatty.
* 0.4.3 - 2016/04/09 - Improved error checking to handle errors better. Now handles ISYs with no variables defined.
* 0.4.2 - 2016/02/15 - Added check to watch for loss of connection. If no notifications are seen in 60 seconds connection is reestablished. Also
changed Scene behavior so only raises a change when the state of the scene actually changes (used to raise on any change for any light in the scene).
* 0.4.1 - 2016/02/14 - Added user requested type to the types file.
* 0.4.0 - 2016/02/09 - Minor tweaks and adding timestamps to debug output
* 0.3.9 - 2016/02/07 - Minor update to match updated fake-isy and unit tests
* 0.3.8 - 2016/02/06 - Adding support for variables thanks to contribution from bdstark.
* 0.3.7 - 2016/01/26 - changed lastModified to lastChanged and added attribute to elk devices and scenes.
* 0.3.6 - 2016/01/26 - added lastModified attribute, added isDimmable and added function to check to see if all lights in a scene are the same state
* 0.3.5 - 2016/01/24 - Removed accidental extra debug output
* 0.3.4 - 2016/01/24 - Added additional tests

Older version history was not captured.

TODO
----

* Support for programs.
* Better error checking.
* Recoverability in the websocket connection. These can drop over time.
* The ISY-994 will sometimes return incomplete XML (missing part of the closing tag) and we should be resilient to that.
* ELk > 1 areas
