// MOCHA TEST SUITE
// Designed to work against a fake-isy-994i server (see github.com/rodtoll/fake-isy-994i). Will not run unmodified against a real server as test devices
// won't be found on that server AND real servers can't have their state reset.
//
var restler = require('restler');
var assert = require('assert');
var ISY = require('../isy.js').ISY;
var ISYLightDevice = require('../isydevice').ISYLightDevice;
var ISYLockDevice = require('../isydevice').ISYLockDevice;
var ISYOutletDevice = require('../isydevice').ISYOutletDevice;
var ISYDoorWindowDevice = require('../isydevice').ISYDoorWindowDevice;
var ISYFanDevice = require('../isydevice').ISYFanDevice;
var ISYMotionSensorDevice = require('../isydevice').ISYMotionSensorDevice;
var ISYScene = require('../isyscene').ISYScene;
var ELKAlarmPanelDevice = require('../elkdevice').ELKAlarmPanelDevice;
var ElkAlarmSensor = require('../elkdevice').ElkAlarmSensor;
var ISYBaseDevice = require('../isydevice').ISYBaseDevice;

var expectedDeviceCountWithElkWithScenes = 228;
var expectedDeviceCountWithElkNoScenes = 179;
var expectedDeviceCountWithoutElkWithScenes = 194;
var expectedDeviceCountWithoutElkNoScenes = 145;
var expectedDimmableLightCount = 78;
var expectedLightCount = 102;
var expectedLockCount = 3;
var expectedDoorWindowCount = 7;
var expectedMotionCount = 5;
var expectedFanCount = 3;
var expectedOutletCount = 4;
var expectedSceneCount = 49;
var expectedElkAlarmCount = 0;
var expectedElkSensorCount = 34;
var expectedGenericCount = 21;
var expectedType1VariablesCount = 25;
var expectedType2VariablesCount = 32;
var sampleType1VariableId = '1';
var sampleType1VariableName = 'OfficeMotionEnabled';
var sampleType2VariableName = 'AlarmFrontDoorOpen';
var sampleType2VariableId = '1';
var sampleElkZone = 'ElkZone22';
var sampleSceneId = '12627';
var sampleDimmableLight = '33 9B DC 1';
var sampleKeypadDimmableButton = '2B 99 34 8';
var sampleZWaveLock = 'ZW002_1';
var sampleMotionSensorSensor = '21 62 43 1';
var sampleMorningLincLock = '29 3D E2 1';
var sampleIOLincSensor = '17 79 81 1';
var sampleFanLincFan = '14 A6 C5 2';
var sampleFanLincLight = '14 A7 12 1';
var sampleFanLincFanOffState = '14 A8 BC 2';
var sampleOutletLinc = '19 C0 E4 1';
var sampleDisabledDevice = '1F 42 F7 1';
var sampleApplianceLinc = '1F 46 F0 1';
var sampleOnOffLight = '18 36 B1 1';
var sampleLightFromMotionLightKit = '17 15 6A 1';
var sampleDoorWindowSensor = '14 47 41 1';
var sampleSceneWithAllLightsOff = '27346';
var sampleGenericDevice = '14 5C B2 2';
var sampleSceneWithAllLightsOffAllImpacted = ['18 12 18 1', '19 53 90 1', /* The Scene itself */ '27346'];
var testServerAddress = '127.0.0.1:3000';
var testServerUserName = 'admin';
var testServerPassword = 'password';

var sampleBaseDeviceList = [
    {address: sampleDimmableLight, type: 'DimmableLight'}, 
    {address: sampleKeypadDimmableButton, type: 'DimmableLight'}, 
    {address: sampleZWaveLock, type: 'SecureLock'},
    {address: sampleMotionSensorSensor, type: 'MotionSensor'},
    {address: sampleMorningLincLock, type: 'DoorLock'},
    {address: sampleIOLincSensor, type: 'DoorWindowSensor'}, 
    {address: sampleFanLincFan, type: 'Fan'}, 
    {address: sampleFanLincLight, type: 'DimmableLight'}, 
    {address: sampleOutletLinc, type: 'Light'},
    {address: sampleOnOffLight, type: 'Light'},
    {address: sampleApplianceLinc, type: 'Outlet'},
    {address: sampleLightFromMotionLightKit, type: 'Light'},
    {address: sampleDoorWindowSensor, type: 'DoorWindowSensor'},
    {address: sampleGenericDevice, type: 'Unknown'}
    ];

function countDevices(done, elkEnabled, scenesEnabled) {
    var isy = new ISY(testServerAddress, testServerUserName, testServerPassword, true, function() {}, false, true);        
    assert.doesNotThrow(function() { 
        isy.initialize(function() {
            var deviceList = isy.getDeviceList();
            var lightCount = 0;
            var lockCount = 0;
            var doorWindowCount = 0;
            var motionCount = 0;
            var fanCount = 0;
            var outletCount = 0;
            var sceneCount = 0;
            var elkAlarmCount = 0;
            var elkSensorCount = 0;
            var genericCount = 0;
            var dimmableLightCount = 0;
            for(var deviceIndex = 0; deviceIndex < deviceList.length; deviceIndex++) {
                var device = deviceList[deviceIndex];
                assert(device.address != sampleDisabledDevice, 'Should not enumerate a disabled device');
                if(device instanceof ISYLightDevice) {
                    lightCount++;
                    if(device.isDimmable) {
                        dimmableLightCount++;
                    }
                } else if(device instanceof ISYLockDevice) {
                    lockCount++;
                } else if(device instanceof ISYOutletDevice) {
                    outletCount++;
                } else if(device instanceof ISYDoorWindowDevice) {
                    doorWindowCount++;
                } else if(device instanceof ISYFanDevice) {
                    fanCount++;
                } else if(device instanceof ISYMotionSensorDevice) {
                    motionCount++;
                } else if(device instanceof ISYScene) {
                    sceneCount++;
                } else if(device instanceof ELKAlarmPanelDevice) {
                    elkAlarmCount++;
                } else if(device instanceof ElkAlarmSensor) {
                    elkSensorCount++;
                } else if(device instanceof ISYBaseDevice) {
                    genericCount++;
                }
            }
            assert.equal(lightCount, expectedLightCount, "Light count is incorrect");
            assert.equal(lockCount, expectedLockCount, "Lock count incorrect");
            assert.equal(doorWindowCount, expectedDoorWindowCount, "Door window sensor count is incorrect");
            assert.equal(motionCount, expectedMotionCount, "Motion sensor count is incorrect");
            assert.equal(fanCount, expectedFanCount, "Fan count is incorrect");
            assert.equal(outletCount, expectedOutletCount, "Outlet count is incorrect");
            assert.equal(sceneCount, (scenesEnabled) ? expectedSceneCount : 0, "Scene count is incorrect"); 
            assert.equal(elkAlarmCount, (elkEnabled) ? expectedElkAlarmCount : 0, "Elk alarm panel count is incorrect");
            assert.equal(elkSensorCount, (elkEnabled) ? expectedElkSensorCount : 0, "Elk sensor count is incorrect");
            assert.equal(genericCount, expectedGenericCount, 'Generic device count is incorrect');
            assert.equal(dimmableLightCount, expectedDimmableLightCount, 'Dimmable light count is incorrect');
            var panel = isy.getElkAlarmPanel();
            if(elkEnabled) {
                assert(panel instanceof ELKAlarmPanelDevice, "Should have a panel");
            } else {
                assert(panel == null, "Should have no panel when elk disabled");
            }
            if(scenesEnabled) {
                assert.equal(isy.getSceneList().length, sceneCount, 'Should have scenes in the scene list');
            }
            done();
        });
    });
}

function checkDevice(testParam, device) {
    assert(device != null && device != undefined, 'Should have found the specified device for address '+testParam.address);
    assert.equal(device.address, testParam.address, 'Should have expected address for address '+testParam.address);
    assert.equal(device.deviceType, testParam.type, 'Should have expected type for address '+testParam.address);
        
}

function checkForExpectedDevices(done, elkEnabled, scenesEnabled) {
    var isy = new ISY(testServerAddress, testServerUserName, testServerPassword, true, function() {}, false, true);        
    assert.doesNotThrow(function() { 
        isy.initialize(function() {
            for(var addressIndex = 0; addressIndex < sampleBaseDeviceList.length; addressIndex++) {
                checkDevice(sampleBaseDeviceList[addressIndex], isy.getDevice(sampleBaseDeviceList[addressIndex].address));
            } 
            if(elkEnabled) {
                checkDevice({address: sampleElkZone, type: 'AlarmDoorWindowSensor'}, isy.getDevice(sampleElkZone));
            }
            if(scenesEnabled) {
                checkDevice({address: sampleSceneId, type: 'Scene'}, isy.getDevice(sampleSceneId));
            }
            if(!elkEnabled) {
                assert(isy.getDevice(sampleElkZone)==null, "Elk disabled, shouldn't have an elk device");
            }
            if(!scenesEnabled) {
                assert(isy.getDevice(sampleSceneId)==null, 'Scenes disabled should not have scene in device list');
            }
            done();
        });
    });
}

function resetServerState(done) {
    restler.get('http://'+testServerAddress+'/config/reset').on('complete', function(result, response) { done(); });
}

// Used to send set to on command for sensors. Doesn't work on real ISY.
function sendServerOnCommand(isy, deviceAddress,done) {
    isy.sendRestCommand(deviceAddress, 'DON', null, function() { done(); });
}

function sendServerZoneCommand(isy, zoneId, command, done) {
    isy.sendRestCommand(zoneId, command, null, function() { done(); });
}

describe('ISY Device and scene Enumeration and Creation', function() {
  describe('Device enumeration (scenes=true,elk=true)', function() {
      it('Basic startup should work and right number of devices should be enumerated ', function(done) {
          var isy = new ISY(testServerAddress, testServerUserName, testServerPassword, true, function() {}, false, true);
          assert.doesNotThrow(function() {
              isy.initialize(function() {
                  assert.equal(isy.getDeviceList().length, expectedDeviceCountWithElkWithScenes, 'Device count incorrect');
                  done();
              });
          });
      });
    it('Right device count and types are present', function(done) {
        countDevices(done,true,true);
    });    
    it('Device lookup works and expected variety of devices present', function(done) {
        checkForExpectedDevices(done,true,true);
    });    
  });
  describe('Device enumeration(scenes=true,elk=false)', function() {
    it('Basic startup should work and right number of devices should be enumerated ', function(done) {
        var isy = new ISY(testServerAddress, testServerUserName, testServerPassword, false, function() {}, false, true);
            assert.doesNotThrow(function() {
            isy.initialize(function() {
                assert.equal(isy.getDeviceList().length, expectedDeviceCountWithoutElkWithScenes, 'Device count incorrect');
                done();
            });
        });
    });
    it('Right device count and types are present', function(done) {
        countDevices(done,true,true);
    });    
    it('Device lookup works and expected variety of devices present', function(done) {
        checkForExpectedDevices(done,true,true);
    });      
  });  
  describe('Device enumeration (scenes=false,elk=false)', function() {
    it('Basic startup should work and right number of devices should be enumerated ', function(done) {
      var isy = new ISY(testServerAddress, testServerUserName, testServerPassword, false, function() {}, false, false);        
      assert.doesNotThrow(function() { 
        isy.initialize(function() {
            assert.equal(isy.getDeviceList().length, expectedDeviceCountWithoutElkNoScenes, 'Device count incorrect');
            done();
        });
      });
    });
    it('Right device count and types are present', function(done) {
        countDevices(done,true,true);
    });    
    it('Device lookup works and expected variety of devices present', function(done) {
        checkForExpectedDevices(done,true,true);
    });      
  }); 
  describe('Device enumeration (scenes=false,elk=true)', function() {
    it('Basic startup should work and right number of devices should be enumerated ', function(done) {
      var isy = new ISY(testServerAddress, testServerUserName, testServerPassword, true, function() {}, false, false);        
      assert.doesNotThrow(function() { 
        isy.initialize(function() {
            assert.equal(isy.getDeviceList().length, expectedDeviceCountWithElkNoScenes, 'Device count incorrect');
            done();
        });
      });
    });
    it('Right device count and types are present', function(done) {
        countDevices(done,true,true);
    });    
    it('Device lookup works and expected variety of devices present', function(done) {
        checkForExpectedDevices(done,true,true);
    });      
  }); 
  describe('#check scene indexing', function() {
    it('Basic scene lookup', function(done) {
      var isy = new ISY(testServerAddress, testServerUserName, testServerPassword, true, function() {}, false, false);        
      assert.doesNotThrow(function() { 
        isy.initialize(function() {
            assert.equal(isy.getSceneList().length, expectedSceneCount, 'Scene count incorrect');
            assert(isy.getScene(sampleSceneId) instanceof ISYScene, 'Scene lookup working');
            assert.equal(isy.getScene(sampleSceneId).address, sampleSceneId, 'The right scene object is returned' )
            done();
        });
      });
    });      
  }); 
});

function runTrueFalseTest(isy, deviceId, stateFunctionToTest, sendFunctionToTest, done) {
    var deviceToCheck = isy.getDevice(deviceId);
    var startingChangedTimestamp = deviceToCheck.lastChanged;
    var stateToExpect = !deviceToCheck[stateFunctionToTest]();
    var testRunIndex = 0;
    isy.changeCallback = function (isy, changedDevice) {
        if(changedDevice.address == deviceToCheck.address) {
            assert.equal(stateToExpect, deviceToCheck[stateFunctionToTest](), 'Should have expected state for device: '+deviceToCheck.address);
            assert(changedDevice.lastChanged > startingChangedTimestamp, 'lastChanged property should have changed.')
            if(testRunIndex == 0) {
                stateToExpect = !deviceToCheck[stateFunctionToTest]();
                deviceToCheck[sendFunctionToTest](stateToExpect, function() {});
                testRunIndex++;
            } else {
                done();
            }
        }
    }
    deviceToCheck[sendFunctionToTest](stateToExpect, function() {});    
}

function runFanTest(isy, deviceId, fanSpeed, done) {
    var deviceToCheck = isy.getDevice(deviceId);
    var startingChangedTimestamp = deviceToCheck.lastChanged;
    isy.changeCallback = function (isy, changedDevice) {
        if (deviceId == changedDevice.address) {
            assert.equal(fanSpeed, deviceToCheck.getCurrentFanState(), 'Should have expected fan speed for device: ' + deviceToCheck.address);
            assert(changedDevice.lastChanged > startingChangedTimestamp, 'lastChanged property should have changed.')
            done();
        }
    }
    deviceToCheck.sendFanCommand(fanSpeed, function () {});
}


function runSensorTest(isy, deviceId, stateFunctionToTest, done) {
    var deviceToCheck = isy.getDevice(deviceId);
    var startingChangedDate = deviceToCheck.lastChanged;
    isy.changeCallback = function (isy, changedDevice) {
        if(changedDevice.address == deviceToCheck.address) {
            assert(deviceToCheck[stateFunctionToTest](), 'Sensor should show true state: '+deviceToCheck.address);
            assert(deviceToCheck.lastChanged > startingChangedDate, 'Sesnor last changed data should have updated');
            done();
        }
    }    
    sendServerOnCommand(isy, deviceId, function() {});
}

function runSceneTest(isy, sceneId, lightStateToSet, impactedDeviceList, done) {
    var sceneToCheck = isy.getDevice(sceneId);
    var startingChangedDate = sceneToCheck.lastChanged;
    var devicesToCheck = [];
    var doneCalled = false;
    for(var index = 0; index < impactedDeviceList.length; index++) {
        devicesToCheck.push(impactedDeviceList[index]);
    }
    isy.changeCallback = function (isy,changedDevice) {
        for(var deviceIndex = 0; deviceIndex < devicesToCheck.length; deviceIndex++) {
            if(devicesToCheck[deviceIndex] == changedDevice.address) {
                if(sceneToCheck.address != devicesToCheck[deviceIndex]) {
                    assert.equal(changedDevice.getCurrentLightState(), lightStateToSet, "Should be setting devices to the state we expect");
                }
                devicesToCheck.splice(deviceIndex, 1);
                break;
            }
        }
        if(devicesToCheck.length == 0) {
            if(!doneCalled) {
                assert.equal(sceneToCheck.getCurrentLightState(), lightStateToSet, 'Scene should now be set to the desired state');
                assert(sceneToCheck.getAreAllLightsInSpecifiedState(lightStateToSet), "Once all lights are accounted for getAreAllLightsInSpecifiedState() should be true" );
                assert(sceneToCheck.lastChanged > startingChangedDate, 'Scene last changed data should have updated');
                done();
                doneCalled = true;
            }
        } else if (devicesToCheck.length > 1) {
            assert(!sceneToCheck.getAreAllLightsInSpecifiedState(lightStateToSet), "Until all lights are accounted for getAreAllLightsInSpecifiedState() should be false" );
        }
    }
    sceneToCheck.sendLightCommand(lightStateToSet, function() {});
}

function runElkZoneTest(isy, zoneId, command, expectedCount, expectedResult, stateFunctionToTest, done) {
    var callbackCount = 0;
    var deviceId = "ElkZone"+zoneId;
    var deviceToCheck = isy.getDevice(deviceId);
    var startingChangedTimestamp = new Date();
    isy.changeCallback = function (isy, changedDevice) {
        if(changedDevice.address == deviceToCheck.address) {
            callbackCount++;
            if(callbackCount == expectedCount) {
                assert.equal(deviceToCheck[stateFunctionToTest](), expectedResult, 'Elk Sensor should show expected state: '+deviceToCheck.address);
                assert(deviceToCheck.lastChanged > startingChangedTimestamp, 'lastChanged property should have changed.')
                done();
            }
        }
    }
    sendServerZoneCommand(isy, zoneId, command, function() {});
}


describe('ISY Device change notifications', function() {
    var notifyFunc = null;
    function testChangeCallback(isy,device) {
        if(notifyFunc != null) {
            notifyFunc(device);
        }
    }
    var isy = null;
    beforeEach(function(done) {
        resetServerState(function() { 
            isy = new ISY(testServerAddress, testServerUserName, testServerPassword, true, testChangeCallback, false, true);         
            isy.initialize(done);
        });                
    });
    describe('Dimmable light change notifications', function() {
        it('Light on and off state (non-dimmable)', function(done) {
            runTrueFalseTest(isy, sampleOnOffLight, 'getCurrentLightState', 'sendLightCommand', done);
            assert(!isy.getDevice(sampleOnOffLight).isDimmable, 'On off light should not be dimmable');
        });
        it('Light on and off state (dimmable)', function(done) {
            runTrueFalseTest(isy, sampleDimmableLight, 'getCurrentLightState', 'sendLightCommand', done);
            assert(isy.getDevice(sampleDimmableLight).isDimmable, 'On off light should not be dimmable');
        });
        it('Light on and off state (keybad dimmable button)', function(done) {
            runTrueFalseTest(isy, sampleKeypadDimmableButton, 'getCurrentLightState', 'sendLightCommand', done);
        });
        it('Light on and off state (fanlinc light)', function(done) {
            runTrueFalseTest(isy, sampleKeypadDimmableButton, 'getCurrentLightState', 'sendLightCommand', done);
        });        
        it('Light on and off state (motion light)', function(done) {
            runTrueFalseTest(isy, sampleKeypadDimmableButton, 'getCurrentLightState', 'sendLightCommand', done);
        });        
        it('Light dim state change notification to 50%', function(done) {
            var deviceToCheck = isy.getDevice(sampleDimmableLight);
            var dimStateToExpect = 50;
            deviceToCheck.sendLightCommand(false, function() {});                        
            notifyFunc = function (changedDevice) {
                if(changedDevice.address == deviceToCheck.address) {
                    assert.equal(dimStateToExpect, deviceToCheck.getCurrentLightDimState(), 'Should have expected state for device: '+deviceToCheck.address);
                    assert(deviceToCheck.getCurrentLightState(), 'Ensure light is on');
                    done();
                }
            }
            deviceToCheck.sendLightDimCommand(dimStateToExpect, function() {});
        });
        
        it('Light dim state change notification to on has 100 dim level', function(done) {
            var deviceToCheck = isy.getDevice(sampleDimmableLight);
            notifyFunc = function (changedDevice) {
                if(changedDevice.address == deviceToCheck.address) {
                    assert.equal(100, deviceToCheck.getCurrentLightDimState(), 'Should have expected state for device: '+deviceToCheck.address);
                    assert(deviceToCheck.getCurrentLightState(), 'Ensure light is on');
                    done();
                }
            }
            deviceToCheck.sendLightCommand(true, function() {});
        });      
        it('Light dim state change notification to off has 0 dim level', function(done) {
            var deviceToCheck = isy.getDevice(sampleDimmableLight);
            var notifyCount = 0;
            notifyFunc = function (changedDevice) {
                if(changedDevice.address == deviceToCheck.address) {
                    // Need to skip first notification as it is to turn the light on
                    if(notifyCount > 0) {
                        assert.equal(0, deviceToCheck.getCurrentLightDimState(), 'Should have expected state for device: '+deviceToCheck.address);
                        assert(!deviceToCheck.getCurrentLightState(), 'Ensure light is on');
                        done();
                    } else {
                        notifyCount++;
                    }
                }
            }
            // Need to turn it on first as default state for this light is off
            deviceToCheck.sendLightCommand(true, function() {});
            deviceToCheck.sendLightCommand(false, function() {});            
        });          
    });  
    describe('Locks', function() {
        it('Secure Lock locked and unlocked state', function(done) {
            runTrueFalseTest(isy, sampleZWaveLock, 'getCurrentLockState', 'sendLockCommand', done);
        });
        it('MorningLinc Lock locked and unlocked state', function(done) {
            runTrueFalseTest(isy, sampleMorningLincLock, 'getCurrentLockState', 'sendLockCommand', done);
        });        
    });
    describe('Sensors', function() {
        it('Insteon Motion Sensor Triggered', function(done) {
            runSensorTest(isy, sampleMotionSensorSensor, 'getCurrentMotionSensorState', done);            
        });
        it('Insteon Door Window Sensor from IOLinc', function(done) {
            runSensorTest(isy, sampleIOLincSensor, 'getCurrentDoorWindowState', done);            
        });        
         it('Insteon Door Window Sensor', function(done) {
            runSensorTest(isy, sampleDoorWindowSensor, 'getCurrentDoorWindowState', done);            
        });        
    });    
    describe('Outlets on and off2', function() {
        it('ApplianceLinc on and off', function(done) {
            assert.equal(isy.getDevice(sampleApplianceLinc).deviceType, 'Outlet', 'ApplianceLinc Should be an outlet');            
            runTrueFalseTest(isy, sampleApplianceLinc, 'getCurrentOutletState', 'sendOutletCommand', done);
        });        
    });
    describe('Fan levels', function() {
        it('Set fan to low', function(done) {
            var deviceToCheck = isy.getDevice(sampleFanLincFan);
            runFanTest(isy, sampleFanLincFan, deviceToCheck.FAN_LEVEL_LOW, done);
        });
        it('Set fan to med', function(done) {
            var deviceToCheck = isy.getDevice(sampleFanLincFan);
            runFanTest(isy, sampleFanLincFan, deviceToCheck.FAN_LEVEL_MEDIUM, done);
        });
        it('Set fan to high', function(done) {
            var deviceToCheck = isy.getDevice(sampleFanLincFanOffState);
            runFanTest(isy, sampleFanLincFanOffState, deviceToCheck.FAN_LEVEL_HIGH, done);
        });
    });
    describe('Scenes', function() {
        it('Scene with all lights off turns them all on when scene is turned on and then turns them all off', function(done) {
            runSceneTest(isy, sampleSceneWithAllLightsOff, true, sampleSceneWithAllLightsOffAllImpacted, function() {
                runSceneTest(isy, sampleSceneWithAllLightsOff, false, sampleSceneWithAllLightsOffAllImpacted, done);
            });
        });
    });
    describe('Elk Sensors', function() {
        it('Logical state change when you open then close', function(done) {
            runElkZoneTest(isy, "1", "OPEN", 1, 2, 'getLogicalState', function() {
                runElkZoneTest(isy, "1", "CLOSE", 1, 0,'getLogicalState', done);
            });

        });
        it('Physical state change when you open then close', function(done) {
            runElkZoneTest(isy, "1", "OPEN", 1, 1, 'getPhysicalState', function() {
                runElkZoneTest(isy, "1", "CLOSE", 1, 2, 'getPhysicalState', done);
            });
        });
    });
});

function runVariableTest(variableType, variableId, variableValue, done) {
    var initialTimeStamp = new Date();
    function variableCheckCallback(isy, variable) {
        if(variable.id == variableId && variable.type == variableType) {
            assert.equal(variable.value, variableValue, "Variable should have been updated to expected value");
            assert(variable.lastChanged > initialTimeStamp, "Variable last changed should have changed. Before: "+initialTimeStamp.toString()+" lastChanged: "+variable.lastChanged);
            done();
        }
    }
    resetServerState(function() {
        var isy = new ISY(testServerAddress, testServerUserName, testServerPassword, true, function () {
        }, false, true, false, variableCheckCallback);
        isy.initialize(function() {
            var variable = isy.getVariable(variableType, variableId);
            assert(variable != null, "Should have found expected variable");
            // Cheat and push back last changed date as this may run quick enough seconds haven't changed.
            variable.lastChanged.setFullYear(2012);
            initialTimeStamp = variable.lastChanged;
            setTimeout(function() {
                variable.sendSetValue(variableValue, function() {});
            }, 2);

        });
    });
}
describe('ISY Variables', function() {
    describe('Variable enumeration', function () {
        it('Basic startup should work and right number of variables should be enumerated ', function (done) {
            var isy = new ISY(testServerAddress, testServerUserName, testServerPassword, true, function () {
            }, false, true);
            assert.doesNotThrow(function () {
                var type1Found = false;
                var type2Found = false;
                isy.initialize(function () {
                    var type1Count = 0;
                    var type2Count = 0;
                    for(var index = 0; index < isy.getVariableList().length; index++) {
                        var variable = isy.getVariableList()[index];
                        if(variable.type == '1' && sampleType1VariableId == variable.id) {
                            assert.equal(variable.name, sampleType1VariableName, "Type 1 variable should have expected name");
                            type1Found = true;
                        }
                        if(variable.type == '2' && sampleType2VariableId == variable.id) {
                            assert.equal(variable.name, sampleType2VariableName, "Type 2 variable name should have expected name");
                            type2Found = true;
                        }
                        if(variable.type == '1') {
                            type1Count++;
                        } else if(variable.type == '2') {
                            type2Count++;
                        } else {
                            assert(false, "Should not have any non type 1 or type 2 variables" );
                        }
                    }
                    assert(type1Found, "Should have found expected type 1 variable");
                    assert(type2Found, "Should have found expected type 2 variable");
                    assert.equal(type1Count, expectedType1VariablesCount, "Variable type 1 count is not correct");
                    assert.equal(type2Count, expectedType2VariablesCount, "Variable type 2 count is not correct");
                    done();
                });
            });
        });
    });
    describe('Variable roundtrip + notifications', function () {
        it('Type 1 variable roundtrip + notifications', function (done) {
            runVariableTest('1', sampleType1VariableId, 5, done);
        });
        it('Type 2 variable roundtrip + notifications', function (done) {
            runVariableTest('2', sampleType1VariableId, 5, done);
        });
    });
});
