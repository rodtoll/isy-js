"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const ISYConstants = exports.ISYConstants = {
  states: {
    lock: {
      locked: 1,
      unlocked: 0
    },
    secureLock: {
      secured: 1,
      notSecured: 0
    },
    doorWindow: {
      closed: 0,
      open: 255
    },
    motionSensor: {
      on: 255,
      off: 0
    },
    dimLevel: {
      min: 0,
      max: 100
    },
    leakSensor: {
      dry: "Dry",
      wet: "Wet",
      heartbeat: "hb"
    },
    fan: {
      off: "DOF",
      on: "DON",
      low: 63,
      medium: 191,
      high: 255
    },
    climate: {
      fanMode: {
        on: 7,
        auto: 8
      },
      mode: {
        off: 0,
        heat: 1,
        cool: 2,
        auto: 3,
        fan: 4,
        programAuto: 5,
        programHeat: 6,
        programCool: 7
      },
      scheduleMode: {
        hold: 0,
        run: 1,
        away: 2
      },
      operatingMode: {
        idle: 0,
        heating: 1,
        cooling: 2
      },
      unitOfMeasure: {
        celcius: 1,
        fahrenheit: 2
      }

    }
  },
  cmds: {
    on: "DON",
    off: "DOF",
    dimmable: {
      fastOn: "DFON",
      fastOff: "DFOF",
      brighten: "BRT",
      dim: "DIM",
      fadeUp: "FDUP",
      fadeDown: "FDDOWN",
      fadeStop: "FDSTOP"
    },
    light: {
      on: "DON",
      off: "DOF"
    },
    lock: {
      lock: "DON",
      unlock: "DOF"
    },
    fan: {
      on: "DON",
      off: "OFF"
    }
  },
  props: {
    status: "ST",
    rampRate: "RR",
    onLevel: "OL",
    batteryLevel: "BATLVL",
    secureLock: {
      mode: "SECMD"
    },
    fan: {
      off: "off",
      "low": "low",
      "medium": "medium",
      "high": "high"
    },
    zWave: {
      lockAlarm: "ALARM",
      lockAccess: "USRNUM",
      lockStatus: "ST",
      energyPowerFactor: "PF",
      energyPowerPolarizedPower: "PPW",
      energyPowerCurrent: "CC",
      energyPowerTotalPower: "TPW",
      energyPowerVoltage: "CV"
    },
    climate: {
      temperature: "CLITEMP",
      humidity: "CLIHUM",
      operatingMode: "CLIHCS",
      mode: "CLIMD",
      fanMode: "CLIFS",
      fanState: "CLIFRS",
      coolSetPoint: "CLISPC",
      heatSetPoint: "CLISPH",
      scheduleMode: "CLISMD",
      energyMode: "CLIEMD",
      unitOfMeasure: "UOM"
    }
  },
  deviceTypes: {
    lock: "Lock",
    secureLock: "SecureLock",
    light: "Light",
    dimmableLight: "DimmableLight",
    outlet: "Outlet",
    fan: "Fan",
    unknown: "Unknown",
    doorWindowSensor: "DoorWindowSensor",
    alarmDoorWindowSensor: "AlarmDoorWindowSensor",
    coSensor: "CoSensor",
    alarmPanel: "AlarmPanel",
    motionSensor: "MotionSensor",
    leakSensor: "LeakSensor",
    remote: "Remote",
    scene: "Scene",
    thermostat: "Thermostat",
    polyNode: "PolyNode"
  },
  variableTypes: {
    integer: 1,
    state: 2
  },
  nodeTypes: {
    device: 1,
    scene: 2,
    x10a10: 4
  },
  families: {
    insteon: 1,
    upb: 2,
    zigBee: 3,
    zWave: 4,
    poly: 10
  },
  updateTypes: {
    elk: "ELK_UPDATE",
    zone: "ZONE_UPDATE",
    property: "PROPERTY_UPDATE",
    generic: "GENERIC_UPDATE"
  },
  categories: {
    controller: 0,
    dimmableControl: 1,
    relayControl: 2,
    networkBridge: 3,
    irrigationControl: 4,
    climateControl: 5,
    poolControl: 6,
    sensorActuator: 7,
    homeEntertainment: 8,
    energyManagement: 9,
    applianceControl: 10,
    windowShadeControl: 14,
    accessControl: 15,
    securityHealthSafety: 16,
    a10x10: 113,
    virtual: 127,
    unknown: 254
  }
};

exports.default = ISYConstants;
const Props = exports.Props = ISYConstants.props;
const States = exports.States = ISYConstants.states;
const Commands = exports.Commands = ISYConstants.cmds;
const DeviceTypes = exports.DeviceTypes = ISYConstants.deviceTypes;
const Families = exports.Families = ISYConstants.families;
const VariableTypes = exports.VariableTypes = ISYConstants.variableTypes;
const UpdateTypes = exports.UpdateTypes = ISYConstants.updateTypes;
const NodeTypes = exports.NodeTypes = ISYConstants.nodeTypes;
const Categories = exports.Categories = ISYConstants.categories;