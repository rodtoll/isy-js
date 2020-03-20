Object.defineProperty(exports, "__esModule", { value: true });
const isyconstants_1 = require("./isyconstants");
const insteondevice_1 = require("./insteondevice");
class DeviceFactory {
    static getDeviceDetails(family, typeCode) {
        if ((family !== null && family !== void 0 ? family : isyconstants_1.default.Families.Insteon === isyconstants_1.default.Families.Insteon)) {
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
        if (category === 0o000) {
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
                retVal = { name: 'OutletLinc', modelNumber: '2473', class: insteondevice_1.InsteonOnOffOutletDevice };
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
                retVal = { name: 'SwitchLinc Relay - Remote Control On/Off Switch', modelNumber: '2476S' };
                break;
            case '%':
                retVal = { name: 'KeypadLinc Timer Relay (8 buttons)', modelNumber: '2484S/WH8' };
                break;
            case ' ':
                retVal = { name: 'KeypadLinc Relay', modelNumber: '2486S/WH6-SP', class: insteondevice_1.InsteonDimmerKeypadDevice };
                break;
            case '!':
                retVal = { name: 'OutletLinc', modelNumber: '2473-SP', class: insteondevice_1.InsteonOnOffOutletDevice };
                break;
            case '#':
                retVal = { name: 'SwitchLinc Relay - Remote Control On/Off Switch', modelNumber: '2476S-SP', class: insteondevice_1.InsteonRelaySwitchDevice };
                break;
            case '"':
                retVal = { name: 'In-LineLinc Relay', modelNumber: '2475S-SP', class: insteondevice_1.InsteonRelaySwitchDevice };
                break;
            case String.fromCharCode(0o036):
                break;
            case ',':
                retVal = { name: 'Dual Band KeypadLinc Relay', modelNumber: '2487S', class: insteondevice_1.InsteonKeypadDevice };
                break;
            case String.fromCharCode(0o037):
                retVal = { name: 'Dual Band InlineLinc On/Off Switch', modelNumber: '2475SDB', class: insteondevice_1.InsteonRelaySwitchDevice };
                break;
            case '*':
                retVal = { name: 'Dual Band SwitchLinc On/Off Switch', modelNumber: '2477S', class: insteondevice_1.InsteonRelaySwitchDevice };
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
            retVal.class = insteondevice_1.InsteonRelayDevice;
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
                retVal = { name: 'SwitchLinc Dimmer', modelNumber: '2476D', class: insteondevice_1.InsteonDimmerSwitchDevice };
                break;
            case String.fromCharCode(0o002):
                retVal = { name: 'In-LineLinc Dimmable', modelNumber: '2475D' };
                break;
            case String.fromCharCode(0o003):
                retVal = { name: 'Icon Switch Dimmer', modelNumber: '2876D3' };
                break;
            case String.fromCharCode(0o004):
                retVal = { name: 'SwitchLinc Dimmer', modelNumber: '2476DH', class: insteondevice_1.InsteonDimmerSwitchDevice };
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
                retVal = { name: 'KeypadLinc Dimmer 8 Button', modelNumber: '2486DWH8' };
                break;
            case String.fromCharCode(0o023):
                retVal = { name: 'Icon SwitchLinc Dimmer for Bell Canada' };
                break;
            case String.fromCharCode(0o027):
                break;
            case String.fromCharCode(0o037):
                retVal = { name: 'ToggleLinc Dimmer', modelNumber: '2466D', class: insteondevice_1.InsteonDimmerSwitchDevice };
                break;
            case String.fromCharCode(0o030):
                retVal = { name: 'Companion Dimmer', modelNumber: '2474D' };
                break;
            case String.fromCharCode(0o032):
                retVal = { name: 'InlineLinc Dimmer', modelNumber: '2475D', class: insteondevice_1.InsteonDimmerSwitchDevice };
                break;
            case String.fromCharCode(0o005):
                retVal = { name: 'KeypadLinc Countdown Timer', modelNumber: '2484DWH8' };
                break;
            case String.fromCharCode(0o033):
                retVal = { name: 'KeypadLinc Dimmer 6 Buttons', modelNumber: '2486D' };
                break;
            case String.fromCharCode(0o034):
                retVal = { name: 'KeypadLinc Dimmer 8 Buttons', modelNumber: '2486D' };
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
                retVal = { name: 'SwitchLinc Dimmer 1000W', modelNumber: '2476DH', class: insteondevice_1.InsteonDimmerSwitchDevice };
                break;
            case '"':
                retVal = { name: 'LampLinc 2-Pin Dimmer', modelNumber: '2457D2X' };
                break;
            case 'U':
                retVal = { name: 'Dual Band Switchlinc Dimmer', modelNumber: '2432-622', class: insteondevice_1.InsteonDimmerSwitchDevice };
                break;
            case ' ':
                retVal = { name: 'Dual Band SwitchLinc Dimmer', modelNumber: '2477D', class: insteondevice_1.InsteonDimmerSwitchDevice };
                break;
            case '1':
                retVal = { name: 'Dual Band SwitchLinc Dimmer (240V)', modelNumber: '2478D', class: insteondevice_1.InsteonDimmerSwitchDevice };
                break;
            case '-':
                retVal = { name: 'Dual Band SwitchLinc Dimmer', modelNumber: '2477DH', class: insteondevice_1.InsteonDimmerSwitchDevice };
                break;
            case "'":
                retVal = { name: 'Dual Band SwitchLinc Dimmer', modelNumber: '2477D-SP', class: insteondevice_1.InsteonDimmerSwitchDevice };
                break;
            case '+':
                retVal = { name: 'Dual Band SwitchLinc Dimmer', modelNumber: '2477DH-SP', class: insteondevice_1.InsteonDimmerSwitchDevice };
                break;
            case ')':
                retVal = { name: 'KeypadLinc Dimmer 8 Buttons', modelNumber: '2486D-SP', class: insteondevice_1.InsteonDimmerSwitchDevice };
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
                retVal = { name: 'FanLinc', modelNumber: '2475F', class: insteondevice_1.InsteonFanDevice };
                break;
            case '!':
                retVal = { name: 'Dual Band OutletLinc Dimmer', modelNumber: '2472D', class: insteondevice_1.InsteonDimmerOutletDevice };
                break;
            case '0':
                retVal = { name: 'SwitchLinc Dimmer', modelNumber: '2476D', class: insteondevice_1.InsteonDimmerSwitchDevice };
                break;
            case '$':
                retVal = { name: 'SwitchLinc Dimmer 2-Wire', modelNumber: '2474DWH', class: insteondevice_1.InsteonDimmerSwitchDevice };
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
                retVal = { name: 'KeypadLinc Dimmer 5 Buttons', modelNumber: '2334-2' };
                break;
            case 'A':
                retVal = { name: 'KeypadLinc Dimmer 8 Buttons', modelNumber: '2334-2' };
                break;
            case 'V':
                retVal = { name: 'KeypadLinc Dimmer 6 Buttons', modelNumber: '2334-632' };
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
            retVal.class = insteondevice_1.InsteonDimmableDevice;
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
                retVal = { name: 'INSTEON Motion Sensor', modelNumber: '2842-222', class: insteondevice_1.InsteonMotionSensorDevice };
                break;
            case String.fromCharCode(0o004):
                retVal = { name: 'INSTEON Motion Sensor', modelNumber: '2842-422' };
                break;
            case String.fromCharCode(0o005):
                retVal = { name: 'INSTEON Motion Sensor', modelNumber: '2842-522' };
                break;
            case String.fromCharCode(0o003):
                retVal = { name: 'INSTEON Motion Sensor', modelNumber: '2420M-SP' };
                break;
            case String.fromCharCode(0o002):
                retVal = { name: 'TriggerLinc', modelNumber: '2421' };
                break;
            case '\t':
                retVal = { name: 'Open/Close Sensor', modelNumber: '2843-222', class: insteondevice_1.InsteonDoorWindowSensorDevice };
                break;
            case String.fromCharCode(0o006):
                retVal = { name: 'Open/Close Sensor', modelNumber: '2843-422', class: insteondevice_1.InsteonDoorWindowSensorDevice };
                break;
            case String.fromCharCode(0o007):
                break;
            case String.fromCharCode(0o031):
                retVal = { name: 'Open/Close Sensor', modelNumber: '2843-522', class: insteondevice_1.InsteonDoorWindowSensorDevice };
                break;
            case '\b':
                retVal = { name: 'Leak Sensor', modelNumber: '2852-222', class: insteondevice_1.InsteonLeakSensorDevice };
                break;
            case '\r':
                retVal = { name: 'Leak Sensor', modelNumber: '2852-422', class: insteondevice_1.InsteonLeakSensorDevice };
                break;
            case String.fromCharCode(0o016):
                break;
            case String.fromCharCode(0o032):
                retVal = { name: 'Leak Sensor', modelNumber: '2852-522', class: insteondevice_1.InsteonLeakSensorDevice };
                break;
            case '\n':
                return 'INSTEON Smoke Sensor';
                break;
            case String.fromCharCode(0o021):
                retVal = { name: 'INSTEON Hidden Door Sensor', modelNumber: '2845-222', class: insteondevice_1.InsteonDoorWindowSensorDevice };
                break;
            case String.fromCharCode(0o024):
                retVal = { name: 'INSTEON Hidden Door Sensor', modelNumber: '2845-422', class: insteondevice_1.InsteonDoorWindowSensorDevice };
                break;
            case String.fromCharCode(0o025):
                break;
            case String.fromCharCode(0o033):
                retVal = { name: 'INSTEON Hidden Door Sensor', modelNumber: '2845-522', class: insteondevice_1.InsteonDoorWindowSensorDevice };
                break;
            case String.fromCharCode(0o026):
                retVal = { name: 'Insteon Motion Sensor II', modelNumber: '2844-222', class: insteondevice_1.InsteonMotionSensorDevice };
                break;
            case String.fromCharCode(0o030):
                retVal = { name: 'Insteon Motion Sensor II', modelNumber: '2844-522', class: insteondevice_1.InsteonMotionSensorDevice };
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
DeviceFactory.LINK_MANAGEMENT_NAME = 'Link Management';
DeviceFactory.LIGHT_NAME = 'Name';
DeviceFactory.LIGHT_ADDRESS = 'Address';
DeviceFactory.DEVICE_TYPE = 'Type';
DeviceFactory.ON_LEVEL = 'On Level';
DeviceFactory.OFF_LEVEL = 'Off Level';
DeviceFactory.RAMP_RATE = 'Ramp Rate';
DeviceFactory.STATUS = 'Current State';
DeviceFactory.LIGHT_ON = 'On';
DeviceFactory.LIGHT_OFF = 'Off';
DeviceFactory.LIGHT_FAST_ON = 'Fast On';
DeviceFactory.LIGHT_FAST_OFF = 'Fast Off';
DeviceFactory.LIGHT_DIM = 'Dim';
DeviceFactory.LIGHT_BRIGHTEN = 'Brighten';
DeviceFactory.LIGHT_MOVE_UP = 'Move Up';
DeviceFactory.LIGHT_MOVE_DOWN = 'Move Down';
DeviceFactory.SETPOINT = 'Setpoint';
DeviceFactory.HUMIDITY = 'Humidity';
DeviceFactory.TEMPERATURE = 'Temperature';
DeviceFactory.LOCK_DOOR = 'Lock';
DeviceFactory.UNLOCK_DOOR = 'Unlock';
DeviceFactory.LOCKED_DOOR = 'Locked';
DeviceFactory.UNLOCKED_DOOR = 'Unlocked';
DeviceFactory.ACCUMULATED_POWER = 'Accumulated Power';
DeviceFactory.RESET = 'Reset';
DeviceFactory.ADVANCED = 'Advanced';
DeviceFactory.LED_BRIGHTNESS = 'LED Brightness';
DeviceFactory.LOCKED_DOOR_ST = '<html><font color="RED">Locked</font></html>';
DeviceFactory.UNLOCKED_DOOR_ST = '<html><font color="GREEN">Unlocked</font></html>';
DeviceFactory.SCENE_UNSUPPORTED_VALUE = '(Unsupported Value)';
DeviceFactory.SCENE_NO_RETRIES = 'No Retries';
DeviceFactory.SCENE_ONE_RETRY = '  1 Retry';
DeviceFactory.SCENE_N_RETRIES_SUFFIX = 'Retries';
DeviceFactory.SCENE_ADVANCED_PROPERTIES = 'Show Advanced Properties';
DeviceFactory.SCENE_DEVICE_COMMUNICATION_PROP = 'Device Communication';
DeviceFactory.PLM_COMMUNICATIONS_MENU = 'PLM Communication';
DeviceFactory.PLM_COMMUNICATIONS_TITLE = 'PLM Communication';
DeviceFactory.PLM_COMMUNICATIONS_DESC = 'Communication to the PLM';
DeviceFactory.FANLINC_OFF = 'Off';
DeviceFactory.FANLINC_LOW = 'Low';
DeviceFactory.FANLINC_MED = 'Med';
DeviceFactory.FANLINC_HIGH = 'High';
DeviceFactory.EZFLORA_ZONE_8_PUMP = 'Zone 8: Pump';
DeviceFactory.EZFLORA_ZONE_8_NORMAL = 'Zone 8: Normal';
DeviceFactory.RL2_LED_LABEL = 'LED';
DeviceFactory.RL2_BEEP_LABEL = 'Beep';
DeviceFactory.RL2_4_BUTTON_LABEL = '4-Scene';
DeviceFactory.RL2_8_BUTTON_NON_TOG_LABEL = '8-Scene non-Toggle';
DeviceFactory.RL2_8_BUTTON_TOG_LABEL = '8-Scene Toggle';
DeviceFactory.RL2_1_BUTTON_LABEL = '1-Scene';
DeviceFactory.RL2_2_BUTTON_NON_TOG_LABEL = '2-Scene non-Toggle';
DeviceFactory.RL2_2_BUTTON_TOG_LABEL = '2-Scene Toggle';
DeviceFactory.RL2_CHANGE_BUTTON_CONFIG_TITLE = 'Change Button Configuration';
DeviceFactory.CLIMATE_INCREMENT_SETPOINT = 'Setpoint Up 1';
DeviceFactory.CLIMATE_DECREMENT_SETPOINT = 'Setpoint Down 1';
DeviceFactory.MASTER_CONTROLLER_LABEL = 'Controller';
DeviceFactory.SLAVE_LABEL = 'Responder';
DeviceFactory.SCENE_ATTRIBUTES = 'Scene Attributes';
DeviceFactory.COPYING_SCENE_ATTRIBUTES = 'Copying Scene Attributes';
DeviceFactory.GLOBALLY_CHANGE_SCENE_ATTRIBUTES = 'Apply Changes To All Devices';
DeviceFactory.NODE_LABEL = 'INSTEON Device';
DeviceFactory.A10_NODE_LABEL = 'INSTEON/A10/X10 Device';
DeviceFactory.LINK_SENSOR_LABEL = 'Link a Sensor';
DeviceFactory.LINK_HIDDEN_DOOR_SENSOR_LABEL = 'Hidden Door Sensor';
DeviceFactory.LINK_OPEN_CLOSE_SENSOR_LABEL = 'Open/Close Sensor';
DeviceFactory.LINK_LEAK_SENSOR_LABEL = 'Leak Sensor';
DeviceFactory.LINK_MOTION_SENSOR_LABEL = 'Motion Sensor';
DeviceFactory.LINK_MOTION_SENSOR_II_LABEL = 'Motion Sensor II';
DeviceFactory.LINK_REMOTELINC2_LABEL = 'Link a RemoteLinc 2';
DeviceFactory.LINK_REMOTELINC2_SWITCH_SUBLABEL = 'Switch';
DeviceFactory.LINK_REMOTELINC2_4SCENE_SUBLABEL = '4-Scene Keypad';
DeviceFactory.LINK_REMOTELINC2_8SCENE_SUBLABEL = '8-Scene Keypad';
DeviceFactory.LINK_CONTROLINC_LABEL = 'Link a ControLinc';
DeviceFactory.LINK_REMOTELINC_LABEL = 'Link a RemoteLinc';
DeviceFactory.LINK_IRLINC_RX_LABEL = 'Add Button to IRLinc Receiver';
DeviceFactory.LINK_IRLINC_TX_LABEL = 'Add Button to IRLinc Transmitter';
DeviceFactory.LINK_EZSNSRF_LABEL = 'Add Sensor to EZSnSRF';
DeviceFactory.LINK_EZX10RF_LABEL = 'Add X10 Device to EZX10RF';
DeviceFactory.KEYPADLINC = 'KeypadLinc';
DeviceFactory.BUTTONS_GROUPING = 'Buttons Grouping';
DeviceFactory.MUTUALLY_EXCLUSIVE_BUTTONS = 'Mutually Exclusive Buttons';
DeviceFactory.BUTTON_TOGGLE = 'Buttons Toggle Mode';
DeviceFactory.BUTTON_BACKLIGHT = 'LED Brightness';
DeviceFactory.THERMOSTAT_HUMIDTY = 'Report Humidty';
DeviceFactory.PLM = 'Modem (PLM)';
DeviceFactory.TOGGLE_CONTROLLER_RESPONDER = 'Controller/Responder';
DeviceFactory.TOGGLE_BUTTON_TOGGLE = 'Toggle On/Off';
DeviceFactory.SET_TOGGLE_MODE = 'Set Button Toggle Mode';
DeviceFactory.TOGGLE_MODES = 'Button Toggle Modes';
DeviceFactory.ALL_TOGGLE_LABEL = 'All Toggle';
DeviceFactory.ALL_NON_TOGGLE_LABEL = 'All Non-Toggle';
DeviceFactory.SET_SCHEDULE = 'Schedule';
DeviceFactory.SET_OPTIONS = 'Options';
DeviceFactory.LOCAL_ONLY_LABEL = ' [Applied Locally]';
DeviceFactory.AUTO_DISCOVER_LABEL = 'Auto Discover';
DeviceFactory.CHOOSE_BRIDGE_TYPE = 'Choose INSTEON Bridge';
DeviceFactory.GET_PLM_STATUS = 'PLM Info/Status';
DeviceFactory.SHOW_PLM_LINKS = 'Show PLM Links Table';
DeviceFactory.SHOW_DEVICE_LINKS = 'Show Device Links Table';
DeviceFactory.SHOW_ISY_LINKS = 'Show ISY Links Table';
DeviceFactory.PLM_LINKS_TABLE = 'PLM Links Table';
DeviceFactory.DEVICE_LINKS_TABLE = 'Device Links Table';
DeviceFactory.ADVANCED_OPTIONS = 'Advanced Options';
DeviceFactory.SCENE_TEST = 'Scene Test';
DeviceFactory.ADVANCED_OPTIONS_ENGINE = 'Configure INSTEON Messaging:';
DeviceFactory.USE_I1_ONLY = '<html><b>i1 Only</b>: ISY uses i1 messaging option</html>';
DeviceFactory.CALBIRATE_ENGINE_VERSIONS = '<html><b>Automatic</b>: ISY tries to find the most suitable messaging option</html>';
DeviceFactory.DEVICE_REPORTED_VERSION = '<html><b>Device Reported</b>: ISY uses the device reported messaging option</html>';
DeviceFactory.ISY_LINK_TABLE = 'ISY Links Table';
DeviceFactory.DL_FROM_LINK = 'From Link';
DeviceFactory.DL_READ = 'Read ';
DeviceFactory.DL_LINKS = 'Links';
DeviceFactory.START_LINK_ADDRESS = 'Start Address';
DeviceFactory.END_LINK_ADDRESS = 'End Address';
DeviceFactory.SENSITIVITY_LEVEL = 'Darkness Sensitivity';
DeviceFactory.SENSING_MODE = '<html>Sensing mode:<br>As motion is sensed (checked)<br>Only after timeout (unchecked)</html>';
DeviceFactory.NIGHT_ONLY_MODE = '<html>Night mode:<br>Always (checked)<br>At night only (unchecked)</html>';
DeviceFactory.ON_ONLY_MODE = '<html>On only mode:<br>On/off commands (checked)<br>On commands only (unchecked)</html>';
DeviceFactory.NIGHT_ONLY_MODE_CHECKED = 'Night only mode';
DeviceFactory.ON_ONLY_MODE_CHECKED = 'On commands only';
DeviceFactory.PROGRAM_LOCK = 'Local programming lockout';
DeviceFactory.LED_ON_TX = 'LED on TX';
DeviceFactory.RELAY_FOLLOWS_INPUT = 'Relay Follows Input';
DeviceFactory.MOMENTARY_A = '<html>Momentary A: <font color="red">Triggered by either On or Off</font></html>';
DeviceFactory.LATCH = '<html>Latching: <font color="red">Continuous</font></html>';
DeviceFactory.MOMENTARY_BOTH = '<html>Momentary B: <font color="red">Triggered by both On and Off</font></html>';
DeviceFactory.MOMENTARY_LOOK_AT_SENSOR = '<html>Momentary C: <font color="red">Trigger based on sensor input</font></html>';
DeviceFactory.SEND_X10 = 'Send X10 Send On (or Off)';
DeviceFactory.TRIGGER_OFF = 'Trigger Reverse';
DeviceFactory.BEEP = 'Beep';
DeviceFactory.TIMER_ENABLED = 'Countdown Timer Enabled';
DeviceFactory.TRIGGER_GROUP_ON = 'Trigger Group';
DeviceFactory.LED_ON = 'LED On';
DeviceFactory.ONE_MIN_LOCAL_WARNING = '1 Minute Warning';
DeviceFactory.DEFAULT_TIMEOUT_VALUE = 'Default Timeout (min)';
DeviceFactory.TRIGGER_THRESHOLD_WATTS = 'Trigger Threshold (Watts)';
DeviceFactory.HOLD_OFF_SECS = 'Holdoff (Secs)';
DeviceFactory.HYSTERESIS_WATTS = 'Hysteresis (Watts)';
DeviceFactory.MICRO_OPEN_CLOSE_MOMENTARY_TIMEOUT = 'Momentary Mode Timeout';
