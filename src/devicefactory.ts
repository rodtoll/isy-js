import { parseStringPromise } from 'xml2js';
import { format } from 'util';
import { ISYDevice } from './isy';
import ISYConstants from './isyconstants';
import {
	InsteonSwitchDevice,
	InsteonRelayDevice,
	InsteonOnOffOutletDevice,
	InsteonRelaySwitchDevice,
	InsteonKeypadDevice,
	InsteonDimmerKeypadDevice,
	InsteonDimmableDevice,
	InsteonDimmerSwitchDevice,
	InsteonFanDevice,
	InsteonDimmerOutletDevice,
	InsteonMotionSensorDevice,
	InsteonDoorWindowSensorDevice,
	InsteonLeakSensorDevice
} from './insteondevice';

export class DeviceFactory {
	public static LINK_MANAGEMENT_NAME: string = 'Link Management';

	public static LIGHT_NAME: string = 'Name';

	public static LIGHT_ADDRESS: string = 'Address';

	public static DEVICE_TYPE: string = 'Type';

	public static ON_LEVEL: string = 'On Level';

	public static OFF_LEVEL: string = 'Off Level';

	public static RAMP_RATE: string = 'Ramp Rate';

	public static STATUS: string = 'Current State';

	public static LIGHT_ON: string = 'On';

	public static LIGHT_OFF: string = 'Off';

	public static LIGHT_FAST_ON: string = 'Fast On';

	public static LIGHT_FAST_OFF: string = 'Fast Off';

	public static LIGHT_DIM: string = 'Dim';

	public static LIGHT_BRIGHTEN: string = 'Brighten';

	public static LIGHT_MOVE_UP: string = 'Move Up';

	public static LIGHT_MOVE_DOWN: string = 'Move Down';

	public static SETPOINT: string = 'Setpoint';

	public static HUMIDITY: string = 'Humidity';

	public static TEMPERATURE: string = 'Temperature';

	public static LOCK_DOOR: string = 'Lock';

	public static UNLOCK_DOOR: string = 'Unlock';

	public static LOCKED_DOOR: string = 'Locked';

	public static UNLOCKED_DOOR: string = 'Unlocked';

	public static ACCUMULATED_POWER: string = 'Accumulated Power';

	public static RESET: string = 'Reset';

	public static ADVANCED: string = 'Advanced';

	public static LED_BRIGHTNESS: string = 'LED Brightness';

	public static LOCKED_DOOR_ST: string = '<html><font color="RED">Locked</font></html>';

	public static UNLOCKED_DOOR_ST: string = '<html><font color="GREEN">Unlocked</font></html>';

	public static SCENE_UNSUPPORTED_VALUE: string = '(Unsupported Value)';

	public static SCENE_NO_RETRIES: string = 'No Retries';

	public static SCENE_ONE_RETRY: string = '  1 Retry';

	public static SCENE_N_RETRIES_SUFFIX: string = 'Retries';

	public static SCENE_ADVANCED_PROPERTIES: string = 'Show Advanced Properties';

	public static SCENE_DEVICE_COMMUNICATION_PROP: string = 'Device Communication';

	public static PLM_COMMUNICATIONS_MENU: string = 'PLM Communication';

	public static PLM_COMMUNICATIONS_TITLE: string = 'PLM Communication';

	public static PLM_COMMUNICATIONS_DESC: string = 'Communication to the PLM';

	public static FANLINC_OFF: string = 'Off';

	public static FANLINC_LOW: string = 'Low';

	public static FANLINC_MED: string = 'Med';

	public static FANLINC_HIGH: string = 'High';

	public static EZFLORA_ZONE_8_PUMP: string = 'Zone 8: Pump';

	public static EZFLORA_ZONE_8_NORMAL: string = 'Zone 8: Normal';

	public static RL2_LED_LABEL: string = 'LED';

	public static RL2_BEEP_LABEL: string = 'Beep';

	public static RL2_4_BUTTON_LABEL: string = '4-Scene';

	public static RL2_8_BUTTON_NON_TOG_LABEL: string = '8-Scene non-Toggle';

	public static RL2_8_BUTTON_TOG_LABEL: string = '8-Scene Toggle';

	public static RL2_1_BUTTON_LABEL: string = '1-Scene';

	public static RL2_2_BUTTON_NON_TOG_LABEL: string = '2-Scene non-Toggle';

	public static RL2_2_BUTTON_TOG_LABEL: string = '2-Scene Toggle';

	public static RL2_CHANGE_BUTTON_CONFIG_TITLE: string = 'Change Button Configuration';

	public static CLIMATE_INCREMENT_SETPOINT: string = 'Setpoint Up 1';

	public static CLIMATE_DECREMENT_SETPOINT: string = 'Setpoint Down 1';

	public static MASTER_CONTROLLER_LABEL: string = 'Controller';

	public static SLAVE_LABEL: string = 'Responder';

	public static SCENE_ATTRIBUTES: string = 'Scene Attributes';

	public static COPYING_SCENE_ATTRIBUTES: string = 'Copying Scene Attributes';

	public static GLOBALLY_CHANGE_SCENE_ATTRIBUTES: string = 'Apply Changes To All Devices';

	public static NODE_LABEL: string = 'INSTEON Device';

	public static A10_NODE_LABEL: string = 'INSTEON/A10/X10 Device';

	public static LINK_SENSOR_LABEL: string = 'Link a Sensor';

	public static LINK_HIDDEN_DOOR_SENSOR_LABEL: string = 'Hidden Door Sensor';

	public static LINK_OPEN_CLOSE_SENSOR_LABEL: string = 'Open/Close Sensor';

	public static LINK_LEAK_SENSOR_LABEL: string = 'Leak Sensor';

	public static LINK_MOTION_SENSOR_LABEL: string = 'Motion Sensor';

	public static LINK_MOTION_SENSOR_II_LABEL: string = 'Motion Sensor II';

	public static LINK_REMOTELINC2_LABEL: string = 'Link a RemoteLinc 2';

	public static LINK_REMOTELINC2_SWITCH_SUBLABEL: string = 'Switch';

	public static LINK_REMOTELINC2_4SCENE_SUBLABEL: string = '4-Scene Keypad';

	public static LINK_REMOTELINC2_8SCENE_SUBLABEL: string = '8-Scene Keypad';

	public static LINK_CONTROLINC_LABEL: string = 'Link a ControLinc';

	public static LINK_REMOTELINC_LABEL: string = 'Link a RemoteLinc';

	public static LINK_IRLINC_RX_LABEL: string = 'Add Button to IRLinc Receiver';

	public static LINK_IRLINC_TX_LABEL: string = 'Add Button to IRLinc Transmitter';

	public static LINK_EZSNSRF_LABEL: string = 'Add Sensor to EZSnSRF';

	public static LINK_EZX10RF_LABEL: string = 'Add X10 Device to EZX10RF';

	public static KEYPADLINC: string = 'KeypadLinc';

	public static BUTTONS_GROUPING: string = 'Buttons Grouping';

	public static MUTUALLY_EXCLUSIVE_BUTTONS: string = 'Mutually Exclusive Buttons';

	public static BUTTON_TOGGLE: string = 'Buttons Toggle Mode';

	public static BUTTON_BACKLIGHT: string = 'LED Brightness';

	public static THERMOSTAT_HUMIDTY: string = 'Report Humidty';

	public static PLM: string = 'Modem (PLM)';

	public static TOGGLE_CONTROLLER_RESPONDER: string = 'Controller/Responder';

	public static TOGGLE_BUTTON_TOGGLE: string = 'Toggle On/Off';

	public static SET_TOGGLE_MODE: string = 'Set Button Toggle Mode';

	public static TOGGLE_MODES: string = 'Button Toggle Modes';

	public static ALL_TOGGLE_LABEL: string = 'All Toggle';

	public static ALL_NON_TOGGLE_LABEL: string = 'All Non-Toggle';

	public static SET_SCHEDULE: string = 'Schedule';

	public static SET_OPTIONS: string = 'Options';

	public static LOCAL_ONLY_LABEL: string = ' [Applied Locally]';

	public static AUTO_DISCOVER_LABEL: string = 'Auto Discover';

	public static CHOOSE_BRIDGE_TYPE: string = 'Choose INSTEON Bridge';

	public static GET_PLM_STATUS: string = 'PLM Info/Status';

	public static SHOW_PLM_LINKS: string = 'Show PLM Links Table';

	public static SHOW_DEVICE_LINKS: string = 'Show Device Links Table';

	public static SHOW_ISY_LINKS: string = 'Show ISY Links Table';

	public static PLM_LINKS_TABLE: string = 'PLM Links Table';

	public static DEVICE_LINKS_TABLE: string = 'Device Links Table';

	public static ADVANCED_OPTIONS: string = 'Advanced Options';

	public static SCENE_TEST: string = 'Scene Test';

	public static ADVANCED_OPTIONS_ENGINE: string = 'Configure INSTEON Messaging:';

	public static USE_I1_ONLY: string = '<html><b>i1 Only</b>: ISY uses i1 messaging option</html>';

	public static CALBIRATE_ENGINE_VERSIONS: string = '<html><b>Automatic</b>: ISY tries to find the most suitable messaging option</html>';

	public static DEVICE_REPORTED_VERSION: string = '<html><b>Device Reported</b>: ISY uses the device reported messaging option</html>';

	public static ISY_LINK_TABLE: string = 'ISY Links Table';

	public static DL_FROM_LINK: string = 'From Link';

	public static DL_READ: string = 'Read ';

	public static DL_LINKS: string = 'Links';

	public static START_LINK_ADDRESS: string = 'Start Address';

	public static END_LINK_ADDRESS: string = 'End Address';

	public static SENSITIVITY_LEVEL: string = 'Darkness Sensitivity';

	public static SENSING_MODE: string = '<html>Sensing mode:<br>As motion is sensed (checked)<br>Only after timeout (unchecked)</html>';

	public static NIGHT_ONLY_MODE: string = '<html>Night mode:<br>Always (checked)<br>At night only (unchecked)</html>';

	public static ON_ONLY_MODE: string = '<html>On only mode:<br>On/off commands (checked)<br>On commands only (unchecked)</html>';

	public static NIGHT_ONLY_MODE_CHECKED: string = 'Night only mode';

	public static ON_ONLY_MODE_CHECKED: string = 'On commands only';

	public static PROGRAM_LOCK: string = 'Local programming lockout';

	public static LED_ON_TX: string = 'LED on TX';

	public static RELAY_FOLLOWS_INPUT: string = 'Relay Follows Input';

	public static MOMENTARY_A: string = '<html>Momentary A: <font color="red">Triggered by either On or Off</font></html>';

	public static LATCH: string = '<html>Latching: <font color="red">Continuous</font></html>';

	public static MOMENTARY_BOTH: string = '<html>Momentary B: <font color="red">Triggered by both On and Off</font></html>';

	public static MOMENTARY_LOOK_AT_SENSOR: string = '<html>Momentary C: <font color="red">Trigger based on sensor input</font></html>';

	public static SEND_X10: string = 'Send X10 Send On (or Off)';

	public static TRIGGER_OFF: string = 'Trigger Reverse';

	public static BEEP: string = 'Beep';

	public static TIMER_ENABLED: string = 'Countdown Timer Enabled';

	public static TRIGGER_GROUP_ON: string = 'Trigger Group';

	public static LED_ON: string = 'LED On';

	public static ONE_MIN_LOCAL_WARNING: string = '1 Minute Warning';

	public static DEFAULT_TIMEOUT_VALUE: string = 'Default Timeout (min)';

	public static TRIGGER_THRESHOLD_WATTS: string = 'Trigger Threshold (Watts)';

	public static HOLD_OFF_SECS: string = 'Holdoff (Secs)';

	public static HYSTERESIS_WATTS: string = 'Hysteresis (Watts)';

	public static MICRO_OPEN_CLOSE_MOMENTARY_TIMEOUT: string = 'Momentary Mode Timeout';

	public static getDeviceDetails(family: number, typeCode: string): { name: string; modelNumber: string; version: string; class: typeof ISYDevice } {
		if (family ?? ISYConstants.Families.Insteon === ISYConstants.Families.Insteon) {
			return this.getInsteonDeviceDetails(typeCode);
		} else return null;
	}

	public static getInsteonDeviceDetails(typeCode: string): { name: string; modelNumber: string; version: string; class: typeof ISYDevice } {
		const typeArray = typeCode.split('.');
		const category = Number(typeArray[0]);
		const device = Number(typeArray[1]);
		const version = Number(typeArray[2]);
		let str = null;
		if (category === 0o000) {
			str = DeviceFactory.getNLSControllerInfo(device);
		} else if (category === 0o001) {
			str = DeviceFactory.getNLSDimLightInfo(device);
		} else if (category === 0o002) {
			str = DeviceFactory.getNLSSwitchLightInfo(device);
		} else if (category === 0o003) {
			str = DeviceFactory.getNLSNetworkBridgeInfo(device);
		} else if (category === 0o005) {
			str = DeviceFactory.getNLSClimateControlInfo(device);
		} else if (category === 0o004) {
			str = DeviceFactory.getNLSIrrigationControlInfo(device);
		} else if (category === 0o007) {
			str = DeviceFactory.getNLSIOControlInfo(device);
		} else if (category === 0o017) {
			str = DeviceFactory.getNLSAccessControlInfo(device);
		} else if (category === 0o020) {
			str = DeviceFactory.getNLSSHS(device);
		} else if (category === 0o011) {
			str = DeviceFactory.getNLSEnergyManagement(device);
		} else if (category === 0o016) {
			str = DeviceFactory.getNLSWindowsCovering(device);
		}

		str.version = version.toString(16);

		// str = str + version.toString(16);

		return str;
	}

	static getNLSNetworkBridgeInfo(device: number) {
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

	static getNLSIrrigationControlInfo(device: number) {
		const c = String.fromCharCode(device);
		return c === String.fromCharCode(0o000) ? 'EZRain/EZFlora Irrigation Controller' : null;
	}

	static getNLSSwitchLightInfo(device: number): { name: string; modelNumber: string; version: string; class: typeof ISYDevice } {
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
				retVal = { name: 'OutletLinc', modelNumber: '2473', class: InsteonOnOffOutletDevice };
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
				retVal = { name: 'KeypadLinc Relay', modelNumber: '2486S/WH6-SP', class: InsteonDimmerKeypadDevice };
				break;
			case '!':
				retVal = { name: 'OutletLinc', modelNumber: '2473-SP', class: InsteonOnOffOutletDevice };
				break;
			case '#':
				retVal = { name: 'SwitchLinc Relay - Remote Control On/Off Switch', modelNumber: '2476S-SP', class: InsteonRelaySwitchDevice };
				break;
			case '"':
				retVal = { name: 'In-LineLinc Relay', modelNumber: '2475S-SP', class: InsteonRelaySwitchDevice };
				break;
			case String.fromCharCode(0o036):
				break;
			case ',':
				retVal = { name: 'Dual Band KeypadLinc Relay', modelNumber: '2487S', class: InsteonKeypadDevice };
				break;
			case String.fromCharCode(0o037):
				retVal = { name: 'Dual Band InlineLinc On/Off Switch', modelNumber: '2475SDB', class: InsteonRelaySwitchDevice };
				break;
			case '*':
				retVal = { name: 'Dual Band SwitchLinc On/Off Switch', modelNumber: '2477S', class: InsteonRelaySwitchDevice };
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
		if (retVal.class === undefined) retVal.class = InsteonRelayDevice;
		return retVal;
	}

	private static getNLSDimLightInfo(device: number) {
		const c = String.fromCharCode(device);
		let retVal = null;
		switch (c) {
			case String.fromCharCode(0o000):
				retVal = { name: 'LampLinc', modelNumber: '2456D3' };
				break;
			case String.fromCharCode(0o001):
				retVal = { name: 'SwitchLinc Dimmer', modelNumber: '2476D', class: InsteonDimmerSwitchDevice };
				break;
			case String.fromCharCode(0o002):
				retVal = { name: 'In-LineLinc Dimmable', modelNumber: '2475D' };
				break;
			case String.fromCharCode(0o003):
				retVal = { name: 'Icon Switch Dimmer', modelNumber: '2876D3' };
				break;
			case String.fromCharCode(0o004):
				retVal = { name: 'SwitchLinc Dimmer', modelNumber: '2476DH', class: InsteonDimmerSwitchDevice };
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
				retVal = { name: 'ToggleLinc Dimmer', modelNumber: '2466D', class: InsteonDimmerSwitchDevice };
				break;
			case String.fromCharCode(0o030):
				retVal = { name: 'Companion Dimmer', modelNumber: '2474D' };
				break;
			case String.fromCharCode(0o032):
				retVal = { name: 'InlineLinc Dimmer', modelNumber: '2475D', class: InsteonDimmerSwitchDevice };
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
				retVal = { name: 'SwitchLinc Dimmer 1000W', modelNumber: '2476DH', class: InsteonDimmerSwitchDevice };
				break;
			case '"':
				retVal = { name: 'LampLinc 2-Pin Dimmer', modelNumber: '2457D2X' };
				break;
			case 'U':
				retVal = { name: 'Dual Band Switchlinc Dimmer', modelNumber: '2432-622', class: InsteonDimmerSwitchDevice };
				break;
			case ' ':
				retVal = { name: 'Dual Band SwitchLinc Dimmer', modelNumber: '2477D', class: InsteonDimmerSwitchDevice };
				break;
			case '1':
				retVal = { name: 'Dual Band SwitchLinc Dimmer (240V)', modelNumber: '2478D', class: InsteonDimmerSwitchDevice };
				break;
			case '-':
				retVal = { name: 'Dual Band SwitchLinc Dimmer', modelNumber: '2477DH', class: InsteonDimmerSwitchDevice };
				break;
			case "'":
				retVal = { name: 'Dual Band SwitchLinc Dimmer', modelNumber: '2477D-SP', class: InsteonDimmerSwitchDevice };
				break;
			case '+':
				retVal = { name: 'Dual Band SwitchLinc Dimmer', modelNumber: '2477DH-SP', class: InsteonDimmerSwitchDevice };
				break;
			case ')':
				retVal = { name: 'KeypadLinc Dimmer 8 Buttons', modelNumber: '2486D-SP', class: InsteonDimmerSwitchDevice };
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
				retVal = { name: 'FanLinc', modelNumber: '2475F', class: InsteonFanDevice };
				break;
			case '!':
				retVal = { name: 'Dual Band OutletLinc Dimmer', modelNumber: '2472D', class: InsteonDimmerOutletDevice };
				break;
			case '0':
				retVal = { name: 'SwitchLinc Dimmer', modelNumber: '2476D', class: InsteonDimmerSwitchDevice };
				break;
			case '$':
				retVal = { name: 'SwitchLinc Dimmer 2-Wire', modelNumber: '2474DWH', class: InsteonDimmerSwitchDevice };
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
		if (retVal.class === undefined) retVal.class = InsteonDimmableDevice;
		return retVal;
	}

	private static getNLSControllerInfo(device: number) {
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

	private static getNLSIOControlInfo(device: number) {
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

	private static getNLSSHS(device: number) {
		const c = String.fromCharCode(device);
		let retVal = null;
		switch (c) {
			case String.fromCharCode(0o001):
				retVal = { name: 'INSTEON Motion Sensor', modelNumber: '2842-222', class: InsteonMotionSensorDevice };
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
				retVal = { name: 'Open/Close Sensor', modelNumber: '2843-222', class: InsteonDoorWindowSensorDevice };
				break;
			case String.fromCharCode(0o006):
				retVal = { name: 'Open/Close Sensor', modelNumber: '2843-422', class: InsteonDoorWindowSensorDevice };
				break;
			case String.fromCharCode(0o007):
				break;
			case String.fromCharCode(0o031):
				retVal = { name: 'Open/Close Sensor', modelNumber: '2843-522', class: InsteonDoorWindowSensorDevice };
				break;
			case '\b':
				retVal = { name: 'Leak Sensor', modelNumber: '2852-222', class: InsteonLeakSensorDevice };
				break;
			case '\r':
				retVal = { name: 'Leak Sensor', modelNumber: '2852-422', class: InsteonLeakSensorDevice };
				break;
			case String.fromCharCode(0o016):
				break;
			case String.fromCharCode(0o032):
				retVal = { name: 'Leak Sensor', modelNumber: '2852-522', class: InsteonLeakSensorDevice };
				break;
			case '\n':
				return 'INSTEON Smoke Sensor';
				break;
			case String.fromCharCode(0o021):
				retVal = { name: 'INSTEON Hidden Door Sensor', modelNumber: '2845-222', class: InsteonDoorWindowSensorDevice };
				break;
			case String.fromCharCode(0o024):
				retVal = { name: 'INSTEON Hidden Door Sensor', modelNumber: '2845-422', class: InsteonDoorWindowSensorDevice };
				break;
			case String.fromCharCode(0o025):
				break;
			case String.fromCharCode(0o033):
				retVal = { name: 'INSTEON Hidden Door Sensor', modelNumber: '2845-522', class: InsteonDoorWindowSensorDevice };
				break;
			case String.fromCharCode(0o026):
				retVal = { name: 'Insteon Motion Sensor II', modelNumber: '2844-222', class: InsteonMotionSensorDevice };
				break;
			case String.fromCharCode(0o030):
				retVal = { name: 'Insteon Motion Sensor II', modelNumber: '2844-522', class: InsteonMotionSensorDevice };
		}
		return retVal;
	}

	private static getNLSClimateControlInfo(device: number) {
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

	private static getNLSAccessControlInfo(device: number) {
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

	private static getNLSEnergyManagement(device: number) {
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

	private static getNLSWindowsCovering(device: number) {
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
