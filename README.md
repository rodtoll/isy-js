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

You can then retrieve a list of devices, and operate on them, by calling isy.getDeviceList. You can then operate on the device objects.

DEVICE TYPES
------------

This library uses isydevicetypes.json to map between isy device types and friendly device names and characteristics. Update this file to add more devices.

Currently the library only handles Lights, Outlets and ZWave Locks. More will be added. 

API
---

### ISY

* `new ISY(address, username, password, changeCallback)` - Creates a new instance. address indicates the ip address of your isy, username the username for the admin user and password the password for the admin user. changeCallback is called when the property of a device changes. Takes two parameters, the pointer to the ISY object and the device.
* `initialize(handleInitialized)` - Connects to the isy, retrieves the list of devices, updates their status and starts the websocket callbacks for updating the local objects.
* `getDeviceList()` - Gets the array of devices, each represented as an ISYDevice object.
* `getDevice(address)` - Gets the device identified by the specified isy address.

### ISYDevice

Properties:

* `isy` - Gets the isy instance this device is from.
* `name` - Name for the device.
* `address` - ISY address for the device.
* `isyType` - ISY type identifier for the device. see isydevicetypes.json for the map from isy types to friendly device names.
* `deviceFriendlyName` - Friendly name for the type of device.
* `deviceType` - Type of device. Possible values; Light, Outlet, SecureLock.
* `connectionType` - Type of connection to the insteon network. Possible values - "Insteon Wired", "Insteon Wireless", "Insteon MorningLinc", "ZWave". See isydevicetypes.json for the map.
* `batteryOperated` - true if this is a battery powered device, false otherwise.

Functions:

* `getCurrentLightState()` - Gets the current Light power state. true for on, false for off.
* `sendLightCommand(state)` - Sends the command to set the Light power state. true to turn it on, false to turn it off
* `getCurrentLockState()` - Gets the current locked state of the lock device. true for locked, false for unlocked.
* `sendLockCommand(state)` - Sends the command to set the Lock state to the specified state. true to lock the door, false to unlock it.
* `getCurrentOutletState()` - Gets the current state of the outlet. true for on, false for off.
* `sendOutletCommand(state)` - Sends the command to set the outlet state to the specified state. true to turn it on, false to turn it off. 

