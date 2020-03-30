declare const ISYConstants: {
    States: {
        Off: number;
        On: number;
        Lock: {
            Locked: number;
            Unlocked: number;
        };
        SecureLock: {
            Secured: number;
            NotSecured: number;
        };
        DoorWindow: {
            Closed: number;
            Open: number;
        };
        Siren: {};
        Sensor: {
            Triggered: number;
            NotTriggered: number;
        };
        Level: {
            Min: number;
            Max: number;
        };
        LeakSensor: {
            Dry: number;
            Wet: number;
            Heartbeat: string;
        };
        Fan: {
            Low: number;
            Medium: number;
            High: number;
        };
        Climate: {
            FanMode: {
                On: number;
                Auto: number;
            };
            Mode: {
                Off: number;
                Heat: number;
                Cool: number;
                Auto: number;
                Fan: number;
                ProgramAuto: number;
                ProgramHeat: number;
                ProgramCool: number;
            };
            ScheduleMode: {
                Hold: number;
                Run: number;
                Away: number;
            };
            OperatingMode: {
                Idle: number;
                Heating: number;
                Cooling: number;
            };
            UnitOfMeasure: {
                Celcius: number;
                Fahrenheit: number;
            };
        };
    };
    Cmds: {
        On: string;
        Off: string;
        Dimmable: {
            FastOn: string;
            FastOff: string;
            Brighten: string;
            Dim: string;
            FadeUp: string;
            FadeDown: string;
            FadeStop: string;
        };
        Lock: {
            Lock: string;
            Unlock: string;
        };
        Thermostat: {
            SetpointUp: string;
            SetpointDown: string;
        };
        Query: string;
    };
    Props: {
        Status: string;
        RampRate: string;
        OnLevel: string;
        BatteryLevel: string;
        SecureLock: {
            Mode: string;
        };
        ZWave: {
            LockAlarm: string;
            LockAccess: string;
            LockStatus: string;
            EnergyPowerFactor: string;
            EnergyPowerPolarizedPower: string;
            EnergyPowerCurrent: string;
            EnergyPowerTotalPower: string;
            EnergyPowerVoltage: string;
        };
        Climate: {
            Temperature: string;
            Humidity: string;
            OperatingMode: string;
            Mode: string;
            FanMode: string;
            FanState: string;
            CoolSetPoint: string;
            HeatSetPoint: string;
            ScheduleMode: string;
            EnergyMode: string;
        };
        Error: string;
        UnitOfMeasure: string;
    };
    deviceTypes: {
        lock: string;
        secureLock: string;
        light: string;
        dimmableLight: string;
        outlet: string;
        fan: string;
        unknown: string;
        doorWindowSensor: string;
        alarmDoorWindowSensor: string;
        coSensor: string;
        alarmPanel: string;
        motionSensor: string;
        leakSensor: string;
        remote: string;
        scene: string;
        thermostat: string;
        polyNode: string;
    };
    UpdateTypes: {
        elk: string;
        zone: string;
        property: string;
        generic: string;
    };
};
export declare enum VariableType {
    Integer = 1,
    State = 2
}
export declare enum NodeType {
    Device = 1,
    Scene = 2,
    Folder = 3,
    X10A10 = 4
}
export default ISYConstants;
export declare const Props: {
    Status: string;
    RampRate: string;
    OnLevel: string;
    BatteryLevel: string;
    SecureLock: {
        Mode: string;
    };
    ZWave: {
        LockAlarm: string;
        LockAccess: string;
        LockStatus: string;
        EnergyPowerFactor: string;
        EnergyPowerPolarizedPower: string;
        EnergyPowerCurrent: string;
        EnergyPowerTotalPower: string;
        EnergyPowerVoltage: string;
    };
    Climate: {
        Temperature: string;
        Humidity: string;
        OperatingMode: string;
        Mode: string;
        FanMode: string;
        FanState: string;
        CoolSetPoint: string;
        HeatSetPoint: string;
        ScheduleMode: string;
        EnergyMode: string;
    };
    Error: string;
    UnitOfMeasure: string;
};
export declare const States: {
    Off: number;
    On: number;
    Lock: {
        Locked: number;
        Unlocked: number;
    };
    SecureLock: {
        Secured: number;
        NotSecured: number;
    };
    DoorWindow: {
        Closed: number;
        Open: number;
    };
    Siren: {};
    Sensor: {
        Triggered: number;
        NotTriggered: number;
    };
    Level: {
        Min: number;
        Max: number;
    };
    LeakSensor: {
        Dry: number;
        Wet: number;
        Heartbeat: string;
    };
    Fan: {
        Low: number;
        Medium: number;
        High: number;
    };
    Climate: {
        FanMode: {
            On: number;
            Auto: number;
        };
        Mode: {
            Off: number;
            Heat: number;
            Cool: number;
            Auto: number;
            Fan: number;
            ProgramAuto: number;
            ProgramHeat: number;
            ProgramCool: number;
        };
        ScheduleMode: {
            Hold: number;
            Run: number;
            Away: number;
        };
        OperatingMode: {
            Idle: number;
            Heating: number;
            Cooling: number;
        };
        UnitOfMeasure: {
            Celcius: number;
            Fahrenheit: number;
        };
    };
};
export declare const Commands: {
    On: string;
    Off: string;
    Dimmable: {
        FastOn: string;
        FastOff: string;
        Brighten: string;
        Dim: string;
        FadeUp: string;
        FadeDown: string;
        FadeStop: string;
    };
    Lock: {
        Lock: string;
        Unlock: string;
    };
    Thermostat: {
        SetpointUp: string;
        SetpointDown: string;
    };
    Query: string;
};
export declare const DeviceTypes: {
    lock: string;
    secureLock: string;
    light: string;
    dimmableLight: string;
    outlet: string;
    fan: string;
    unknown: string;
    doorWindowSensor: string;
    alarmDoorWindowSensor: string;
    coSensor: string;
    alarmPanel: string;
    motionSensor: string;
    leakSensor: string;
    remote: string;
    scene: string;
    thermostat: string;
    polyNode: string;
};
export declare const UpdateTypes: {
    elk: string;
    zone: string;
    property: string;
    generic: string;
};
