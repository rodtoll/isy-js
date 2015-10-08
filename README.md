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

* `new ISY(address, username, password, elkEnabled, changeCallback)` - Creates a new instance. address indicates the ip address of your isy, username the username for the admin user and password the password for the admin user, elkEnabled indicates if an elk alarm system is connected or not (boolean) and changeCallback is called when the property of a device changes. Takes two parameters the pointer to the ISY object and the device.
* `initialize(handleInitialized)` - Connects to the isy, retrieves the list of devices, updates their status and starts the websocket callbacks for updating the local objects.
* `getDeviceList()` - Gets the array of devices, each represented as an ISYDevice object.
* `getDevice(address)` - Gets the device identified by the specified isy address.
* `getElkAlarmPanel()` - Returns a device representing the elk alarm panel

### All Devices

Properties:

* `isy` - Gets the isy instance this device is from.
* `name` - Name for the device.
* `address` - ISY address for the device.
* `isyType` - ISY type identifier for the device. see isydevicetypes.json for the map from isy types to friendly device names.
* `deviceFriendlyName` - Friendly name for the type of device.
* `deviceType` - Type of device. Possible values; Light, Outlet, SecureLock.
* `connectionType` - Type of connection to the Insteon network. Possible values - "Insteon Wired", "Insteon Wireless", "Insteon MorningLinc", "ZWave". See isydevicetypes.json for the map.
* `batteryOperated` - true if this is a battery powered device, false otherwise.

The sendXXXCommand are functions which tell the device to move the specified state. The local device will not update it's state until the ISY has acknowledged the change. To get the last acknowledged state call the getXXXXState commands.

The resultCallback parameter specifies a required callback that will specify true if the command succeeded, false otherwise. 

### ISYLightDevice

Represents an Insteon SwitchLinc Dimmer, KeypadLinc, KeypadLinc Relay. Available functions:

All Lights:
* `getCurrentLightState()` - Gets the current Light power state. true for on, false for off.
* `sendLightCommand(state,resultCallback(success))` - Sends the command to set the Light power state. true to turn it on, false to turn it off

Dimmable Lights:
* `sendLightDimCommand(level,resultCallback(success))` - Sets the dim level of the light to the specified value. 0 (off) to 100 (full on).
* `getCurrentLightDimState()` - Gets the current dim level of the light. Values from 0 (off) to 100 (full on).

### ISYLockDevice

Represents a ZWave Lock or a MorningLinc connected Lock. Available functions:

* `getCurrentLockState()` - Gets the current locked state of the lock device. true for locked, false for unlocked.
* `sendLockCommand(state,resultCallback(success))` - Sends the command to set the Lock state to the specified state. true to lock the door, false to unlock it.

### ISYOutletDevice

Represents an Insteon ApplianceLinc or LampLinc. Available functions:

* `getCurrentOutletState()` - Gets the current state of the outlet. true for on, false for off.
* `sendOutletCommand(state,resultCallback(success))` - Sends the command to set the outlet state to the specified state. true to turn it on, false to turn it off. 

### ISYFanDevice

Represents an Insteon fan device. Available functions:

* `getCurrentFanState()`- Gets the current state of the fan. Off, Low, Medium, High.
* `sendFanCommand(state,resultCallback(success))` - Sends the command to set the fan state to the specified state. Allowed values are Off, Low, Medium and High.

### ISYDoorWindowDevice

Represents an Insteon door/window sensor like I/O Linc, TriggerLinc. Available functions:

* `getCurrentDoorWindowState()` - Gets the current state of the door window sensor. true is open, false is closed. 

### ELKAlarmSensor

Represents a door/window sensor connected via wired or wireless to the Elk alarm panel. Available functions:

* `sendBypassToggleCommand()` - Sends a command to toggle if device is bypassed or not
* `isBypassed()` - Returns boolean indicating if sensor is bypassed
* `getCurrentDoorWindowState()` - Returns a boolean indicating if the door/window is open or violated
* `getPhysicalState()` - Returns physical state of the sensor. One of the isyConstants values; ELK_SENSOR_STATE_PHYSICAL_NOT_CONFIGURED, ELK_SENSOR_STATE_PHYSICAL_OPEN, ELK_SENSOR_STATE_PHYSICAL_EOL or ELK_SENSOR_STATE_PHYSICAL_SHORT.
* `getLogicalState()` - Returns logical state of the sensor. One of the isyConstants values; ELK_SENSOR_STATE_LOGICAL_NORMAL, ELK_SENSOR_STATE_LOGICAL_TROUBLE, ELK_SENSOR_STATE_LOGICAL_VIOLATED or ELK_SENSOR_STATE_LOGICAL_BYPASSED.

### ElkAlarmPanel

Represents an Elk alarm panel. One is available per isy when elk is present. Only area 1 is supported. Available functions:

* `sendSetAlarmModeCommand(mode)` - Sends the command to the alarm system to arm in the specified mode. See getAlarmMode() for possible values. 
* `clearAllBypasses()` - Clears all current bypasses.
* `getAlarmTripState()` - Returns the current alarm trip state. Possible values from isyConstants: ELK_ALARM_TRIP_STATE_DISARMED, ELK_ALARM_TRIP_STATE_EXIT_DELAY or ELK_ALARM_TRIP_STATE_TRIPPED.
* `getAlarmState()` - Returns the current alarm state. Possible values from isyConstants: ELK_ALARM_STATE_NOT_READY_TO_ARM, ELK_ALARM_STATE_READY_TO_ARM, ELK_ALARM_STATE_READY_TO_ARM_VIOLATION, ELK_ALARM_STATE_ARMED_WITH_TIMER, ELK_ALARM_STATE_ARMED_FULLY, ELK_ALARM_STATE_FORCE_ARMED_VIOLATION or ELK_ALARM_STATE_ARMED_WITH_BYPASS.
* `getAlarmMode()` - Returns the current alarm mode. Possible values from isyConstants: ELK_ALARM_MODE_DISARMED, ELK_ALARM_MODE_AWAY, ELK_ALARM_MODE_STAY, ELK_ALARM_MODE_STAY_INSTANT, ELK_ALARM_MODE_NIGHT, ELK_ALARM_MODE_NIGHT_INSTANT or ELK_ALARM_MODE_VACATION.

TODO
----

* Unit tests.
* Better error checking.
* Recoverability in the websocket connection. These can drop over time.
* The ISY-994 will sometimes return incomplete XML (missing part of the closing tag) and we should be resilient to that.
* Elk CO sensors
* ELk > 1 areas
* Cleanup constants