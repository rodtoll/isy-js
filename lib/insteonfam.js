Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
class InsteonNLS {
    static getDeviceDescription(paramString) {
        let c = paramString.charAt(0);
        let str = null;
        if (c == '\000') {
            str = InsteonNLS.getNLSControllerInfo(paramString);
        }
        else if (c == '\001') {
            str = InsteonNLS.getNLSDimLightInfo(paramString);
        }
        else if (c == '\002') {
            str = InsteonNLS.getNLSSwitchLightInfo(paramString);
        }
        else if (c == '\003') {
            str = InsteonNLS.getNLSNetworkBridgeInfo(paramString);
        }
        else if (c == '\005') {
            str = InsteonNLS.getNLSClimateControlInfo(paramString);
        }
        else if (c == '\004') {
            str = InsteonNLS.getNLSIrrigationControlInfo(paramString);
        }
        else if (c == '\007') {
            str = InsteonNLS.getNLSIOControlInfo(paramString);
        }
        else if (c == '\017') {
            str = InsteonNLS.getNLSAccessControlInfo(paramString);
        }
        else if (c == '\020') {
            str = InsteonNLS.getNLSSHS(paramString);
        }
        else if (c == '\t') {
            str = InsteonNLS.getNLSEnergyManagement(paramString);
        }
        else if (c == '\016') {
            str = InsteonNLS.getNLSWindowsCovering(paramString);
        }
        if (paramString.length > 2) {
            str.append(' v.');
            str.append(util_1.format('%02X', Number.parseInt(paramString.charAt(2))));
        }
        return str;
    }
    static getNLSNetworkBridgeInfo(paramString) {
        const c = paramString.charAt(1);
        switch (c) {
            case '\001':
                return '(2414S) PowerLinc Serial';
            case '\002':
                return '(2414U) PowerLinc USB';
            case '\003':
                return '(2814S) Icon PowerLinc Serial';
            case '\004':
                return '(2814U) Icon PowerLinc USB';
            case '\005':
                return '(2412S) PowerLine Modem';
            case '\006':
                return '(2411R) IRLinc Receiver';
            case '\007':
                return '(2411T) IRLinc Transmitter';
            case '\013':
                return '(2412U) PowerLine Modem USB';
            case '\r':
                return 'EZX10-RF';
            case '\017':
                return 'EZX10-IR';
            case 'O':
                return '(12237DB) PowerLine Modem';
        }
        return null;
    }
    static getNLSIrrigationControlInfo(paramString) {
        const c = paramString.charAt(1);
        return (c == '\000') ? 'EZRain/EZFlora Irrigation Controller' : null;
    }
    static getNLSSwitchLightInfo(paramString) {
        const c = paramString.charAt(1);
        switch (c) {
            case '\006':
                return '(2456S3E) ApplianceLinc - Outdoor Plugin Module';
            case '\007':
                return '(2456S3T) TimerLinc';
            case '\t':
                return '(2456S3) ApplianceLinc';
            case '\n':
                return '(2476ST) SwitchLinc Relay';
            case '\013':
                return '(2876S) Icon On/Off Switch';
            case '\f':
                return '(2856S3) Icon Appliance Adapter';
            case '\r':
            case '\032':
                return '(2466S) ToggleLinc Relay';
            case '\016':
            case ')':
                return '(2476ST) SwitchLinc Relay Timer';
            case '\021':
                return 'EZSwitch30';
            case '\017':
                return '(2486S/WH6) KeypadLinc Relay';
            case '\005':
                return '(2486S/WH8) KeypadLinc Relay (8 buttons)';
            case '\020':
                return '(2475S) In-LineLinc Relay';
            case '\024':
                return '(B2475S) In-LineLinc Relay W/ Sense';
            case '\023':
                return 'Icon SwitchLinc Relay for Bell Canada';
            case '\b':
                return '(2473) OutletLinc';
            case '\022':
                return '(2474S) Companion Switch';
            case '\025':
                return '(2476S) SwitchLinc Relay W/ Sense';
            case '\027':
                return '(2856S3B) Icon Relay 3-Pin';
            case '\026':
                return '(2876SB)  Icon Relay Switch';
            case '\030':
                return '(2494S220) SwitchLinc Relay 220 V.';
            case '\031':
                return '(2494S220) SwitchLinc Relay 220 V. w/Beeper';
            case '\034':
                return '(2476S) SwitchLinc Relay - Remote Control On/Off Switch';
            case '%':
                return '(2484S/WH8) KeypadLinc Timer Relay (8 buttons)';
            case ' ':
                return '(2486S/WH6-SP) KeypadLinc Relay';
            case '!':
                return '(2473-SP) OutletLinc';
            case '#':
                return '(2476S-SP) SwitchLinc Relay - Remote Control On/Off Switch';
            case '"':
                return '(2475S-SP) In-LineLinc Relay';
            case '\036':
            case ',':
                return '(2487S) Dual Band KeypadLinc Relay';
            case '\037':
                return '(2475SDB) Dual Band InlineLinc On/Off Switch';
            case '*':
                return '(2477S) Dual Band SwitchLinc On/Off Switch';
            case '/':
                return '(2443-222) Micro Module On/Off';
            case '1':
                return '(2443-422) Micro Module On/Off';
            case '2':
            case '<':
                return '(2443-522) Micro Module On/Off';
            case '.':
                return '(2453-222) Din Rail Relay';
            case '3':
                return '(2453-422) Din Rail Relay';
            case '4':
            case '=':
                return '(2453-522) Din Rail Relay';
            case '7':
                return '(2635-222) On/Off Module';
            case '8':
                return '(2634-222) On/Off Outdoor Module';
            case '9':
                return '(2663-222) On/Off Outlet';
            case '-':
                return '(2633-422) Plugin Relay';
            case '0':
                return '(2633-432) Plugin Relay';
            case '5':
                return '(2633-442) Plugin Relay';
            case '6':
                return '(2633-522) Plugin Relay';
        }
        return null;
    }
    static getNLSDimLightInfo(paramString) {
        const c = paramString.charAt(1);
        switch (c) {
            case '\000':
                return '(2456D3) LampLinc';
            case '\001':
                return '(2476D) SwitchLinc Dimmer';
            case '\002':
                return '(2475D) In-LineLinc Dimmable';
            case '\003':
                return '(2876D3) Icon Switch Dimmer';
            case '\004':
                return '(2476DH) SwitchLinc Dimmer';
            case '\006':
                return '(2456D2) LampLinc 2 Pin';
            case '\t':
                return '(2486D) KeypadLinc Dimmer';
            case '\007':
                return '(2856D2) Icon LampLinc 2 Pin';
            case '\n':
                return '(2886D) Icon In-Wall Controller';
            case '\r':
                return '(2454D) SocketLinc';
            case '\f':
                return '(2486DWH8) KeypadLinc Dimmer 8 Button';
            case '\023':
                return 'Icon SwitchLinc Dimmer for Bell Canada';
            case '\027':
            case '\037':
                return '(2466D) ToggleLinc Dimmer';
            case '\030':
                return '(2474D) Companion Dimmer';
            case '\032':
                return '(2475D) InlineLinc Dimmer';
            case '\005':
                return '(2484DWH8) KeypadLinc Countdown Timer';
            case '\033':
                return '(2486D) KeypadLinc Dimmer 6 Buttons';
            case '\034':
                return '(2486D) KeypadLinc Dimmer 8 Buttons';
            case '\031':
                return '(2476D) SwitchLinc Dimmer W/Beeper';
            case '\016':
                return '(B2457D2) LampLinc BiPhy';
            case '\036':
                return '(2876DB) Icon Dimmer';
            case '\035':
                return '(2476DH) SwitchLinc Dimmer 1000W';
            case '"':
                return '(2457D2X) LampLinc 2-Pin Dimmer';
            case 'U':
                return '(2432-622) Dual Band Switchlinc Dimmer';
            case ' ':
                return '(2477D) Dual Band SwitchLinc Dimmer';
            case '1':
                return '(2478D) Dual Band SwitchLinc Dimmer (240V)';
            case '-':
                return '(2477DH) Dual Band SwitchLinc Dimmer';
            case '\'':
                return '(2477D-SP) Dual Band SwitchLinc Dimmer';
            case '+':
                return '(2477DH-SP) Dual Band SwitchLinc Dimmer';
            case ')':
                return '(2486D-SP) KeypadLinc Dimmer 8 Buttons';
            case '*':
                return '(2457D2X-SP) LampLinc 2-Pin Dimmer';
            case ',':
                return '(2475D-SP) InlineLinc Dimmer';
            case '%':
                return '(2475DA2) Ballast Dimmer';
            case '=':
                return '(2446-422) Ballast Dimmer';
            case '>':
                return '(2446-522) Ballast Dimmer';
            case '.':
                return '(2475F) FanLinc';
            case '!':
                return '(2472D) Dual Band OutletLinc Dimmer';
            case '0':
                return '(2476D) SwitchLinc Dimmer';
            case '$':
                return '(2474DWH) SwitchLinc Dimmer 2-Wire';
            case '2':
                return '(2475DA1) InLineLinc Dimmer';
            case ':':
                return '(2672-222) Insteon LED Bulb 8 Watt (60W)';
            case 'I':
                return '(2674-222) Insteon LED Bulb PAR38 12 Watt';
            case '5':
                return '(2442-222) Micro Module Dimmer';
            case '8':
                return '(2442-422) Micro Module Dimmer';
            case '9':
            case 'S':
                return '(2442-522) Micro Module Dimmer';
            case '4':
                return '(2452-222) Din Rail Dimmer';
            case '6':
                return '(2452-422) Din Rail Dimmer';
            case '7':
            case 'T':
                return '(2452-522) Din Rail Dimmer';
            case 'B':
                return '(2334-2) KeypadLinc Dimmer 5 Buttons';
            case 'A':
                return '(2334-2) KeypadLinc Dimmer 8 Buttons';
            case 'V':
                return '(2334-632) KeypadLinc Dimmer 6 Buttons';
            case '\013':
                return '(2632-422) Plugin Dimmer';
            case '\017':
                return '(2632-432) Plugin Dimmer';
            case '\021':
                return '(2632-442) Plugin Dimmer';
            case 'P':
                return '(2632-452) Plugin Dimmer';
            case '\022':
                return '(2632-522) Plugin Dimmer';
        }
        return null;
    }
    static getNLSControllerInfo(paramString) {
        const c = paramString.charAt(1);
        switch (c) {
            case '\000':
                return '(2430) ControLinc';
            case '\005':
                return '(2440) RemoteLinc';
            case '\016':
                return '(2440EZ) RemoteLinc EZ';
            case '\006':
                return '(2830) Icon Tabletop';
            case '\t':
                return '(2442) SignaLinc';
            case '\021':
                return '(2342-242) RemoteLinc 2 Switch';
            case '\020':
                return '(2342-232) RemoteLinc 2 Keypad, 4 Scene';
            case '\022':
                return '(2342-222) RemoteLinc 2 Keypad, 8 Scene';
            case '\024':
                return '(2342-432) Mini Remote Keypad, 4 Scene';
            case '\025':
                return '(2342-442) Mini Remote Switch';
            case '\026':
                return '(2342-422) Mini Remote Keypad, 8 Scene';
            case '\027':
                return '(2342-532) Mini Remote Keypad, 4 Scene';
            case '\030':
                return '(2342-522) Mini Remote Keypad, 8 Scene';
            case '\031':
                return '(2342-542) Mini Remote Switch';
            case '\032':
                return '(2342-222) Mini Remote Keypad, 8 Scene';
            case '\033':
                return '(2342-232) Mini Remote Keypad, 4 Scene';
            case '\034':
                return '(2342-242) Mini Remote Switch';
        }
        return null;
    }
    static getNLSIOControlInfo(paramString) {
        const c = paramString.charAt(1);
        switch (c) {
            case '\000':
                return '(2450) IOLinc';
            case '\003':
                return 'Compacta EZIO 2x4: INSTEON I/O Controller';
            case '\004':
                return 'Compacta EZIO8SA: INSTEON I/O Controller';
            case '\002':
                return 'Compacta EZIO8T: INSTEON I/O Controller';
            case '\005':
                return 'Compacta EZSnSRF';
            case '\006':
                return 'Compacta EZSnSRF Interface';
            case '\007':
                return 'Compacta EZIO6I';
            case '\b':
                return 'Compacta EZIO4O';
            case '\t':
                return '(2423A5) SynchroLinc';
            case '\r':
                return '(2450) IOLinc (Refurbished)';
            case '\016':
                return '(2248-222) I/O Module';
            case '\017':
                return '(2248-422) I/O Module';
            case '\020':
                return '(2248-442) I/O Module';
            case '\021':
                return '(2248-522) I/O Module';
            case '\022':
                return '(2822-222) IOLinc';
            case '\023':
                return '(2822-422) IOLinc';
            case '\024':
                return '(2822-442) IOLinc';
            case '\025':
                return '(2822-522) IOLinc';
            case '\026':
                return '(2822-222) Contact Closure';
            case '\027':
                return '(2822-422) Contact Closure';
            case '\030':
                return '(2822-442) Contact Closure';
            case '\031':
                return '(2822-522) Contact Closure';
            case '\032':
                return '(2867-222) Alert Module';
            case '\036':
                return '(2868-222) Siren';
            case ' ':
                return '(2868-622) Siren';
        }
        return null;
    }
    static getNLSSHS(paramString) {
        const c = paramString.charAt(1);
        switch (c) {
            case '\001':
                return '(2842-222) INSTEON Motion Sensor';
            case '\004':
                return '(2842-422) INSTEON Motion Sensor';
            case '\005':
                return '(2842-522) INSTEON Motion Sensor';
            case '\003':
                return '(2420M-SP) INSTEON Motion Sensor';
            case '\002':
                return '(2421) TriggerLinc';
            case '\t':
                return '(2843-222) Open/Close Sensor';
            case '\006':
                return '(2843-422) Open/Close Sensor';
            case '\007':
            case '\031':
                return '(2843-522) Open/Close Sensor';
            case '\b':
                return '(2852-222) Leak Sensor';
            case '\r':
                return '(2852-422) Leak Sensor';
            case '\016':
            case '\032':
                return '(2852-522) Leak Sensor';
            case '\n':
                return 'INSTEON Smoke Sensor';
            case '\021':
                return '(2845-222) INSTEON Hidden Door Sensor';
            case '\024':
                return '(2845-422) INSTEON Hidden Door Sensor';
            case '\025':
            case '\033':
                return '(2845-522) INSTEON Hidden Door Sensor';
            case '\026':
                return '(2844-222) Insteon Motion Sensor II';
            case '\030':
                return '(2844-522) Insteon Motion Sensor II';
        }
        return null;
    }
    static getNLSClimateControlInfo(paramString) {
        const c = paramString.charAt(1);
        switch (c) {
            case '\000':
                return 'BROAN SMSC080 Exhaust Fan';
            case '\002':
                return 'BROAN SMSC110 Exhaust Fan';
            case '\005':
                return 'BROAN, Venmar, Best Rangehoods';
            case '\001':
            case '\004':
                return 'Compacta EZTherm';
            case '\003':
                return '(2441V) INSTEON Thermostat Adapter';
            case '\t':
                return '(2441V-SP) INSTEON Thermostat Adapter';
            case '\013':
                return '(2441TH) INSTEON Thermostat';
            case '\017':
                return '(2732-422) INSTEON Thermostat';
            case '\020':
                return '(2732-522) INSTEON Thermostat';
            case '\021':
                return '(2732-432) INSTEON Thermostat';
            case '\022':
                return '(2732-532) INSTEON Thermostat';
            case '\023':
                return '(2732-242) INSTEON Thermostat Heat Pump';
            case '\024':
                return '(2732-442) INSTEON Thermostat Heat Pump for Europe';
            case '\025':
                return '(2732-542) INSTEON Thermostat Heat Pump for Aus/NZ';
            case '\026':
                return '(2732-222) INSTEON Thermostat 2.0 (HVAC/HP)';
            case '\027':
                return '(2732-422) INSTEON Thermostat 2.0 (HVAC/HP) for Europe';
            case '\030':
                return '(2732-522) INSTEON Thermostat 2.0 (HVAC/HP) for Aus/NZ';
            case '\n':
                return '(2441ZTH) INSTEON Wireless Thermostat';
            case '\016':
                return '(2491T) All-In-One INSTEON Thermostat Adapter';
        }
        return null;
    }
    static getNLSAccessControlInfo(paramString) {
        const c = paramString.charAt(1);
        switch (c) {
            case '\006':
                return 'MorningLinc';
            case '\n':
                return 'Lock Controller';
        }
        return null;
    }
    static getNLSEnergyManagement(paramString) {
        const c = paramString.charAt(1);
        switch (c) {
            case '\000':
                return 'ZBPCM (iMeter Solo compat.)';
            case '\007':
                return '(2423A1) iMeter Solo';
            case '\013':
                return 'Dual Band Normally Closed 240V Load Controller (2477SA2)';
            case '\n':
                return 'Dual Band Normally Open 240V Load Controller (2477SA1)';
            case '\r':
                return 'Energy Display (2448A2)';
        }
        return null;
    }
    static getNLSWindowsCovering(paramString) {
        const c = paramString.charAt(1);
        switch (c) {
            case '\001':
                return '(2444-222) Micro Module Open/Close';
            case '\002':
                return '(2444-422) Micro Module Open/Close';
            case '\003':
            case '\007':
                return '(2444-522) Micro Module Open/Close';
        }
        return null;
    }
}
exports.InsteonNLS = InsteonNLS;
InsteonNLS.LINK_MANAGEMENT_NAME = 'Link Management';
InsteonNLS.LIGHT_NAME = 'Name';
InsteonNLS.LIGHT_ADDRESS = 'Address';
InsteonNLS.DEVICE_TYPE = 'Type';
InsteonNLS.ON_LEVEL = 'On Level';
InsteonNLS.OFF_LEVEL = 'Off Level';
InsteonNLS.RAMP_RATE = 'Ramp Rate';
InsteonNLS.STATUS = 'Current State';
InsteonNLS.LIGHT_ON = 'On';
InsteonNLS.LIGHT_OFF = 'Off';
InsteonNLS.LIGHT_FAST_ON = 'Fast On';
InsteonNLS.LIGHT_FAST_OFF = 'Fast Off';
InsteonNLS.LIGHT_DIM = 'Dim';
InsteonNLS.LIGHT_BRIGHTEN = 'Brighten';
InsteonNLS.LIGHT_MOVE_UP = 'Move Up';
InsteonNLS.LIGHT_MOVE_DOWN = 'Move Down';
InsteonNLS.SETPOINT = 'Setpoint';
InsteonNLS.HUMIDITY = 'Humidity';
InsteonNLS.TEMPERATURE = 'Temperature';
InsteonNLS.LOCK_DOOR = 'Lock';
InsteonNLS.UNLOCK_DOOR = 'Unlock';
InsteonNLS.LOCKED_DOOR = 'Locked';
InsteonNLS.UNLOCKED_DOOR = 'Unlocked';
InsteonNLS.ACCUMULATED_POWER = 'Accumulated Power';
InsteonNLS.RESET = 'Reset';
InsteonNLS.ADVANCED = 'Advanced';
InsteonNLS.LED_BRIGHTNESS = 'LED Brightness';
InsteonNLS.LOCKED_DOOR_ST = '<html><font color="RED">Locked</font></html>';
InsteonNLS.UNLOCKED_DOOR_ST = '<html><font color="GREEN">Unlocked</font></html>';
InsteonNLS.SCENE_UNSUPPORTED_VALUE = '(Unsupported Value)';
InsteonNLS.SCENE_NO_RETRIES = 'No Retries';
InsteonNLS.SCENE_ONE_RETRY = '  1 Retry';
InsteonNLS.SCENE_N_RETRIES_SUFFIX = 'Retries';
InsteonNLS.SCENE_ADVANCED_PROPERTIES = 'Show Advanced Properties';
InsteonNLS.SCENE_DEVICE_COMMUNICATION_PROP = 'Device Communication';
InsteonNLS.PLM_COMMUNICATIONS_MENU = 'PLM Communication';
InsteonNLS.PLM_COMMUNICATIONS_TITLE = 'PLM Communication';
InsteonNLS.PLM_COMMUNICATIONS_DESC = 'Communication to the PLM';
InsteonNLS.FANLINC_OFF = 'Off';
InsteonNLS.FANLINC_LOW = 'Low';
InsteonNLS.FANLINC_MED = 'Med';
InsteonNLS.FANLINC_HIGH = 'High';
InsteonNLS.EZFLORA_ZONE_8_PUMP = 'Zone 8: Pump';
InsteonNLS.EZFLORA_ZONE_8_NORMAL = 'Zone 8: Normal';
InsteonNLS.RL2_LED_LABEL = 'LED';
InsteonNLS.RL2_BEEP_LABEL = 'Beep';
InsteonNLS.RL2_4_BUTTON_LABEL = '4-Scene';
InsteonNLS.RL2_8_BUTTON_NON_TOG_LABEL = '8-Scene non-Toggle';
InsteonNLS.RL2_8_BUTTON_TOG_LABEL = '8-Scene Toggle';
InsteonNLS.RL2_1_BUTTON_LABEL = '1-Scene';
InsteonNLS.RL2_2_BUTTON_NON_TOG_LABEL = '2-Scene non-Toggle';
InsteonNLS.RL2_2_BUTTON_TOG_LABEL = '2-Scene Toggle';
InsteonNLS.RL2_CHANGE_BUTTON_CONFIG_TITLE = 'Change Button Configuration';
InsteonNLS.CLIMATE_INCREMENT_SETPOINT = 'Setpoint Up 1';
InsteonNLS.CLIMATE_DECREMENT_SETPOINT = 'Setpoint Down 1';
InsteonNLS.MASTER_CONTROLLER_LABEL = 'Controller';
InsteonNLS.SLAVE_LABEL = 'Responder';
InsteonNLS.SCENE_ATTRIBUTES = 'Scene Attributes';
InsteonNLS.COPYING_SCENE_ATTRIBUTES = 'Copying Scene Attributes';
InsteonNLS.GLOBALLY_CHANGE_SCENE_ATTRIBUTES = 'Apply Changes To All Devices';
InsteonNLS.NODE_LABEL = 'INSTEON Device';
InsteonNLS.A10_NODE_LABEL = 'INSTEON/A10/X10 Device';
InsteonNLS.LINK_SENSOR_LABEL = 'Link a Sensor';
InsteonNLS.LINK_HIDDEN_DOOR_SENSOR_LABEL = 'Hidden Door Sensor';
InsteonNLS.LINK_OPEN_CLOSE_SENSOR_LABEL = 'Open/Close Sensor';
InsteonNLS.LINK_LEAK_SENSOR_LABEL = 'Leak Sensor';
InsteonNLS.LINK_MOTION_SENSOR_LABEL = 'Motion Sensor';
InsteonNLS.LINK_MOTION_SENSOR_II_LABEL = 'Motion Sensor II';
InsteonNLS.LINK_REMOTELINC2_LABEL = 'Link a RemoteLinc 2';
InsteonNLS.LINK_REMOTELINC2_SWITCH_SUBLABEL = 'Switch';
InsteonNLS.LINK_REMOTELINC2_4SCENE_SUBLABEL = '4-Scene Keypad';
InsteonNLS.LINK_REMOTELINC2_8SCENE_SUBLABEL = '8-Scene Keypad';
InsteonNLS.LINK_CONTROLINC_LABEL = 'Link a ControLinc';
InsteonNLS.LINK_REMOTELINC_LABEL = 'Link a RemoteLinc';
InsteonNLS.LINK_IRLINC_RX_LABEL = 'Add Button to IRLinc Receiver';
InsteonNLS.LINK_IRLINC_TX_LABEL = 'Add Button to IRLinc Transmitter';
InsteonNLS.LINK_EZSNSRF_LABEL = 'Add Sensor to EZSnSRF';
InsteonNLS.LINK_EZX10RF_LABEL = 'Add X10 Device to EZX10RF';
InsteonNLS.DOOR_SENSOR_PROGRAMMING_MODE_ENTRY = '<b>Door Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on the side of the Door Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br>';
InsteonNLS.OPEN_CLOSE_SENSOR_PROGRAMMING_MODE_ENTRY = '<b>Open/Close Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button inside the Open/Close Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br>';
InsteonNLS.LEAK_SENSOR_PROGRAMMING_MODE_ENTRY = '<b>Leak Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on top of the Leak Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br>';
InsteonNLS.REMOTELINC2_PROGRAMMING_MODE_ENTRY = '<b>RemoteLinc 2<br>&nbsp; &nbsp; Ensure the on/off switch is in the On position.<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button at the base of the RemoteLinc2<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br>';
InsteonNLS.REMOTELINC_PROGRAMMING_MODE_ENTRY = '<b>RemoteLinc<br>&nbsp; &nbsp; Simultaneously press and hold the <font color="red">Dim & Bright</font> buttons on the RemoteLinc<br>&nbsp; &nbsp; until the LED starts flashing (takes about 10 seconds)</b><br>';
InsteonNLS.MOTION_SENSOR_PROGRAMMING_MODE_ENTRY = '<b>Motion Sensor or Open/Close Sensor<br>&nbsp; &nbsp; Click and hold the <font color="red">Set</font> button until the light starts flashing (takes about 5 seconds)</b><br>';
InsteonNLS.DOOR_SENSOR_PROGRAMMING_MODE = '<html><b>Your Door Sensor needs to be put into communications mode<br>to complete this operation.</b><br><br><b>Door Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on the side of the Door Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Click <font color="red">Ok</font> when complete</html>';
InsteonNLS.OPEN_CLOSE_SENSOR_PROGRAMMING_MODE = '<html><b>Your Open/Close Sensor needs to be put into communications mode<br>to complete this operation.</b><br><br><b>Open/Close Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button inside the Open/Close Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Click <font color="red">Ok</font> when complete</html>';
InsteonNLS.LEAK_SENSOR_PROGRAMMING_MODE = '<html><b>Your Leak Sensor needs to be put into communications mode<br>to complete this operation.</b><br><br><b>Leak Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on top of the Leak Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Click <font color="red">Ok</font> when complete</html>';
InsteonNLS.REMOTELINC2_PROGRAMMING_MODE = '<html><b>Your RemoteLinc2 needs to be put into communications mode<br>to complete this operation.</b><br><br><b>RemoteLinc 2<br>&nbsp; &nbsp; Ensure the on/off switch is in the On position.<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button at the base of the RemoteLinc2<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Click <font color="red">Ok</font> when complete</html>';
InsteonNLS.REMOTELINC_PROGRAMMING_MODE = '<html><b>Your RemoteLinc needs to be put into communications mode<br>to complete this operation.</b><br><br><b>RemoteLinc<br>&nbsp; &nbsp; Simultaneously press and hold the <font color="red">Dim & Bright</font> buttons on the RemoteLinc<br>&nbsp; &nbsp; until the LED starts flashing (takes about 10 seconds)</b><br><br><b>Click <font color="red">Ok</font> when complete</html>';
InsteonNLS.MOTIONSENSOR_PROGRAMMING_MODE = '<html><b>Your Motion Sensor or Open/Close Sensor needs to be put into communications mode<br>to complete this operation.</b><br><br><b>Motion Sensor or Open/Close Sensor<br>&nbsp; &nbsp; Click and hold the <font color="red">Set</font> button until the light starts flashing (takes about 5 seconds)</b><br><br><b>Click <font color="red">Ok</font> when complete</html>';
InsteonNLS.BATTERY_POWERED_PROGRAMMING_INSTRUCTIONS = '<b>Door Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on the side of the Door Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Open/Close Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button inside the Open/Close Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Leak Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on top of the Leak Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>RemoteLinc 2<br>&nbsp; &nbsp; Ensure the on/off switch is in the On position.<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button at the base of the RemoteLinc2<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>RemoteLinc<br>&nbsp; &nbsp; Simultaneously press and hold the <font color="red">Dim & Bright</font> buttons on the RemoteLinc<br>&nbsp; &nbsp; until the LED starts flashing (takes about 10 seconds)</b><br><br><b>Motion Sensor or Open/Close Sensor<br>&nbsp; &nbsp; Click and hold the <font color="red">Set</font> button until the light starts flashing (takes about 5 seconds)</b><br><br>';
InsteonNLS.BATTERY_POWERED_PROGRAMMING_MODE = '<html><b>One or more of your battery powered devices need to be put in communications mode<br>to complete this operation.</b><br><br><b>Door Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on the side of the Door Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Open/Close Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button inside the Open/Close Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Leak Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on top of the Leak Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>RemoteLinc 2<br>&nbsp; &nbsp; Ensure the on/off switch is in the On position.<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button at the base of the RemoteLinc2<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>RemoteLinc<br>&nbsp; &nbsp; Simultaneously press and hold the <font color="red">Dim & Bright</font> buttons on the RemoteLinc<br>&nbsp; &nbsp; until the LED starts flashing (takes about 10 seconds)</b><br><br><b>Motion Sensor or Open/Close Sensor<br>&nbsp; &nbsp; Click and hold the <font color="red">Set</font> button until the light starts flashing (takes about 5 seconds)</b><br><br><b>Click <font color="red">Ok</font> when complete</html>';
InsteonNLS.A10_DEVICE_ADD_MESSAGE = '<html><b>On some A10 devices, you can programmatically assign an address. <br>If you so desire, please put your device into programming mode before clicking the <font color="red">Ok</font> button';
InsteonNLS.KEYPADLINC = 'KeypadLinc';
InsteonNLS.BUTTONS_GROUPING = 'Buttons Grouping';
InsteonNLS.MUTUALLY_EXCLUSIVE_BUTTONS = 'Mutually Exclusive Buttons';
InsteonNLS.BUTTON_TOGGLE = 'Buttons Toggle Mode';
InsteonNLS.BUTTON_BACKLIGHT = 'LED Brightness';
InsteonNLS.THERMOSTAT_HUMIDTY = 'Report Humidty';
InsteonNLS.PLM = 'Modem (PLM)';
InsteonNLS.TOGGLE_CONTROLLER_RESPONDER = 'Controller/Responder';
InsteonNLS.TOGGLE_BUTTON_TOGGLE = 'Toggle On/Off';
InsteonNLS.SET_TOGGLE_MODE = 'Set Button Toggle Mode';
InsteonNLS.TOGGLE_MODES = 'Button Toggle Modes';
InsteonNLS.ALL_TOGGLE_LABEL = 'All Toggle';
InsteonNLS.ALL_NON_TOGGLE_LABEL = 'All Non-Toggle';
InsteonNLS.SET_SCHEDULE = 'Schedule';
InsteonNLS.SET_OPTIONS = 'Options';
InsteonNLS.LOCAL_ONLY_LABEL = ' [Applied Locally]';
InsteonNLS.AUTO_DISCOVER_LABEL = 'Auto Discover';
InsteonNLS.CHOOSE_BRIDGE_TYPE = 'Choose INSTEON Bridge';
InsteonNLS.GET_PLM_STATUS = 'PLM Info/Status';
InsteonNLS.SHOW_PLM_LINKS = 'Show PLM Links Table';
InsteonNLS.SHOW_DEVICE_LINKS = 'Show Device Links Table';
InsteonNLS.SHOW_ISY_LINKS = 'Show ISY Links Table';
InsteonNLS.PLM_LINKS_TABLE = 'PLM Links Table';
InsteonNLS.DEVICE_LINKS_TABLE = 'Device Links Table';
InsteonNLS.ADVANCED_OPTIONS = 'Advanced Options';
InsteonNLS.SCENE_TEST = 'Scene Test';
InsteonNLS.ADVANCED_OPTIONS_ENGINE = 'Configure INSTEON Messaging:';
InsteonNLS.USE_I1_ONLY = '<html><b>i1 Only</b>: ISY uses i1 messaging option</html>';
InsteonNLS.CALBIRATE_ENGINE_VERSIONS = '<html><b>Automatic</b>: ISY tries to find the most suitable messaging option</html>';
InsteonNLS.DEVICE_REPORTED_VERSION = '<html><b>Device Reported</b>: ISY uses the device reported messaging option</html>';
InsteonNLS.ISY_LINK_TABLE = 'ISY Links Table';
InsteonNLS.DL_FROM_LINK = 'From Link';
InsteonNLS.DL_READ = 'Read ';
InsteonNLS.DL_LINKS = 'Links';
InsteonNLS.START_LINK_ADDRESS = 'Start Address';
InsteonNLS.END_LINK_ADDRESS = 'End Address';
InsteonNLS.SENSITIVITY_LEVEL = 'Darkness Sensitivity';
InsteonNLS.SENSING_MODE = '<html>Sensing mode:<br>As motion is sensed (checked)<br>Only after timeout (unchecked)</html>';
InsteonNLS.NIGHT_ONLY_MODE = '<html>Night mode:<br>Always (checked)<br>At night only (unchecked)</html>';
InsteonNLS.ON_ONLY_MODE = '<html>On only mode:<br>On/off commands (checked)<br>On commands only (unchecked)</html>';
InsteonNLS.NIGHT_ONLY_MODE_CHECKED = 'Night only mode';
InsteonNLS.ON_ONLY_MODE_CHECKED = 'On commands only';
InsteonNLS.PROGRAM_LOCK = 'Local programming lockout';
InsteonNLS.LED_ON_TX = 'LED on TX';
InsteonNLS.RELAY_FOLLOWS_INPUT = 'Relay Follows Input';
InsteonNLS.MOMENTARY_A = '<html>Momentary A: <font color="red">Triggered by either On or Off</font></html>';
InsteonNLS.LATCH = '<html>Latching: <font color="red">Continuous</font></html>';
InsteonNLS.MOMENTARY_BOTH = '<html>Momentary B: <font color="red">Triggered by both On and Off</font></html>';
InsteonNLS.MOMENTARY_LOOK_AT_SENSOR = '<html>Momentary C: <font color="red">Trigger based on sensor input</font></html>';
InsteonNLS.SEND_X10 = 'Send X10 Send On (or Off)';
InsteonNLS.TRIGGER_OFF = 'Trigger Reverse';
InsteonNLS.BEEP = 'Beep';
InsteonNLS.TIMER_ENABLED = 'Countdown Timer Enabled';
InsteonNLS.TRIGGER_GROUP_ON = 'Trigger Group';
InsteonNLS.LED_ON = 'LED On';
InsteonNLS.ONE_MIN_LOCAL_WARNING = '1 Minute Warning';
InsteonNLS.DEFAULT_TIMEOUT_VALUE = 'Default Timeout (min)';
InsteonNLS.BUTTON_GROUPING_WARNING = '<html><b><font color="red">WARNING:</font><br>It is highly recommended that button groupings are migrated/accomplished through <font color="red">Scenes</font> by adjusting respective <font color="red">On Levels</font>.<br>By doing so correct status of the buttons are also reflected in ISY regardless of their groupings.<br><font color="red">Note:</font> any changes made on this screen, and especially <font color="red">Reset</font> may irrecoverably corrupt any associated scenes!</b></html>';
InsteonNLS.ARE_YOU_SURE = '<br><br>Are you sure you would like to proceed with this operation?</b></html>';
InsteonNLS.SCENE_TEST_WARNING = '<html><b>Programs may impact the outcome of this test!<br/>Please ensure all programs are disabled before running this test.<br/><br/><font color="red">Note:</font> This test will turn the scene on and then off.<br/><br/>Would you like to proceed?</b></html>';
InsteonNLS.SAFE_MODE_MESSAGE = '<html><font color="red"><b>Your system is in Safe Mode!</b></font><br/><br/>This is normally caused when the system cannot communicate with the PLM.<br/>Please check the connections/wiring to the PLM and then reboot your system.<br/>If the problem persists, in all likelihood, the PLM is defective.</html>';
InsteonNLS.TRIGGER_THRESHOLD_WATTS = 'Trigger Threshold (Watts)';
InsteonNLS.HOLD_OFF_SECS = 'Holdoff (Secs)';
InsteonNLS.HYSTERESIS_WATTS = 'Hysteresis (Watts)';
InsteonNLS.MICRO_OPEN_CLOSE_MOMENTARY_TIMEOUT = 'Momentary Mode Timeout';
