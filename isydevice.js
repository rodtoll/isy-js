import {
    ISYNode
} from "./ISYNode";

import {
    NodeTypes, Commands
} from "./isyconstants";
import {
    Controls
} from "./isy";


export class ISYDevice extends ISYNode {
    constructor(isy, node) {
        super(isy, node);
        this._nodeType = NodeTypes.device;
        this._type = node.type;
        this._enabled = node.enabled;
        this.deviceClass = node.deviceClass;
        this._parentAddress = node.pnode;
        let s = this.type.split('.');
        this._category = Number(s[0]);
        this._subCategory = Number(s[1]);
        this.scenes = [];
        this.formatted = {};
        this.uom = {};
        //console.log(nodeDetail);
        if (this._parentAddress != this.address && this._parentAddress !== undefined)
            this._parentDevice = isy.getDevice(this._parentAddress);
        if (Array.isArray(node.property)) { 
            for (var prop of node.property) {
                this[prop.id] = this.convertFrom(Number(prop.value),prop.uom);
                this.formatted[prop.id] = prop.formatted;
                this.uom[prop.id] = prop.uom;
                this.logger(`Property ${Controls[prop.id].label} (${prop.id}) initialized to: ${this[prop.id]} (${this.formatted[prop.id]})`);
            }
        } else {
            this[node.property.id] = this.convertFrom(Number(node.property.value),node.property.uom);
            this.formatted[node.property.id] = node.property.formatted;
            this.uom[node.property.id] = node.property.uom;
            this.logger(`Property ${Controls[node.property.id].label} (${node.property.id}) initialized to: ${this[node.property.id]} (${this.formatted[node.property.id]})`);
        }
    }

    convertTo(value,uom)
    {
        return value;
    }

    convertFrom(value,uom)
    {
        return value;
    }

    addLink(isyScene) {
      
        this.scenes.push(isyScene);
    }
    get nodeType() {
        return NodeTypes.device;
    }
    get type() {
        return this._type;
    }
    get parentAddress() {
        return this._type;
    }

    get enabled() {
        return this._enabled;
    }

    get parentDevice() {
        if (this._parentDevice === undefined) {
            if (this._parentAddress !== this.address && this._parentAddress !== null && this._parentAddress !== undefined)
                this._parentDevice = this.isy.getDevice(this._parentAddress);
            this._parentDevice = null;
        }
        return this._parentDevice;
    }

    updateProperty(propertyName,value,resultHandler)
    {
        
        let val = this.convertTo(value,this.uom[propertyName]);
        this.logger("Updating property " + Controls[propertyName].label + ". incoming value: " + value + " outgoing value: " + val);
        this.isy.sendISYCommand(`nodes/${this.address}/set/${propertyName}/${val}`, resultHandler);
    }

    sendCommand(command,resultHandler,...parameters)
    {
        this.isy.sendRestCommand(this.address, command, parameters, resultHandler);
    }

    handlePropertyChange(propertyName,value,formattedValue) {
        var changed = false;
        try {
            let val = this.convertFrom(Number(value),this.uom[propertyName]);
            if (this[propertyName] != val) {
                this.logger(`Property ${Controls[propertyName].label} (${propertyName}) updated to: ${val} (${formattedValue})`);
                this[propertyName] = val;
                this.formatted[propertyName] = formattedValue;
                this.lastChanged = new Date();
                changed = true;
            } else {
                this.logger(`Update event triggered, property ${Controls[propertyName].label} (${propertyName}) is unchanged.`);
            }
            if (changed) {

                this.propertyChanged.emit(propertyName, propertyName, val, formattedValue);
                this.propertyChanged.emit('', propertyName, val, formattedValue);
                this.scenes.forEach(element => {
                    this.logger("Recalulating " + element.name);
                    element.recalculateState();
                });
            }

        } finally {
            return changed;
        }
    }

    
}

    export const ISYBinaryStateDevice = ISYDevice => class extends ISYDevice
    {
   
        get state()
        {
            return this.ST > 0;
        }

        updateState(state,resultHandler)
        {
            if(state != this.status)
            {
                this.sendCommand((state) ? Commands.On : Commands.Off, resultHandler);
            }
        }

    };

    export const ISYLevelDevice = ISYDevice => class extends ISYDevice
    {
   
        get level()
        {
            return this.ST;
        }

        updateLevel(level, resultHandler) {
    
            if(level != this.level)
            {
                
                if(level > 0)
                    this.sendCommand(Commands.On,resultHandler,this.convertTo(level,100));
                else
                    this.sendCommand(Commands.Off,resultHandler);
            }            
        }
    };