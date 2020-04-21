Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Families_1 = require("./Families");
const ISY_1 = require("./ISY");
class ISYNode extends events_1.EventEmitter {
    constructor(isy, node) {
        var _a, _b;
        super();
        this.folder = '';
        this.isy = isy;
        this.nodeType = 0;
        this.flag = node.flag;
        this.nodeDefId = node.nodeDefId;
        this.address = node.address;
        this.name = node.name;
        this.family = (_a = node.family, (_a !== null && _a !== void 0 ? _a : Families_1.Family.Insteon));
        this.parent = node.parent;
        this.parentType = Number((_b = this.parent) === null || _b === void 0 ? void 0 : _b.type);
        this.enabled = node.enabled;
        this.elkId = node.ELK_ID;
        this.propertyChanged = new events_1.EventEmitter();
        this.propsInitialized = false;
        const s = this.name.split('.');
        if (s.length > 1)
            s.shift();
        this.displayName = s.join(' ').replace(/([A-Z])/g, ' $1').replace('  ', ' ').trim();
        if (this.parentType === ISY_1.NodeType.Folder) {
            this.folder = isy.folderMap.get(this.parent._);
            isy.logger(`${this.name} this node is in folder ${this.folder}`);
            this.logger = (msg) => {
                return isy.logger(`${this.folder} ${this.name} (${this.address}): ${msg}`);
            };
            this.displayName = `${this.folder} ${this.displayName}`;
        }
        else {
            this.logger = (msg) => {
                return isy.logger(`${this.name} (${this.address}): ${msg}`);
            };
        }
        this.logger(this.nodeDefId);
        this.lastChanged = new Date();
    }
    handlePropertyChange(propertyName, value, formattedValue) {
        this.lastChanged = new Date();
        return true;
    }
    on(event, listener) {
        super.on('PropertyChanged', listener);
        return this;
    }
    emit(event, propertyName, newValue, oldValue, formattedValue) {
        return super.emit(event, propertyName, newValue, oldValue, formattedValue);
    }
    handleEvent(event) {
        let actionValue = null;
        if (event.action instanceof Object) {
            actionValue = event.action._;
        }
        else if (event.action instanceof Number || event.action instanceof String) {
            actionValue = Number(event.action);
        }
        if (event.control in this) {
            // property not command
            const formatted = 'fmtAct' in event ? event.fmtAct : actionValue;
            return this.handlePropertyChange(event.control, actionValue, formatted);
        }
        else {
            // this.logger(event.control);
            const e = event.control;
            const dispName = ISY_1.Controls[e];
            if (dispName !== undefined && dispName !== null) {
                this.logger(`Command ${dispName.label} (${e}) triggered.`);
            }
            else {
                this.logger(`Command ${e} triggered.`);
            }
            return false;
        }
    }
    onPropertyChanged(propertyName = null, callback) {
        if (propertyName === null) {
            this.propertyChanged.addListener('', callback);
        }
        else {
            this.propertyChanged.addListener(propertyName, callback);
        }
    }
}
exports.ISYNode = ISYNode;
