Object.defineProperty(exports, "__esModule", { value: true });
var Family;
(function (Family) {
    Family[Family["Insteon"] = 1] = "Insteon";
    Family[Family["UPB"] = 2] = "UPB";
    Family[Family["ZigBee"] = 3] = "ZigBee";
    Family[Family["ZWave"] = 4] = "ZWave";
    Family[Family["Generic"] = 7] = "Generic";
    Family[Family["Poly"] = 10] = "Poly";
})(Family = exports.Family || (exports.Family = {}));
var EventType;
(function (EventType) {
    EventType["PropertyChanged"] = "";
    EventType[EventType["Heartbeat"] = 0] = "Heartbeat";
    EventType[EventType["Trigger"] = 1] = "Trigger";
    EventType[EventType["DriverSpecific"] = 2] = "DriverSpecific";
    EventType[EventType["NodeChanged"] = 3] = "NodeChanged";
    EventType[EventType["SystemConfigChanged"] = 4] = "SystemConfigChanged";
    EventType[EventType["SystemStatusChanged"] = 5] = "SystemStatusChanged";
    EventType[EventType["InternetAccessChanged"] = 6] = "InternetAccessChanged";
    EventType[EventType["ProgressReport"] = 7] = "ProgressReport";
    EventType[EventType["SecuritySystem"] = 8] = "SecuritySystem";
    EventType[EventType["SystemAlert"] = 9] = "SystemAlert";
    EventType[EventType["OpenADR"] = 10] = "OpenADR";
    EventType[EventType["Climate"] = 11] = "Climate";
    EventType[EventType["APISEP"] = 12] = "APISEP";
    EventType[EventType["EnergyMonitoring"] = 13] = "EnergyMonitoring";
    EventType[EventType["UPBLinker"] = 14] = "UPBLinker";
    EventType[EventType["UPBDeviceAdder"] = 15] = "UPBDeviceAdder";
    EventType[EventType["UPBDeviceStatus"] = 16] = "UPBDeviceStatus";
    EventType[EventType["GasMeter"] = 17] = "GasMeter";
    EventType[EventType["ZigBee"] = 18] = "ZigBee";
    EventType[EventType["Elk"] = 19] = "Elk";
    EventType[EventType["DeviceLinker"] = 20] = "DeviceLinker";
    EventType[EventType["ZWave"] = 21] = "ZWave";
    EventType[EventType["Billing"] = 22] = "Billing";
    EventType[EventType["Portal"] = 23] = "Portal";
})(EventType = exports.EventType || (exports.EventType = {}));
class ISYEvent {
    constructor(eventData) {
        this.action = eventData.action;
        this.eventInfo = eventData.eventInfo;
    }
}
class GenericEvent extends ISYEvent {
}
class NodeEvent extends ISYEvent {
    constructor(eventData) {
        super(eventData);
        this.nodeAddress = eventData.node;
    }
}
class GenericNodeEvent extends NodeEvent {
}
class PropertyChangedEvent extends NodeEvent {
    constructor(eventData) {
        super(eventData);
        this.property = eventData.control;
        this.formattedValue = eventData.fmtAct;
    }
}
