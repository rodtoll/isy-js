Object.defineProperty(exports, "__esModule", { value: true });
const InsteonDimmableDevice_1 = require("./Devices/Insteon/InsteonDimmableDevice");
const InsteonDimmerKeypadDevice_1 = require("./Devices/Insteon/InsteonDimmerKeypadDevice");
const InsteonDimmerOutletDevice_1 = require("./Devices/Insteon/InsteonDimmerOutletDevice");
const InsteonDimmerSwitchDevice_1 = require("./Devices/Insteon/InsteonDimmerSwitchDevice");
const InsteonDoorWindowSensorDevice_1 = require("./Devices/Insteon/InsteonDoorWindowSensorDevice");
const InsteonFanDevice_1 = require("./Devices/Insteon/InsteonFanDevice");
const InsteonKeypadDevice_1 = require("./Devices/Insteon/InsteonKeypadDevice");
const InsteonLeakSensorDevice_1 = require("./Devices/Insteon/InsteonLeakSensorDevice");
const InsteonMotionSensorDevice_1 = require("./Devices/Insteon/InsteonMotionSensorDevice");
const InsteonOnOffOutletDevice_1 = require("./Devices/Insteon/InsteonOnOffOutletDevice");
const InsteonRelayDevice_1 = require("./Devices/Insteon/InsteonRelayDevice");
const InsteonRelaySwitchDevice_1 = require("./Devices/Insteon/InsteonRelaySwitchDevice");
const isy_1 = require("./isy");
const isyconstants_1 = require("./isyconstants");
class DeviceFactory {
    static createDevice(nodeDef) {
        const family = Number(nodeDef.family);
        const typeArray = nodeDef.type.split('.');
        const category = Number(typeArray[0]);
        const device = Number(typeArray[1]);
        const version = Number(typeArray[2]);
        const nodeDefId = nodeDef.nodeDefId;
        let str = null;
        if (category === isyconstants_1.Categories.Controller) {
            str = DeviceFactory.getNLSControllerInfo(device);
        }
        else if (category === 0o001) {
            str = DeviceFactory.getNLSDimLightInfo(device);
        }
        else if (category === 0o002) {
            str = DeviceFactory.getNLSSwitchLightInfo(device);
        }
        else if (category === 0o003) {
            str = DeviceFactory.getNLSNetworkBridgeInfo(device);
        }
        else if (category === 0o005) {
            str = DeviceFactory.getNLSClimateControlInfo(device);
        }
        else if (category === 0o004) {
            str = DeviceFactory.getNLSIrrigationControlInfo(device);
        }
        else if (category === 0o007) {
            str = DeviceFactory.getNLSIOControlInfo(device);
        }
        else if (category === 0o017) {
            str = DeviceFactory.getNLSAccessControlInfo(device);
        }
        else if (category === 0o020) {
            str = DeviceFactory.getNLSSHS(device);
        }
        else if (category === 0o011) {
            str = DeviceFactory.getNLSEnergyManagement(device);
        }
        else if (category === 0o016) {
            str = DeviceFactory.getNLSWindowsCovering(device);
        }
        str.version = version.toString(16);
        if (nodeDefId === 'FanLincMotor') {
            str.class = InsteonFanDevice_1.InsteonFanMotorDevice;
        }
        return str;
    }
    static getDeviceDetails(family, typeCode) {
        if ((family !== null && family !== void 0 ? family : isy_1.Families.Insteon === isy_1.Families.Insteon)) {
            return this.getInsteonDeviceDetails(typeCode);
        }
        else
            return null;
    }
    static getInsteonDeviceDetails(typeCode) {
        const typeArray = typeCode.split('.');
        const category = Number(typeArray[0]);
        const device = Number(typeArray[1]);
        const version = Number(typeArray[2]);
        let str = null;
        if (category === isyconstants_1.Categories.Controller) {
            str = DeviceFactory.getNLSControllerInfo(device);
        }
        else if (category === 0o001) {
            str = DeviceFactory.getNLSDimLightInfo(device);
        }
        else if (category === 0o002) {
            str = DeviceFactory.getNLSSwitchLightInfo(device);
        }
        else if (category === 0o003) {
            str = DeviceFactory.getNLSNetworkBridgeInfo(device);
        }
        else if (category === 0o005) {
            str = DeviceFactory.getNLSClimateControlInfo(device);
        }
        else if (category === 0o004) {
            str = DeviceFactory.getNLSIrrigationControlInfo(device);
        }
        else if (category === 0o007) {
            str = DeviceFactory.getNLSIOControlInfo(device);
        }
        else if (category === 0o017) {
            str = DeviceFactory.getNLSAccessControlInfo(device);
        }
        else if (category === 0o020) {
            str = DeviceFactory.getNLSSHS(device);
        }
        else if (category === 0o011) {
            str = DeviceFactory.getNLSEnergyManagement(device);
        }
        else if (category === 0o016) {
            str = DeviceFactory.getNLSWindowsCovering(device);
        }
        str.version = version.toString(16);
        // str = str + version.toString(16);
        return str;
    }
    static getNLSNetworkBridgeInfo(device) {
        const c = String.fromCharCode(device);
        let retVal = null;
        switch (c) {
            case String.fromCharCode(0o001):
                retVal = { name: 'PowerLinc Serial', modelNumber: '2414S' };
                break;
            case String.fromCharCode(0o002):
                retVal = { name: 'PowerLinc USB', modelNumber: '2414U' };
                break;
            case String.fromCharCode(0o003):
                retVal = { name: 'Icon PowerLinc Serial', modelNumber: '2814S' };
                break;
            case String.fromCharCode(0o004):
                retVal = { name: 'Icon PowerLinc USB', modelNumber: '2814U' };
                break;
            case String.fromCharCode(0o005):
                retVal = { name: 'PowerLine Modem', modelNumber: '2412S' };
                break;
            case String.fromCharCode(0o006):
                retVal = { name: 'IRLinc Receiver', modelNumber: '2411R' };
                break;
            case String.fromCharCode(0o007):
                retVal = { name: 'IRLinc Transmitter', modelNumber: '2411T' };
                break;
            case String.fromCharCode(0o013):
                retVal = { name: 'PowerLine Modem USB', modelNumber: '2412U' };
                break;
            case '\r':
                return 'EZX10-RF';
                break;
            case String.fromCharCode(0o017):
                return 'EZX10-IR';
                break;
            case 'O':
                retVal = { name: 'PowerLine Modem', modelNumber: '12237DB' };
        }
        return retVal;
    }
    static getNLSIrrigationControlInfo(device) {
        const c = String.fromCharCode(device);
        return c === String.fromCharCode(0o000) ? 'EZRain/EZFlora Irrigation Controller' : null;
    }
    static getNLSSwitchLightInfo(device) {
        const c = String.fromCharCode(device);
        let retVal = null;
        switch (c) {
            case String.fromCharCode(0o006):
                retVal = { name: 'ApplianceLinc - Outdoor Plugin Module', modelNumber: '2456S3E' };
                break;
            case String.fromCharCode(0o007):
                retVal = { name: 'TimerLinc', modelNumber: '2456S3T' };
                break;
            case '\t':
                retVal = { name: 'ApplianceLinc', modelNumber: '2456S3' };
                break;
            case '\n':
                retVal = { name: 'SwitchLinc Relay', modelNumber: '2476ST' };
                break;
            case String.fromCharCode(0o013):
                retVal = { name: 'Icon On/Off Switch', modelNumber: '2876S' };
                break;
            case '\f':
                retVal = { name: 'Icon Appliance Adapter', modelNumber: '2856S3' };
                break;
            case '\r':
                break;
            case String.fromCharCode(0o032):
                retVal = { name: 'ToggleLinc Relay', modelNumber: '2466S' };
                break;
            case String.fromCharCode(0o016):
                break;
            case ')':
                retVal = { name: 'SwitchLinc Relay Timer', modelNumber: '2476ST' };
                break;
            case String.fromCharCode(0o021):
                // return 'EZSwitch30';
                break;
            case String.fromCharCode(0o017):
                retVal = { name: 'KeypadLinc Relay', modelNumber: '2486S/WH6' };
                break;
            case String.fromCharCode(0o005):
                retVal = { name: 'KeypadLinc Relay (8 buttons)', modelNumber: '2486S/WH8' };
                break;
            case String.fromCharCode(0o020):
                retVal = { name: 'In-LineLinc Relay', modelNumber: '2475S' };
                break;
            case String.fromCharCode(0o024):
                retVal = { name: 'In-LineLinc Relay W/ Sense', modelNumber: 'B2475S' };
                break;
            case String.fromCharCode(0o023):
                // return 'Icon SwitchLinc Relay for Bell Canada';
                break;
            case '\b':
                retVal = { name: 'OutletLinc', modelNumber: '2473', class: InsteonOnOffOutletDevice_1.InsteonOnOffOutletDevice };
                break;
            case String.fromCharCode(0o022):
                retVal = { name: 'Companion Switch', modelNumber: '2474S' };
                break;
            case String.fromCharCode(0o025):
                retVal = { name: 'SwitchLinc Relay W/ Sense', modelNumber: '2476S' };
                break;
            case String.fromCharCode(0o027):
                retVal = { name: 'Icon Relay 3-Pin', modelNumber: '2856S3B' };
                break;
            case String.fromCharCode(0o026):
                retVal = { name: ' Icon Relay Switch', modelNumber: '2876SB' };
                break;
            case String.fromCharCode(0o030):
                retVal = { name: 'SwitchLinc Relay 220 V.', modelNumber: '2494S220' };
                break;
            case String.fromCharCode(0o031):
                retVal = { name: 'SwitchLinc Relay 220 V. w/Beeper', modelNumber: '2494S220' };
                break;
            case String.fromCharCode(0o034):
                retVal = { name: 'SwitchLinc Relay - Remote Control On/Off Switch', modelNumber: '2476S', class: InsteonKeypadDevice_1.InsteonKeypadDevice };
                break;
            case '%':
                retVal = { name: 'KeypadLinc Timer Relay (8 buttons)', modelNumber: '2484S/WH8' };
                break;
            case ' ':
                retVal = { name: 'KeypadLinc Relay', modelNumber: '2486S/WH6-SP', class: InsteonKeypadDevice_1.InsteonKeypadDevice };
                break;
            case '!':
                retVal = { name: 'OutletLinc', modelNumber: '2473-SP', class: InsteonOnOffOutletDevice_1.InsteonOnOffOutletDevice };
                break;
            case '#':
                retVal = { name: 'SwitchLinc Relay - Remote Control On/Off Switch', modelNumber: '2476S-SP', class: InsteonRelaySwitchDevice_1.InsteonRelaySwitchDevice };
                break;
            case '"':
                retVal = { name: 'In-LineLinc Relay', modelNumber: '2475S-SP', class: InsteonRelaySwitchDevice_1.InsteonRelaySwitchDevice };
                break;
            case String.fromCharCode(0o036):
                break;
            case ',':
                retVal = { name: 'Dual Band KeypadLinc Relay', modelNumber: '2487S', class: InsteonKeypadDevice_1.InsteonKeypadDevice };
                break;
            case String.fromCharCode(0o037):
                retVal = { name: 'Dual Band InlineLinc On/Off Switch', modelNumber: '2475SDB', class: InsteonRelaySwitchDevice_1.InsteonRelaySwitchDevice };
                break;
            case '*':
                retVal = { name: 'Dual Band SwitchLinc On/Off Switch', modelNumber: '2477S', class: InsteonRelaySwitchDevice_1.InsteonRelaySwitchDevice };
                break;
            case '/':
                retVal = { name: 'Micro Module On/Off', modelNumber: '2443-222' };
                break;
            case '1':
                retVal = { name: 'Micro Module On/Off', modelNumber: '2443-422' };
                break;
            case '2':
                break;
            case '<':
                retVal = { name: 'Micro Module On/Off', modelNumber: '2443-522' };
                break;
            case '.':
                retVal = { name: 'Din Rail Relay', modelNumber: '2453-222' };
                break;
            case '3':
                retVal = { name: 'Din Rail Relay', modelNumber: '2453-422' };
                break;
            case '4':
                break;
            case '=':
                retVal = { name: 'Din Rail Relay', modelNumber: '2453-522' };
                break;
            case '7':
                retVal = { name: 'On/Off Module', modelNumber: '2635-222' };
                break;
            case '8':
                retVal = { name: 'On/Off Outdoor Module', modelNumber: '2634-222' };
                break;
            case '9':
                retVal = { name: 'On/Off Outlet', modelNumber: '2663-222' };
                break;
            case '-':
                retVal = { name: 'Plugin Relay', modelNumber: '2633-422' };
                break;
            case '0':
                retVal = { name: 'Plugin Relay', modelNumber: '2633-432' };
                break;
            case '5':
                retVal = { name: 'Plugin Relay', modelNumber: '2633-442' };
                break;
            case '6':
                retVal = { name: 'Plugin Relay', modelNumber: '2633-522' };
        }
        if (retVal.class === undefined)
            retVal.class = InsteonRelayDevice_1.InsteonRelayDevice;
        return retVal;
    }
    static getNLSDimLightInfo(device) {
        const c = String.fromCharCode(device);
        let retVal = null;
        switch (c) {
            case String.fromCharCode(0o000):
                retVal = { name: 'LampLinc', modelNumber: '2456D3' };
                break;
            case String.fromCharCode(0o001):
                retVal = { name: 'SwitchLinc Dimmer', modelNumber: '2476D', class: InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice };
                break;
            case String.fromCharCode(0o002):
                retVal = { name: 'In-LineLinc Dimmable', modelNumber: '2475D' };
                break;
            case String.fromCharCode(0o003):
                retVal = { name: 'Icon Switch Dimmer', modelNumber: '2876D3' };
                break;
            case String.fromCharCode(0o004):
                retVal = { name: 'SwitchLinc Dimmer', modelNumber: '2476DH', class: InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice };
                break;
            case String.fromCharCode(0o006):
                retVal = { name: 'LampLinc 2 Pin', modelNumber: '2456D2' };
                break;
            case '\t':
                retVal = { name: 'KeypadLinc Dimmer', modelNumber: '2486D' };
                break;
            case String.fromCharCode(0o007):
                retVal = { name: 'Icon LampLinc 2 Pin', modelNumber: '2856D2' };
                break;
            case '\n':
                retVal = { name: 'Icon In-Wall Controller', modelNumber: '2886D' };
                break;
            case '\r':
                retVal = { name: 'SocketLinc', modelNumber: '2454D' };
                break;
            case '\f':
                retVal = { name: 'KeypadLinc Dimmer 8 Button', modelNumber: '2486DWH8', class: InsteonDimmerKeypadDevice_1.InsteonDimmerKeypadDevice };
                break;
            case String.fromCharCode(0o023):
                retVal = { name: 'Icon SwitchLinc Dimmer for Bell Canada' };
                break;
            case String.fromCharCode(0o027):
                break;
            case String.fromCharCode(0o037):
                retVal = { name: 'ToggleLinc Dimmer', modelNumber: '2466D', class: InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice };
                break;
            case String.fromCharCode(0o030):
                retVal = { name: 'Companion Dimmer', modelNumber: '2474D' };
                break;
            case String.fromCharCode(0o032):
                retVal = { name: 'InlineLinc Dimmer', modelNumber: '2475D', class: InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice };
                break;
            case String.fromCharCode(0o005):
                retVal = { name: 'KeypadLinc Countdown Timer', modelNumber: '2484DWH8' };
                break;
            case String.fromCharCode(0o033):
                retVal = { name: 'KeypadLinc Dimmer 6 Buttons', modelNumber: '2486D', class: InsteonDimmerKeypadDevice_1.InsteonDimmerKeypadDevice };
                break;
            case String.fromCharCode(0o034):
                retVal = { name: 'KeypadLinc Dimmer 8 Buttons', modelNumber: '2486D', class: InsteonDimmerKeypadDevice_1.InsteonDimmerKeypadDevice };
                break;
            case String.fromCharCode(0o031):
                retVal = { name: 'SwitchLinc Dimmer W/Beeper', modelNumber: '2476D' };
                break;
            case String.fromCharCode(0o016):
                retVal = { name: 'LampLinc BiPhy', modelNumber: 'B2457D2' };
                break;
            case String.fromCharCode(0o036):
                retVal = { name: 'Icon Dimmer', modelNumber: '2876DB' };
                break;
            case String.fromCharCode(0o035):
                retVal = { name: 'SwitchLinc Dimmer 1000W', modelNumber: '2476DH', class: InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice };
                break;
            case '"':
                retVal = { name: 'LampLinc 2-Pin Dimmer', modelNumber: '2457D2X' };
                break;
            case 'U':
                retVal = { name: 'Dual Band Switchlinc Dimmer', modelNumber: '2432-622', class: InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice };
                break;
            case ' ':
                retVal = { name: 'Dual Band SwitchLinc Dimmer', modelNumber: '2477D', class: InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice };
                break;
            case '1':
                retVal = { name: 'Dual Band SwitchLinc Dimmer (240V)', modelNumber: '2478D', class: InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice };
                break;
            case '-':
                retVal = { name: 'Dual Band SwitchLinc Dimmer', modelNumber: '2477DH', class: InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice };
                break;
            case '\'':
                retVal = { name: 'Dual Band SwitchLinc Dimmer', modelNumber: '2477D-SP', class: InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice };
                break;
            case '+':
                retVal = { name: 'Dual Band SwitchLinc Dimmer', modelNumber: '2477DH-SP', class: InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice };
                break;
            case ')':
                retVal = { name: 'KeypadLinc Dimmer 8 Buttons', modelNumber: '2486D-SP', class: InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice };
                break;
            case '*':
                retVal = { name: 'LampLinc 2-Pin Dimmer', modelNumber: '2457D2X-SP' };
                break;
            case ',':
                retVal = { name: 'InlineLinc Dimmer', modelNumber: '2475D-SP' };
                break;
            case '%':
                retVal = { name: 'Ballast Dimmer', modelNumber: '2475DA2' };
                break;
            case '=':
                retVal = { name: 'Ballast Dimmer', modelNumber: '2446-422' };
                break;
            case '>':
                retVal = { name: 'Ballast Dimmer', modelNumber: '2446-522' };
                break;
            case '.':
                retVal = { name: 'FanLinc', modelNumber: '2475F', class: InsteonFanDevice_1.InsteonFanDevice };
                break;
            case '!':
                retVal = { name: 'Dual Band OutletLinc Dimmer', modelNumber: '2472D', class: InsteonDimmerOutletDevice_1.InsteonDimmerOutletDevice };
                break;
            case '0':
                retVal = { name: 'SwitchLinc Dimmer', modelNumber: '2476D', class: InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice };
                break;
            case '$':
                retVal = { name: 'SwitchLinc Dimmer 2-Wire', modelNumber: '2474DWH', class: InsteonDimmerSwitchDevice_1.InsteonDimmerSwitchDevice };
                break;
            case '2':
                retVal = { name: 'InLineLinc Dimmer', modelNumber: '2475DA1' };
                break;
            case ':':
                retVal = { name: 'Insteon LED Bulb 8 Watt (60W)', modelNumber: '2672-222' };
                break;
            case 'I':
                retVal = { name: 'Insteon LED Bulb PAR38 12 Watt', modelNumber: '2674-222' };
                break;
            case '5':
                retVal = { name: 'Micro Module Dimmer', modelNumber: '2442-222' };
                break;
            case '8':
                retVal = { name: 'Micro Module Dimmer', modelNumber: '2442-422' };
                break;
            case '9':
                break;
            case 'S':
                retVal = { name: 'Micro Module Dimmer', modelNumber: '2442-522' };
                break;
            case '4':
                retVal = { name: 'Din Rail Dimmer', modelNumber: '2452-222' };
                break;
            case '6':
                retVal = { name: 'Din Rail Dimmer', modelNumber: '2452-422' };
                break;
            case '7':
                break;
            case 'T':
                retVal = { name: 'Din Rail Dimmer', modelNumber: '2452-522' };
                break;
            case 'B':
                retVal = { name: 'KeypadLinc Dimmer 5 Buttons', modelNumber: '2334-2', class: InsteonDimmerKeypadDevice_1.InsteonDimmerKeypadDevice };
                break;
            case 'A':
                retVal = { name: 'KeypadLinc Dimmer 8 Buttons', modelNumber: '2334-2', class: InsteonDimmerKeypadDevice_1.InsteonDimmerKeypadDevice };
                break;
            case 'V':
                retVal = { name: 'KeypadLinc Dimmer 6 Buttons', modelNumber: '2334-632', class: InsteonDimmerKeypadDevice_1.InsteonDimmerKeypadDevice };
                break;
            case String.fromCharCode(0o013):
                retVal = { name: 'Plugin Dimmer', modelNumber: '2632-422' };
                break;
            case String.fromCharCode(0o017):
                retVal = { name: 'Plugin Dimmer', modelNumber: '2632-432' };
                break;
            case String.fromCharCode(0o021):
                retVal = { name: 'Plugin Dimmer', modelNumber: '2632-442' };
                break;
            case 'P':
                retVal = { name: 'Plugin Dimmer', modelNumber: '2632-452' };
                break;
            case String.fromCharCode(0o022):
                retVal = { name: 'Plugin Dimmer', modelNumber: '2632-522' };
        }
        if (retVal.class === undefined)
            retVal.class = InsteonDimmableDevice_1.InsteonDimmableDevice;
        return retVal;
    }
    static getNLSControllerInfo(device) {
        const c = String.fromCharCode(device);
        let retVal = null;
        switch (c) {
            case String.fromCharCode(0o000):
                retVal = { name: 'ControLinc', modelNumber: '2430' };
                break;
            case String.fromCharCode(0o005):
                retVal = { name: 'RemoteLinc', modelNumber: '2440' };
                break;
            case String.fromCharCode(0o016):
                retVal = { name: 'RemoteLinc EZ', modelNumber: '2440EZ' };
                break;
            case String.fromCharCode(0o006):
                retVal = { name: 'Icon Tabletop', modelNumber: '2830' };
                break;
            case '\t':
                retVal = { name: 'SignaLinc', modelNumber: '2442' };
                break;
            case String.fromCharCode(0o021):
                retVal = { name: 'RemoteLinc 2 Switch', modelNumber: '2342-242' };
                break;
            case String.fromCharCode(0o020):
                retVal = { name: 'RemoteLinc 2 Keypad, 4 Scene', modelNumber: '2342-232' };
                break;
            case String.fromCharCode(0o022):
                retVal = { name: 'RemoteLinc 2 Keypad, 8 Scene', modelNumber: '2342-222' };
                break;
            case String.fromCharCode(0o024):
                retVal = { name: 'Mini Remote Keypad, 4 Scene', modelNumber: '2342-432' };
                break;
            case String.fromCharCode(0o025):
                retVal = { name: 'Mini Remote Switch', modelNumber: '2342-442' };
                break;
            case String.fromCharCode(0o026):
                retVal = { name: 'Mini Remote Keypad, 8 Scene', modelNumber: '2342-422' };
                break;
            case String.fromCharCode(0o027):
                retVal = { name: 'Mini Remote Keypad, 4 Scene', modelNumber: '2342-532' };
                break;
            case String.fromCharCode(0o030):
                retVal = { name: 'Mini Remote Keypad, 8 Scene', modelNumber: '2342-522' };
                break;
            case String.fromCharCode(0o031):
                retVal = { name: 'Mini Remote Switch', modelNumber: '2342-542' };
                break;
            case String.fromCharCode(0o032):
                retVal = { name: 'Mini Remote Keypad, 8 Scene', modelNumber: '2342-222' };
                break;
            case String.fromCharCode(0o033):
                retVal = { name: 'Mini Remote Keypad, 4 Scene', modelNumber: '2342-232' };
                break;
            case String.fromCharCode(0o034):
                retVal = { name: 'Mini Remote Switch', modelNumber: '2342-242' };
        }
        return retVal;
    }
    static getNLSIOControlInfo(device) {
        const c = String.fromCharCode(device);
        let retVal = null;
        switch (c) {
            case String.fromCharCode(0o000):
                retVal = { name: 'IOLinc', modelNumber: '2450' };
                break;
            case String.fromCharCode(0o003):
                return 'Compacta EZIO 2x4: INSTEON I/O Controller';
                break;
            case String.fromCharCode(0o004):
                return 'Compacta EZIO8SA: INSTEON I/O Controller';
                break;
            case String.fromCharCode(0o002):
                return 'Compacta EZIO8T: INSTEON I/O Controller';
                break;
            case String.fromCharCode(0o005):
                return 'Compacta EZSnSRF';
                break;
            case String.fromCharCode(0o006):
                return 'Compacta EZSnSRF Interface';
                break;
            case String.fromCharCode(0o007):
                return 'Compacta EZIO6I';
                break;
            case '\b':
                return 'Compacta EZIO4O';
                break;
            case '\t':
                retVal = { name: 'SynchroLinc', modelNumber: '2423A5' };
                break;
            case '\r':
                retVal = { name: 'IOLinc (Refurbished)', modelNumber: '2450' };
                break;
            case String.fromCharCode(0o016):
                retVal = { name: 'I/O Module', modelNumber: '2248-222' };
                break;
            case String.fromCharCode(0o017):
                retVal = { name: 'I/O Module', modelNumber: '2248-422' };
                break;
            case String.fromCharCode(0o020):
                retVal = { name: 'I/O Module', modelNumber: '2248-442' };
                break;
            case String.fromCharCode(0o021):
                retVal = { name: 'I/O Module', modelNumber: '2248-522' };
                break;
            case String.fromCharCode(0o022):
                retVal = { name: 'IOLinc', modelNumber: '2822-222' };
                break;
            case String.fromCharCode(0o023):
                retVal = { name: 'IOLinc', modelNumber: '2822-422' };
                break;
            case String.fromCharCode(0o024):
                retVal = { name: 'IOLinc', modelNumber: '2822-442' };
                break;
            case String.fromCharCode(0o025):
                retVal = { name: 'IOLinc', modelNumber: '2822-522' };
                break;
            case String.fromCharCode(0o026):
                retVal = { name: 'Contact Closure', modelNumber: '2822-222' };
                break;
            case String.fromCharCode(0o027):
                retVal = { name: 'Contact Closure', modelNumber: '2822-422' };
                break;
            case String.fromCharCode(0o030):
                retVal = { name: 'Contact Closure', modelNumber: '2822-442' };
                break;
            case String.fromCharCode(0o031):
                retVal = { name: 'Contact Closure', modelNumber: '2822-522' };
                break;
            case String.fromCharCode(0o032):
                retVal = { name: 'Alert Module', modelNumber: '2867-222' };
                break;
            case String.fromCharCode(0o036):
                retVal = { name: 'Siren', modelNumber: '2868-222' };
                break;
            case ' ':
                retVal = { name: 'Siren', modelNumber: '2868-622' };
        }
        return retVal;
    }
    static getNLSSHS(device) {
        const c = String.fromCharCode(device);
        let retVal = null;
        switch (c) {
            case String.fromCharCode(0o001):
                retVal = { name: 'INSTEON Motion Sensor', modelNumber: '2842-222', class: InsteonMotionSensorDevice_1.InsteonMotionSensorDevice };
                break;
            case String.fromCharCode(0o004):
                retVal = { name: 'INSTEON Motion Sensor', modelNumber: '2842-422', class: InsteonMotionSensorDevice_1.InsteonMotionSensorDevice };
                break;
            case String.fromCharCode(0o005):
                retVal = { name: 'INSTEON Motion Sensor', modelNumber: '2842-522', class: InsteonMotionSensorDevice_1.InsteonMotionSensorDevice };
                break;
            case String.fromCharCode(0o003):
                retVal = { name: 'INSTEON Motion Sensor', modelNumber: '2420M-SP', class: InsteonMotionSensorDevice_1.InsteonMotionSensorDevice };
                break;
            case String.fromCharCode(0o002):
                retVal = { name: 'TriggerLinc', modelNumber: '2421' };
                break;
            case '\t':
                retVal = { name: 'Open/Close Sensor', modelNumber: '2843-222', class: InsteonDoorWindowSensorDevice_1.InsteonDoorWindowSensorDevice };
                break;
            case String.fromCharCode(0o006):
                retVal = { name: 'Open/Close Sensor', modelNumber: '2843-422', class: InsteonDoorWindowSensorDevice_1.InsteonDoorWindowSensorDevice };
                break;
            case String.fromCharCode(0o007):
                break;
            case String.fromCharCode(0o031):
                retVal = { name: 'Open/Close Sensor', modelNumber: '2843-522', class: InsteonDoorWindowSensorDevice_1.InsteonDoorWindowSensorDevice };
                break;
            case '\b':
                retVal = { name: 'Leak Sensor', modelNumber: '2852-222', class: InsteonLeakSensorDevice_1.InsteonLeakSensorDevice };
                break;
            case '\r':
                retVal = { name: 'Leak Sensor', modelNumber: '2852-422', class: InsteonLeakSensorDevice_1.InsteonLeakSensorDevice };
                break;
            case String.fromCharCode(0o016):
                break;
            case String.fromCharCode(0o032):
                retVal = { name: 'Leak Sensor', modelNumber: '2852-522', class: InsteonLeakSensorDevice_1.InsteonLeakSensorDevice };
                break;
            case '\n':
                return 'INSTEON Smoke Sensor';
                break;
            case String.fromCharCode(0o021):
                retVal = { name: 'INSTEON Hidden Door Sensor', modelNumber: '2845-222', class: InsteonDoorWindowSensorDevice_1.InsteonDoorWindowSensorDevice };
                break;
            case String.fromCharCode(0o024):
                retVal = { name: 'INSTEON Hidden Door Sensor', modelNumber: '2845-422', class: InsteonDoorWindowSensorDevice_1.InsteonDoorWindowSensorDevice };
                break;
            case String.fromCharCode(0o025):
                break;
            case String.fromCharCode(0o033):
                retVal = { name: 'INSTEON Hidden Door Sensor', modelNumber: '2845-522', class: InsteonDoorWindowSensorDevice_1.InsteonDoorWindowSensorDevice };
                break;
            case String.fromCharCode(0o026):
                retVal = { name: 'Insteon Motion Sensor II', modelNumber: '2844-222', class: InsteonMotionSensorDevice_1.InsteonMotionSensorDevice };
                break;
            case String.fromCharCode(0o030):
                retVal = { name: 'Insteon Motion Sensor II', modelNumber: '2844-522', class: InsteonMotionSensorDevice_1.InsteonMotionSensorDevice };
        }
        return retVal;
    }
    static getNLSClimateControlInfo(device) {
        const c = String.fromCharCode(device);
        let retVal = null;
        switch (c) {
            case String.fromCharCode(0o000):
                return 'BROAN SMSC080 Exhaust Fan';
                break;
            case String.fromCharCode(0o002):
                return 'BROAN SMSC110 Exhaust Fan';
                break;
            case String.fromCharCode(0o005):
                return 'BROAN, Venmar, Best Rangehoods';
                break;
            case String.fromCharCode(0o001):
                break;
            case String.fromCharCode(0o004):
                return 'Compacta EZTherm';
                break;
            case String.fromCharCode(0o003):
                retVal = { name: 'INSTEON Thermostat Adapter', modelNumber: '2441V' };
                break;
            case '\t':
                retVal = { name: 'INSTEON Thermostat Adapter', modelNumber: '2441V-SP' };
                break;
            case String.fromCharCode(0o013):
                retVal = { name: 'INSTEON Thermostat', modelNumber: '2441TH' };
                break;
            case String.fromCharCode(0o017):
                retVal = { name: 'INSTEON Thermostat', modelNumber: '2732-422' };
                break;
            case String.fromCharCode(0o020):
                retVal = { name: 'INSTEON Thermostat', modelNumber: '2732-522' };
                break;
            case String.fromCharCode(0o021):
                retVal = { name: 'INSTEON Thermostat', modelNumber: '2732-432' };
                break;
            case String.fromCharCode(0o022):
                retVal = { name: 'INSTEON Thermostat', modelNumber: '2732-532' };
                break;
            case String.fromCharCode(0o023):
                retVal = { name: 'INSTEON Thermostat Heat Pump', modelNumber: '2732-242' };
                break;
            case String.fromCharCode(0o024):
                retVal = { name: 'INSTEON Thermostat Heat Pump for Europe', modelNumber: '2732-442' };
                break;
            case String.fromCharCode(0o025):
                retVal = { name: 'INSTEON Thermostat Heat Pump for Aus/NZ', modelNumber: '2732-542' };
                break;
            case String.fromCharCode(0o026):
                retVal = { name: 'INSTEON Thermostat 2.0 (HVAC/HP)', modelNumber: '2732-222' };
                break;
            case String.fromCharCode(0o027):
                retVal = { name: 'for Europe', modelNumber: '2732-422) INSTEON Thermostat 2.0 (HVAC/HP' };
                break;
            case String.fromCharCode(0o030):
                retVal = { name: 'for Aus/NZ', modelNumber: '2732-522) INSTEON Thermostat 2.0 (HVAC/HP' };
                break;
            case '\n':
                retVal = { name: 'INSTEON Wireless Thermostat', modelNumber: '2441ZTH' };
                break;
            case String.fromCharCode(0o016):
                retVal = { name: 'All-In-One INSTEON Thermostat Adapter', modelNumber: '2491T' };
        }
        return retVal;
    }
    static getNLSAccessControlInfo(device) {
        const c = String.fromCharCode(device);
        const retVal = null;
        switch (c) {
            case String.fromCharCode(0o006):
                return 'MorningLinc';
                break;
            case '\n':
                return 'Lock Controller';
        }
        return retVal;
    }
    static getNLSEnergyManagement(device) {
        const c = String.fromCharCode(device);
        let retVal = null;
        switch (c) {
            case String.fromCharCode(0o000):
                return 'ZBPCM (iMeter Solo compat.)';
                break;
            case String.fromCharCode(0o007):
                retVal = { name: 'iMeter Solo', modelNumber: '2423A1' };
                break;
            case String.fromCharCode(0o013):
                return 'Dual Band Normally Closed 240V Load Controller (2477SA2)';
                break;
            case '\n':
                return 'Dual Band Normally Open 240V Load Controller (2477SA1)';
                break;
            case '\r':
                return 'Energy Display (2448A2)';
        }
        return retVal;
    }
    static getNLSWindowsCovering(device) {
        const c = String.fromCharCode(device);
        let retVal = null;
        switch (c) {
            case String.fromCharCode(0o001):
                retVal = { name: 'Micro Module Open/Close', modelNumber: '2444-222' };
                break;
            case String.fromCharCode(0o002):
                retVal = { name: 'Micro Module Open/Close', modelNumber: '2444-422' };
                break;
            case String.fromCharCode(0o003):
                break;
            case String.fromCharCode(0o007):
                retVal = { name: 'Micro Module Open/Close', modelNumber: '2444-522' };
        }
        return retVal;
    }
}
exports.DeviceFactory = DeviceFactory;
