import { parseStringPromise } from 'xml2js';
import { format } from 'util';


export class InsteonNLS {
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

		public static DOOR_SENSOR_PROGRAMMING_MODE_ENTRY: string = '<b>Door Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on the side of the Door Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br>';

		public static OPEN_CLOSE_SENSOR_PROGRAMMING_MODE_ENTRY: string = '<b>Open/Close Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button inside the Open/Close Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br>';

		public static LEAK_SENSOR_PROGRAMMING_MODE_ENTRY: string = '<b>Leak Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on top of the Leak Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br>';

		public static REMOTELINC2_PROGRAMMING_MODE_ENTRY: string = '<b>RemoteLinc 2<br>&nbsp; &nbsp; Ensure the on/off switch is in the On position.<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button at the base of the RemoteLinc2<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br>';

		public static REMOTELINC_PROGRAMMING_MODE_ENTRY: string = '<b>RemoteLinc<br>&nbsp; &nbsp; Simultaneously press and hold the <font color="red">Dim & Bright</font> buttons on the RemoteLinc<br>&nbsp; &nbsp; until the LED starts flashing (takes about 10 seconds)</b><br>';

		public static MOTION_SENSOR_PROGRAMMING_MODE_ENTRY: string = '<b>Motion Sensor or Open/Close Sensor<br>&nbsp; &nbsp; Click and hold the <font color="red">Set</font> button until the light starts flashing (takes about 5 seconds)</b><br>';

		public static DOOR_SENSOR_PROGRAMMING_MODE: string = '<html><b>Your Door Sensor needs to be put into communications mode<br>to complete this operation.</b><br><br><b>Door Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on the side of the Door Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Click <font color="red">Ok</font> when complete</html>';

		public static OPEN_CLOSE_SENSOR_PROGRAMMING_MODE: string = '<html><b>Your Open/Close Sensor needs to be put into communications mode<br>to complete this operation.</b><br><br><b>Open/Close Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button inside the Open/Close Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Click <font color="red">Ok</font> when complete</html>';

		public static LEAK_SENSOR_PROGRAMMING_MODE: string = '<html><b>Your Leak Sensor needs to be put into communications mode<br>to complete this operation.</b><br><br><b>Leak Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on top of the Leak Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Click <font color="red">Ok</font> when complete</html>';

		public static REMOTELINC2_PROGRAMMING_MODE: string = '<html><b>Your RemoteLinc2 needs to be put into communications mode<br>to complete this operation.</b><br><br><b>RemoteLinc 2<br>&nbsp; &nbsp; Ensure the on/off switch is in the On position.<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button at the base of the RemoteLinc2<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Click <font color="red">Ok</font> when complete</html>';

		public static REMOTELINC_PROGRAMMING_MODE: string = '<html><b>Your RemoteLinc needs to be put into communications mode<br>to complete this operation.</b><br><br><b>RemoteLinc<br>&nbsp; &nbsp; Simultaneously press and hold the <font color="red">Dim & Bright</font> buttons on the RemoteLinc<br>&nbsp; &nbsp; until the LED starts flashing (takes about 10 seconds)</b><br><br><b>Click <font color="red">Ok</font> when complete</html>';

		public static MOTIONSENSOR_PROGRAMMING_MODE: string = '<html><b>Your Motion Sensor or Open/Close Sensor needs to be put into communications mode<br>to complete this operation.</b><br><br><b>Motion Sensor or Open/Close Sensor<br>&nbsp; &nbsp; Click and hold the <font color="red">Set</font> button until the light starts flashing (takes about 5 seconds)</b><br><br><b>Click <font color="red">Ok</font> when complete</html>';

		public static BATTERY_POWERED_PROGRAMMING_INSTRUCTIONS: string = '<b>Door Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on the side of the Door Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Open/Close Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button inside the Open/Close Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Leak Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on top of the Leak Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>RemoteLinc 2<br>&nbsp; &nbsp; Ensure the on/off switch is in the On position.<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button at the base of the RemoteLinc2<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>RemoteLinc<br>&nbsp; &nbsp; Simultaneously press and hold the <font color="red">Dim & Bright</font> buttons on the RemoteLinc<br>&nbsp; &nbsp; until the LED starts flashing (takes about 10 seconds)</b><br><br><b>Motion Sensor or Open/Close Sensor<br>&nbsp; &nbsp; Click and hold the <font color="red">Set</font> button until the light starts flashing (takes about 5 seconds)</b><br><br>';

		public static BATTERY_POWERED_PROGRAMMING_MODE: string = '<html><b>One or more of your battery powered devices need to be put in communications mode<br>to complete this operation.</b><br><br><b>Door Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on the side of the Door Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Open/Close Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button inside the Open/Close Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>Leak Sensor<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button on top of the Leak Sensor<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>RemoteLinc 2<br>&nbsp; &nbsp; Ensure the on/off switch is in the On position.<br>&nbsp; &nbsp; Press and hold the <font color="red">Set</font> Button at the base of the RemoteLinc2<br>&nbsp; &nbsp; until the LED starts flashing green (takes about 3 seconds)</b><br><br><b>RemoteLinc<br>&nbsp; &nbsp; Simultaneously press and hold the <font color="red">Dim & Bright</font> buttons on the RemoteLinc<br>&nbsp; &nbsp; until the LED starts flashing (takes about 10 seconds)</b><br><br><b>Motion Sensor or Open/Close Sensor<br>&nbsp; &nbsp; Click and hold the <font color="red">Set</font> button until the light starts flashing (takes about 5 seconds)</b><br><br><b>Click <font color="red">Ok</font> when complete</html>';

		public static A10_DEVICE_ADD_MESSAGE: string = '<html><b>On some A10 devices, you can programmatically assign an address. <br>If you so desire, please put your device into programming mode before clicking the <font color="red">Ok</font> button';

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

		public static BUTTON_GROUPING_WARNING: string = '<html><b><font color="red">WARNING:</font><br>It is highly recommended that button groupings are migrated/accomplished through <font color="red">Scenes</font> by adjusting respective <font color="red">On Levels</font>.<br>By doing so correct status of the buttons are also reflected in ISY regardless of their groupings.<br><font color="red">Note:</font> any changes made on this screen, and especially <font color="red">Reset</font> may irrecoverably corrupt any associated scenes!</b></html>';

		public static ARE_YOU_SURE: string = '<br><br>Are you sure you would like to proceed with this operation?</b></html>';

		public static SCENE_TEST_WARNING = '<html><b>Programs may impact the outcome of this test!<br/>Please ensure all programs are disabled before running this test.<br/><br/><font color="red">Note:</font> This test will turn the scene on and then off.<br/><br/>Would you like to proceed?</b></html>';

		public static SAFE_MODE_MESSAGE = '<html><font color="red"><b>Your system is in Safe Mode!</b></font><br/><br/>This is normally caused when the system cannot communicate with the PLM.<br/>Please check the connections/wiring to the PLM and then reboot your system.<br/>If the problem persists, in all likelihood, the PLM is defective.</html>';

		public static TRIGGER_THRESHOLD_WATTS: string = 'Trigger Threshold (Watts)';

		public static HOLD_OFF_SECS: string = 'Holdoff (Secs)';

		public static HYSTERESIS_WATTS: string = 'Hysteresis (Watts)';

		public static MICRO_OPEN_CLOSE_MOMENTARY_TIMEOUT: string = 'Momentary Mode Timeout';




		public static getDeviceDescription(paramString: string) {

				let c = paramString.charAt(0);
				let str = null;
				if (c == '\000') {
						str = InsteonNLS.getNLSControllerInfo(paramString);
				} else if (c == '\001') {
						str = InsteonNLS.getNLSDimLightInfo(paramString);
				} else if (c == '\002') {
						str = InsteonNLS.getNLSSwitchLightInfo(paramString);
				} else if (c == '\003') {
						str = InsteonNLS.getNLSNetworkBridgeInfo(paramString);
				} else if (c == '\005') {
						str = InsteonNLS.getNLSClimateControlInfo(paramString);
				} else if (c == '\004') {
						str = InsteonNLS.getNLSIrrigationControlInfo(paramString);
				} else if (c == '\007') {
						str = InsteonNLS.getNLSIOControlInfo(paramString);
				} else if (c == '\017') {
						str = InsteonNLS.getNLSAccessControlInfo(paramString);
				} else if (c == '\020') {
						str = InsteonNLS.getNLSSHS(paramString);
				} else if (c == '\t') {
						str = InsteonNLS.getNLSEnergyManagement(paramString);
				} else if (c == '\016') {
						str = InsteonNLS.getNLSWindowsCovering(paramString);
				}

				if (paramString.length > 2) {
						str.append(' v.');
						str.append(format('%02X',
								Number.parseInt(paramString.charAt(2))
						));
				}
				return str;
		}



		static getNLSNetworkBridgeInfo(paramString: string) {
				const c = paramString.charAt(1);
				switch (c) {
						case '\001':
								return '(2414S) PowerLinc Serial'
						case '\002':
								return '(2414U) PowerLinc USB'
						case '\003':
								return '(2814S) Icon PowerLinc Serial'
						case '\004':
								return '(2814U) Icon PowerLinc USB'
						case '\005':
								return '(2412S) PowerLine Modem'
						case '\006':
								return '(2411R) IRLinc Receiver'
						case '\007':
								return '(2411T) IRLinc Transmitter'
						case '\013':
								return '(2412U) PowerLine Modem USB'
						case '\r':
								return 'EZX10-RF'
						case '\017':
								return 'EZX10-IR'
						case 'O':
								return '(12237DB) PowerLine Modem'
				}
				return null;
		}

		static getNLSIrrigationControlInfo(paramString: string) {
				const c = paramString.charAt(1);
				return (c == '\000') ? 'EZRain/EZFlora Irrigation Controller' : null;
		}

		static getNLSSwitchLightInfo(paramString: string) {
				const c = paramString.charAt(1);
				switch (c) {
						case '\006':
								return '(2456S3E) ApplianceLinc - Outdoor Plugin Module'
						case '\007':
								return '(2456S3T) TimerLinc'
						case '\t':
								return '(2456S3) ApplianceLinc'
						case '\n':
								return '(2476ST) SwitchLinc Relay'
						case '\013':
								return '(2876S) Icon On/Off Switch'
						case '\f':
								return '(2856S3) Icon Appliance Adapter'
						case '\r':
						case '\032':
								return '(2466S) ToggleLinc Relay'
						case '\016':
						case ')':
								return '(2476ST) SwitchLinc Relay Timer'
						case '\021':
								return 'EZSwitch30'
						case '\017':
								return '(2486S/WH6) KeypadLinc Relay'
						case '\005':
								return '(2486S/WH8) KeypadLinc Relay (8 buttons)'
						case '\020':
								return '(2475S) In-LineLinc Relay'
						case '\024':
								return '(B2475S) In-LineLinc Relay W/ Sense'
						case '\023':
								return 'Icon SwitchLinc Relay for Bell Canada'
						case '\b':
								return '(2473) OutletLinc'
						case '\022':
								return '(2474S) Companion Switch'
						case '\025':
								return '(2476S) SwitchLinc Relay W/ Sense'
						case '\027':
								return '(2856S3B) Icon Relay 3-Pin'
						case '\026':
								return '(2876SB)  Icon Relay Switch'
						case '\030':
								return '(2494S220) SwitchLinc Relay 220 V.'
						case '\031':
								return '(2494S220) SwitchLinc Relay 220 V. w/Beeper'
						case '\034':
								return '(2476S) SwitchLinc Relay - Remote Control On/Off Switch'
						case '%':
								return '(2484S/WH8) KeypadLinc Timer Relay (8 buttons)'
						case ' ':
								return '(2486S/WH6-SP) KeypadLinc Relay'
						case '!':
								return '(2473-SP) OutletLinc'
						case '#':
								return '(2476S-SP) SwitchLinc Relay - Remote Control On/Off Switch'
						case '"':
								return '(2475S-SP) In-LineLinc Relay'
						case '\036':
						case ',':
								return '(2487S) Dual Band KeypadLinc Relay'
						case '\037':
								return '(2475SDB) Dual Band InlineLinc On/Off Switch'
						case '*':
								return '(2477S) Dual Band SwitchLinc On/Off Switch'
						case '/':
								return '(2443-222) Micro Module On/Off'
						case '1':
								return '(2443-422) Micro Module On/Off'
						case '2':
						case '<':
								return '(2443-522) Micro Module On/Off'
						case '.':
								return '(2453-222) Din Rail Relay'
						case '3':
								return '(2453-422) Din Rail Relay'
						case '4':
						case '=':
								return '(2453-522) Din Rail Relay'
						case '7':
								return '(2635-222) On/Off Module'
						case '8':
								return '(2634-222) On/Off Outdoor Module'
						case '9':
								return '(2663-222) On/Off Outlet'
						case '-':
								return '(2633-422) Plugin Relay'
						case '0':
								return '(2633-432) Plugin Relay'
						case '5':
								return '(2633-442) Plugin Relay'
						case '6':
								return '(2633-522) Plugin Relay'
				}
				return null;
		}

		private static getNLSDimLightInfo(paramString: string) {
				const c = paramString.charAt(1);
				switch (c) {
						case '\000':
								return '(2456D3) LampLinc'
						case '\001':
								return '(2476D) SwitchLinc Dimmer'
						case '\002':
								return '(2475D) In-LineLinc Dimmable'
						case '\003':
								return '(2876D3) Icon Switch Dimmer'
						case '\004':
								return '(2476DH) SwitchLinc Dimmer'
						case '\006':
								return '(2456D2) LampLinc 2 Pin'
						case '\t':
								return '(2486D) KeypadLinc Dimmer'
						case '\007':
								return '(2856D2) Icon LampLinc 2 Pin'
						case '\n':
								return '(2886D) Icon In-Wall Controller'
						case '\r':
								return '(2454D) SocketLinc'
						case '\f':
								return '(2486DWH8) KeypadLinc Dimmer 8 Button'
						case '\023':
								return 'Icon SwitchLinc Dimmer for Bell Canada'
						case '\027':
						case '\037':
								return '(2466D) ToggleLinc Dimmer'
						case '\030':
								return '(2474D) Companion Dimmer'
						case '\032':
								return '(2475D) InlineLinc Dimmer'
						case '\005':
								return '(2484DWH8) KeypadLinc Countdown Timer'
						case '\033':
								return '(2486D) KeypadLinc Dimmer 6 Buttons'
						case '\034':
								return '(2486D) KeypadLinc Dimmer 8 Buttons'
						case '\031':
								return '(2476D) SwitchLinc Dimmer W/Beeper'
						case '\016':
								return '(B2457D2) LampLinc BiPhy'
						case '\036':
								return '(2876DB) Icon Dimmer'
						case '\035':
								return '(2476DH) SwitchLinc Dimmer 1000W'
						case '"':
								return '(2457D2X) LampLinc 2-Pin Dimmer'
						case 'U':
								return '(2432-622) Dual Band Switchlinc Dimmer'
						case ' ':
								return '(2477D) Dual Band SwitchLinc Dimmer'
						case '1':
								return '(2478D) Dual Band SwitchLinc Dimmer (240V)'
						case '-':
								return '(2477DH) Dual Band SwitchLinc Dimmer'
						case '\'':
								return '(2477D-SP) Dual Band SwitchLinc Dimmer'
						case '+':
								return '(2477DH-SP) Dual Band SwitchLinc Dimmer'
						case ')':
								return '(2486D-SP) KeypadLinc Dimmer 8 Buttons'
						case '*':
								return '(2457D2X-SP) LampLinc 2-Pin Dimmer'
						case ',':
								return '(2475D-SP) InlineLinc Dimmer'
						case '%':
								return '(2475DA2) Ballast Dimmer'
						case '=':
								return '(2446-422) Ballast Dimmer'
						case '>':
								return '(2446-522) Ballast Dimmer'
						case '.':
								return '(2475F) FanLinc'
						case '!':
								return '(2472D) Dual Band OutletLinc Dimmer'
						case '0':
								return '(2476D) SwitchLinc Dimmer'
						case '$':
								return '(2474DWH) SwitchLinc Dimmer 2-Wire'
						case '2':
								return '(2475DA1) InLineLinc Dimmer'
						case ':':
								return '(2672-222) Insteon LED Bulb 8 Watt (60W)'
						case 'I':
								return '(2674-222) Insteon LED Bulb PAR38 12 Watt'
						case '5':
								return '(2442-222) Micro Module Dimmer'
						case '8':
								return '(2442-422) Micro Module Dimmer'
						case '9':
						case 'S':
								return '(2442-522) Micro Module Dimmer'
						case '4':
								return '(2452-222) Din Rail Dimmer'
						case '6':
								return '(2452-422) Din Rail Dimmer'
						case '7':
						case 'T':
								return '(2452-522) Din Rail Dimmer'
						case 'B':
								return '(2334-2) KeypadLinc Dimmer 5 Buttons'
						case 'A':
								return '(2334-2) KeypadLinc Dimmer 8 Buttons'
						case 'V':
								return '(2334-632) KeypadLinc Dimmer 6 Buttons'
						case '\013':
								return '(2632-422) Plugin Dimmer'
						case '\017':
								return '(2632-432) Plugin Dimmer'
						case '\021':
								return '(2632-442) Plugin Dimmer'
						case 'P':
								return '(2632-452) Plugin Dimmer'
						case '\022':
								return '(2632-522) Plugin Dimmer'
				}
				return null;
		}

		private static getNLSControllerInfo(paramString: string) {
				const c = paramString.charAt(1);
				switch (c) {
						case '\000':
								return '(2430) ControLinc'
						case '\005':
								return '(2440) RemoteLinc'
						case '\016':
								return '(2440EZ) RemoteLinc EZ'
						case '\006':
								return '(2830) Icon Tabletop'
						case '\t':
								return '(2442) SignaLinc'
						case '\021':
								return '(2342-242) RemoteLinc 2 Switch'
						case '\020':
								return '(2342-232) RemoteLinc 2 Keypad, 4 Scene'
						case '\022':
								return '(2342-222) RemoteLinc 2 Keypad, 8 Scene'
						case '\024':
								return '(2342-432) Mini Remote Keypad, 4 Scene'
						case '\025':
								return '(2342-442) Mini Remote Switch'
						case '\026':
								return '(2342-422) Mini Remote Keypad, 8 Scene'
						case '\027':
								return '(2342-532) Mini Remote Keypad, 4 Scene'
						case '\030':
								return '(2342-522) Mini Remote Keypad, 8 Scene'
						case '\031':
								return '(2342-542) Mini Remote Switch'
						case '\032':
								return '(2342-222) Mini Remote Keypad, 8 Scene'
						case '\033':
								return '(2342-232) Mini Remote Keypad, 4 Scene'
						case '\034':
								return '(2342-242) Mini Remote Switch'
				}
				return null;
		}

		private static getNLSIOControlInfo(paramString: string) {
				const c = paramString.charAt(1);
				switch (c) {
						case '\000':
								return '(2450) IOLinc'
						case '\003':
								return 'Compacta EZIO 2x4: INSTEON I/O Controller'
						case '\004':
								return 'Compacta EZIO8SA: INSTEON I/O Controller'
						case '\002':
								return 'Compacta EZIO8T: INSTEON I/O Controller'
						case '\005':
								return 'Compacta EZSnSRF'
						case '\006':
								return 'Compacta EZSnSRF Interface'
						case '\007':
								return 'Compacta EZIO6I'
						case '\b':
								return 'Compacta EZIO4O'
						case '\t':
								return '(2423A5) SynchroLinc'
						case '\r':
								return '(2450) IOLinc (Refurbished)'
						case '\016':
								return '(2248-222) I/O Module'
						case '\017':
								return '(2248-422) I/O Module'
						case '\020':
								return '(2248-442) I/O Module'
						case '\021':
								return '(2248-522) I/O Module'
						case '\022':
								return '(2822-222) IOLinc'
						case '\023':
								return '(2822-422) IOLinc'
						case '\024':
								return '(2822-442) IOLinc'
						case '\025':
								return '(2822-522) IOLinc'
						case '\026':
								return '(2822-222) Contact Closure'
						case '\027':
								return '(2822-422) Contact Closure'
						case '\030':
								return '(2822-442) Contact Closure'
						case '\031':
								return '(2822-522) Contact Closure'
						case '\032':
								return '(2867-222) Alert Module'
						case '\036':
								return '(2868-222) Siren'
						case ' ':
								return '(2868-622) Siren'
				}
				return null;
		}

		private static getNLSSHS(paramString: string) {
				const c = paramString.charAt(1);
				switch (c) {
						case '\001':
								return '(2842-222) INSTEON Motion Sensor'
						case '\004':
								return '(2842-422) INSTEON Motion Sensor'
						case '\005':
								return '(2842-522) INSTEON Motion Sensor'
						case '\003':
								return '(2420M-SP) INSTEON Motion Sensor'
						case '\002':
								return '(2421) TriggerLinc'
						case '\t':
								return '(2843-222) Open/Close Sensor'
						case '\006':
								return '(2843-422) Open/Close Sensor'
						case '\007':
						case '\031':
								return '(2843-522) Open/Close Sensor'
						case '\b':
								return '(2852-222) Leak Sensor'
						case '\r':
								return '(2852-422) Leak Sensor'
						case '\016':
						case '\032':
								return '(2852-522) Leak Sensor'
						case '\n':
								return 'INSTEON Smoke Sensor'
						case '\021':
								return '(2845-222) INSTEON Hidden Door Sensor'
						case '\024':
								return '(2845-422) INSTEON Hidden Door Sensor'
						case '\025':
						case '\033':
								return '(2845-522) INSTEON Hidden Door Sensor'
						case '\026':
								return '(2844-222) Insteon Motion Sensor II'
						case '\030':
								return '(2844-522) Insteon Motion Sensor II'
				}
				return null;
		}

		private static getNLSClimateControlInfo(paramString: string) {
				const c = paramString.charAt(1);
				switch (c) {
						case '\000':
								return 'BROAN SMSC080 Exhaust Fan'
						case '\002':
								return 'BROAN SMSC110 Exhaust Fan'
						case '\005':
								return 'BROAN, Venmar, Best Rangehoods'
						case '\001':
						case '\004':
								return 'Compacta EZTherm'
						case '\003':
								return '(2441V) INSTEON Thermostat Adapter'
						case '\t':
								return '(2441V-SP) INSTEON Thermostat Adapter'
						case '\013':
								return '(2441TH) INSTEON Thermostat'
						case '\017':
								return '(2732-422) INSTEON Thermostat'
						case '\020':
								return '(2732-522) INSTEON Thermostat'
						case '\021':
								return '(2732-432) INSTEON Thermostat'
						case '\022':
								return '(2732-532) INSTEON Thermostat'
						case '\023':
								return '(2732-242) INSTEON Thermostat Heat Pump'
						case '\024':
								return '(2732-442) INSTEON Thermostat Heat Pump for Europe'
						case '\025':
								return '(2732-542) INSTEON Thermostat Heat Pump for Aus/NZ'
						case '\026':
								return '(2732-222) INSTEON Thermostat 2.0 (HVAC/HP)'
						case '\027':
								return '(2732-422) INSTEON Thermostat 2.0 (HVAC/HP) for Europe'
						case '\030':
								return '(2732-522) INSTEON Thermostat 2.0 (HVAC/HP) for Aus/NZ'
						case '\n':
								return '(2441ZTH) INSTEON Wireless Thermostat'
						case '\016':
								return '(2491T) All-In-One INSTEON Thermostat Adapter'
				}
				return null;
		}

		private static getNLSAccessControlInfo(paramString: string) {
				const c = paramString.charAt(1);
				switch (c) {
						case '\006':
								return 'MorningLinc'
						case '\n':
								return 'Lock Controller'
				}
				return null;
		}

		private static getNLSEnergyManagement(paramString: string) {
				const c = paramString.charAt(1);
				switch (c) {
						case '\000':
								return 'ZBPCM (iMeter Solo compat.)'
						case '\007':
								return '(2423A1) iMeter Solo'
						case '\013':
								return 'Dual Band Normally Closed 240V Load Controller (2477SA2)'
						case '\n':
								return 'Dual Band Normally Open 240V Load Controller (2477SA1)'
						case '\r':
								return 'Energy Display (2448A2)'
				}
				return null;
		}

		private static getNLSWindowsCovering(paramString: string) {
				const c = paramString.charAt(1);
				switch (c) {
						case '\001':
								return '(2444-222) Micro Module Open/Close'
						case '\002':
								return '(2444-422) Micro Module Open/Close'
						case '\003':
						case '\007':
								return '(2444-522) Micro Module Open/Close'
				}
				return null;
		}

}



