export declare const ISYConstants: {
    States: {
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
        MotionSensor: {
            Triggered: number;
            NotTriggered: number;
        };
        Level: {
            Min: number;
            Max: number;
        };
        LeakSensor: {
            Dry: string;
            Wet: string;
            Heartbeat: string;
        };
        Fan: {
            Off: string;
            On: string;
            Low: number;
            Medium: number;
            High: number;
        };
        Climate: {
            FanMode: {
                on: number;
                auto: number;
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
        Fan: {
            off: string;
            "low": string;
            "medium": string;
            "high": string;
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
            UnitOfMeasure: string;
        };
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
    VariableTypes: {
        Integer: number;
        State: number;
    };
    NodeTypes: {
        Device: number;
        Scene: number;
        X10A10: number;
    };
    Families: {
        Insteon: number;
        UPB: number;
        ZigBee: number;
        ZWave: number;
        Poly: number;
    };
    UpdateTypes: {
        elk: string;
        zone: string;
        property: string;
        generic: string;
    };
    Categories: {
        Controller: number;
        DimmableControl: number;
        RelayControl: number;
        NetworkBridge: number;
        IrrigationControl: number;
        ClimateControl: number;
        PoolControl: number;
        SensorActuator: number;
        HomeEntertainment: number;
        EnergyManagement: number;
        ApplianceControl: number;
        WindowShadeControl: number;
        AccessControl: number;
        SecurityHealthSafety: number;
        A10X10: number;
        Virtual: number;
        Unknown: number;
    };
};
export default ISYConstants;
export declare const Props: {
    Status: string;
    RampRate: string;
    OnLevel: string;
    BatteryLevel: string;
    SecureLock: {
        Mode: string;
    };
    Fan: {
        off: string;
        "low": string;
        "medium": string;
        "high": string;
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
        UnitOfMeasure: string;
    };
};
export declare const States: {
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
    MotionSensor: {
        Triggered: number;
        NotTriggered: number;
    };
    Level: {
        Min: number;
        Max: number;
    };
    LeakSensor: {
        Dry: string;
        Wet: string;
        Heartbeat: string;
    };
    Fan: {
        Off: string;
        On: string;
        Low: number;
        Medium: number;
        High: number;
    };
    Climate: {
        FanMode: {
            on: number;
            auto: number;
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
export declare const Families: {
    Insteon: number;
    UPB: number;
    ZigBee: number;
    ZWave: number;
    Poly: number;
};
export declare const VariableTypes: {
    Integer: number;
    State: number;
};
export declare const UpdateTypes: {
    elk: string;
    zone: string;
    property: string;
    generic: string;
};
export declare const NodeTypes: {
    Device: number;
    Scene: number;
    X10A10: number;
};
export declare const Categories: {
    Controller: number;
    DimmableControl: number;
    RelayControl: number;
    NetworkBridge: number;
    IrrigationControl: number;
    ClimateControl: number;
    PoolControl: number;
    SensorActuator: number;
    HomeEntertainment: number;
    EnergyManagement: number;
    ApplianceControl: number;
    WindowShadeControl: number;
    AccessControl: number;
    SecurityHealthSafety: number;
    A10X10: number;
    Virtual: number;
    Unknown: number;
};
