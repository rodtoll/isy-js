export declare enum Family {
    Insteon = 1,
    UPB = 2,
    ZigBee = 3,
    ZWave = 4,
    Generic = 7,
    Poly = 10
}
export interface Insteon {
    family: Family.Insteon;
}
export declare enum EventType {
    PropertyChanged = -1,
    Heartbeat = 0,
    Trigger = 1,
    DriverSpecific = 2,
    NodeChanged = 3,
    SystemConfigChanged = 4,
    SystemStatusChanged = 5,
    InternetAccessChanged = 6,
    ProgressReport = 7,
    SecuritySystem = 8,
    SystemAlert = 9,
    OpenADR = 10,
    Climate = 11,
    APISEP = 12,
    EnergyMonitoring = 13,
    UPBLinker = 14,
    UPBDeviceAdder = 15,
    UPBDeviceStatus = 16,
    GasMeter = 17,
    ZigBee = 18,
    Elk = 19,
    DeviceLinker = 20,
    ZWave = 21,
    Billing = 22,
    Portal = 23
}
