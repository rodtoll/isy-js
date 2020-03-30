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
    EventType["Heartbeat"] = "_0";
    EventType["Trigger"] = "_1";
    EventType["DriverSpecific"] = "_2";
    EventType["NodeChanged"] = "_3";
    EventType["SystemConfigChanged"] = "_4";
    EventType["SystemStatusChanged"] = "_5";
    EventType["InternetAccessChanged"] = "_6";
    EventType["ProgressReport"] = "_7";
    EventType["SecuritySystem"] = "_8";
    EventType["SystemAlert"] = "_9";
    EventType["OpenADR"] = "_10";
    EventType["Climate"] = "_11";
    EventType["APISEP"] = "_12";
    EventType["EnergyMonitoring"] = "_13";
    EventType["UPBLinker"] = "_14";
    EventType["UPBDeviceAdder"] = "_15";
    EventType["UPBDeviceStatus"] = "_16";
    EventType["GasMeter"] = "_17";
    EventType["ZigBee"] = "_18";
    EventType["Elk"] = "_19";
    EventType["DeviceLinker"] = "_20";
    EventType["ZWave"] = "_21";
    EventType["Billing"] = "_22";
    EventType["Portal"] = "_23";
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
