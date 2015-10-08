isy-js
======
(C) Rod Toll 2015, Licensed under the MIT-LICENSE.

Javascript library for interfacing with the ISY-99i from Universal Devices. (http://www.universal-devices.com).

Getting Started
---------------

First, clone the repository:

```
1. $ git clone https://github.com/rodtoll/isy-js.git
2. $ cd isy-js
3. $ npm install
```

Features
--------

* Enumeration of devices along with basic metadata.
* Basic commands for several device types.
* Automatic updating of current state of devices while operating.
* Change notifications when device state changes.
* Support for elk connected alarm.
* Support for elk sensors. 

Setup
-----

First create an instance of the ISY root object:

```
var ISY = require('isy-js');

var isy = new ISY.ISY('<ADDRESS>', '<AdminUserName>', '<PAssword>', changeCallback);
```

Next, initialize the device list and start the websocket listening for updates:

```
isy.initialize(handleInitialized);
```

The callback, handleInitialized, takes no parameters and is called when the entire device list has been enumerated. Once this callback is called then the object is safe to use.

You can then retrieve a list of devices, and operate on them, by calling isy.getDeviceList(). You can then operate on the device objects through their properties and functions.

DEVICE TYPES
------------

This library uses isydevicetypes.json to map between isy device types and friendly device names and characteristics. Update this file to add more devices.

Currently the library only handles Lights, Outlets, MorningLinc Locks, ZWave Locks, Fans, Door/Window Sensors, Elk Panels and Elk Sensors (door/window). More will be added. 

DESIGN
------

The ISY object enumerates devices. The set of ISYXXXDevice and ELkXXXX hide all the complexity of sending commands and transating updates into state for callers. The ISY object uses WebSockets to get live updates. Events are raised when state changes (once enumeration is done).

API
---

### ISY

Properties:
* `address` - Address of the ISY.

Functions:
* `new ISY(address, username, password, elkEnabled, changeCallback)` - Creates a new instance. address indicates the ip address of your isy, username the username for the admin user and password the password for the admin user, elkEnabled indicates if an elk alarm system is connected or not (boolean) and changeCallback is called when the property of a device changes. Takes two parameters the pointer to the ISY object and the device.
* `initialize(handleInitialized)` - Connects to the isy, retrieves the list of devices, updates their status and starts the websocket callbacks for updating the local objects.
* `getDeviceList()` - Gets the array of devices, each represented as an ISYDevice object.
* `getDevice(address)` - Gets the device identified by the specified isy address.
* `getElkAlarmPanel()` - Returns a device representing the elk alarm panel

Constants:
* `DEVICE_TYPE_LOCK` - Indicates a morninglinc lock device.
* `DEVICE_TYPE_SECURE_LOCK` - Indicates a zwave lock device.
* `DEVICE_TYPE_LIGHT` - Indicates a light, non-dimmable device type.
* `DEVICE_TYPE_DIMMABLE_LIGHT` - Indicates a dimmable light device type.
* `DEVICE_TYPE_OUTLET` - Indicates a outlet device type. 
* `DEVICE_TYPE_FAN` - Indicates a fan device type. 
* `DEVICE_TYPE_DOOR_WINDOW_SENSOR` - Indicates a door/window sensor device type.
* `DEVICE_TYPE_ALARM_DOOR_WINDOW_SENSOR` - Indicates an elk door/window sensor device type.
* `DEVICE_TYPE_CO_SENSOR` - Indicates an Elk CO sensor device type.
* `DEVICE_TYPE_ALARM_PANEL` - Indicates an Elk alarm panel device type. 

### All Devices

Properties:
* `isy` - Gets the isy instance this device is from.
* `name` - Name for the device.
* `address` - ISY address for the device.
* `isyType` - ISY type identifier for the device. see isydevicetypes.json for the map from isy types to friendly device names.
* `deviceFriendlyName` - Friendly name for the type of device.
* `deviceType` - Type of device. See ISY.DEVICE_TYPE_XXXXX for possible values.
* `connectionType` - Type of connection to the Insteon network. Possible values - "Insteon Wired", "Insteon Wireless", "Insteon MorningLinc", "ZWave". See isydevicetypes.json for the map.
* `batteryOperated` - true if this is a battery powered device, false otherwise.

The sendXXXCommand are functions which tell the device to move the specified state. The local device will not update it's state until the ISY has acknowledged the change. To get the last acknowledged state call the getXXXXState commands.

The resultCallback parameter specifies a required callback that will specify true if the command succeeded, false otherwise. 

### ISYLightDevice

Represents an Insteon SwitchLinc Dimmer, KeypadLinc, KeypadLinc Relay. 

Functions (All Lights):
* `getCurrentLightState()` - Gets the current Light power state. true for on, false for off.
* `sendLightCommand(state,resultCallback(success))` - Sends the command to set the Light power state. true to turn it on, false to turn it off

Functions (Dimmable Lights):
* `sendLightDimCommand(level,resultCallback(success))` - Sets the dim level of the light to the specified value. Range: DIM_LEVEL_MINIMUM to DIM_LEVEL_MAXIMUM.
* `getCurrentLightDimState()` - Gets the current dim level of the light. Range: DIM_LEVEL_MINIMUM to DIM_LEVEL_MAXIMUM.

Constants:
* `DIM_LEVEL_MINIMUM` - Minimum dim level. (Full off)
* `DIM_LEVEL_MAXIMUM` - Maximum dim level. (Full on)

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

TODO
----

* Unit tests.
* Better error checking.
* Recoverability in the websocket connection. These can drop over time.
* The ISY-994 will sometimes return incomplete XML (missing part of the closing tag) and we should be resilient to that.
* Elk CO sensors
* ELk > 1 areas
