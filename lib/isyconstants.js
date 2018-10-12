"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISYConstants = {
    States: {
        Lock: {
            Locked: 100,
            Unlocked: 0
        },
        SecureLock: {
            Secured: 1,
            NotSecured: 0
        },
        DoorWindow: {
            Closed: 0,
            Open: 100 //255
        },
        MotionSensor: {
            Triggered: 100,
            NotTriggered: 0
        },
        Level: {
            Min: 0,
            Max: 100
        },
        LeakSensor: {
            Dry: "Dry",
            Wet: "Wet",
            Heartbeat: "hb"
        },
        Fan: {
            Off: "DOF",
            On: "DON",
            Low: 25,
            Medium: 75,
            High: 100 //255
        },
        Climate: {
            FanMode: {
                on: 7,
                auto: 8
            },
            Mode: {
                Off: 0,
                Heat: 1,
                Cool: 2,
                Auto: 3,
                Fan: 4,
                ProgramAuto: 5,
                ProgramHeat: 6,
                ProgramCool: 7
            },
            ScheduleMode: {
                Hold: 0,
                Run: 1,
                Away: 2
            },
            OperatingMode: {
                Idle: 0,
                Heating: 1,
                Cooling: 2
            },
            UnitOfMeasure: {
                Celcius: 1,
                Fahrenheit: 2
            }
        }
    },
    Cmds: {
        On: "DON",
        Off: "DOF",
        Dimmable: {
            FastOn: "DFON",
            FastOff: "DFOF",
            Brighten: "BRT",
            Dim: "DIM",
            FadeUp: "FDUP",
            FadeDown: "FDDOWN",
            FadeStop: "FDSTOP"
        },
        Lock: {
            Lock: "DON",
            Unlock: "DOF"
        },
        Query: "Query"
    },
    Props: {
        Status: "ST",
        RampRate: "RR",
        OnLevel: "OL",
        BatteryLevel: "BATLVL",
        SecureLock: {
            Mode: "SECMD"
        },
        Fan: {
            off: "off",
            "low": "low",
            "medium": "medium",
            "high": "high"
        },
        ZWave: {
            LockAlarm: "ALARM",
            LockAccess: "USRNUM",
            LockStatus: "ST",
            EnergyPowerFactor: "PF",
            EnergyPowerPolarizedPower: "PPW",
            EnergyPowerCurrent: "CC",
            EnergyPowerTotalPower: "TPW",
            EnergyPowerVoltage: "CV"
        },
        Climate: {
            Temperature: "CLITEMP",
            Humidity: "CLIHUM",
            OperatingMode: "CLIHCS",
            Mode: "CLIMD",
            FanMode: "CLIFS",
            FanState: "CLIFRS",
            CoolSetPoint: "CLISPC",
            HeatSetPoint: "CLISPH",
            ScheduleMode: "CLISMD",
            EnergyMode: "CLIEMD",
            UnitOfMeasure: "UOM"
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
    VariableTypes: {
        Integer: 1,
        State: 2
    },
    NodeTypes: {
        Device: 1,
        Scene: 2,
        X10A10: 4
    },
    Families: {
        Insteon: 1,
        UPB: 2,
        ZigBee: 3,
        ZWave: 4,
        Poly: 10
    },
    UpdateTypes: {
        elk: "ELK_UPDATE",
        zone: "ZONE_UPDATE",
        property: "PROPERTY_UPDATE",
        generic: "GENERIC_UPDATE"
    },
    Categories: {
        Controller: 0,
        DimmableControl: 1,
        RelayControl: 2,
        NetworkBridge: 3,
        IrrigationControl: 4,
        ClimateControl: 5,
        PoolControl: 6,
        SensorActuator: 7,
        HomeEntertainment: 8,
        EnergyManagement: 9,
        ApplianceControl: 10,
        WindowShadeControl: 14,
        AccessControl: 15,
        SecurityHealthSafety: 16,
        A10X10: 113,
        Virtual: 127,
        Unknown: 254
    }
};
exports.default = exports.ISYConstants;
exports.Props = exports.ISYConstants.Props;
exports.States = exports.ISYConstants.States;
exports.Commands = exports.ISYConstants.Cmds;
exports.DeviceTypes = exports.ISYConstants.deviceTypes;
exports.Families = exports.ISYConstants.Families;
exports.VariableTypes = exports.ISYConstants.VariableTypes;
exports.UpdateTypes = exports.ISYConstants.UpdateTypes;
exports.NodeTypes = exports.ISYConstants.NodeTypes;
exports.Categories = exports.ISYConstants.Categories;
