import {
    ISYNode
} from "./isynode";

import {
    ISYScene
} from "./isyscene";

import {
    NodeTypes, Commands
} from "./isyconstants";
import {
    Controls, ISY
} from "./isy";


export class ISYDevice extends ISYNode {
    readonly typeCode: string;
    readonly deviceClass: any;
    readonly parentAddress: any;
    readonly category: number;
    readonly subCategory: number;
    readonly type: any;
    _parentDevice: ISYDevice;
    readonly scenes: ISYScene[] = [];
    readonly formatted: any[string] = {};
    readonly uom: any[string] = {};
   
  


    constructor(isy :ISY, node) {
        super(isy, node);
        this.nodeType = 1;
        this.type = node.type;
        this._enabled = node.enabled;
        this.deviceClass = node.deviceClass;
        this.parentAddress = node.pnode;
        let s = this.type.split('.');
        this.category = Number(s[0]);
        this.subCategory = Number(s[1]);

        //console.log(nodeDetail);
        if (this.parentAddress !== this.address && this.parentAddress !== undefined)
            this._parentDevice = isy.getDevice(this.parentAddress);
        if (Array.isArray(node.property)) { 
            for (var prop of node.property) {
                this[prop.id] = this.convertFrom(Number(prop.value),Number(prop.uom));
                this.formatted[prop.id] = prop.formatted;
                this.uom[prop.id] = prop.uom;
                this.logger(`Property ${Controls[prop.id].label} (${prop.id}) initialized to: ${this[prop.id]} (${this.formatted[prop.id]})`);
            }
        } else {
            this[node.property.id] = this.convertFrom(Number(node.property.value),Number(node.property.uom));
            this.formatted[node.property.id] = node.property.formatted;
            this.uom[node.property.id] = node.property.uom;
            this.logger(`Property ${Controls[node.property.id].label} (${node.property.id}) initialized to: ${this[node.property.id]} (${this.formatted[node.property.id]})`);
        }
    }

    convertTo(value :any,uom :Number) :any
    {
        return value;
    }

    convertFrom(value :any,uom :Number) : any
    {
        return value;
    }

    addLink(isyScene :ISYScene) {
      
        this.scenes.push(isyScene);
       
    }

 


    get parentDevice() :ISYDevice {
        if (this._parentDevice === undefined) {
            if (this.parentAddress !== this.address && this.parentAddress !== null && this.parentAddress !== undefined)
                this._parentDevice = this.isy.getDevice(this.parentAddress);
            this._parentDevice = null;
        }
        return this._parentDevice;
    }

    async updateProperty(propertyName,value) : Promise<any>
    {
        let val = this.convertTo(Number(value),Number(this.uom[propertyName]));
        this.logger("Updating property " + Controls[propertyName].label + ". incoming value: " + value + " outgoing value: " + val);
        return this.isy.sendISYCommand(`nodes/${this.address}/set/${propertyName}/${val}`);
    }

    async sendCommand(command,...parameters: any[]) : Promise<any>
    {
        return this.isy.sendNodeCommand(this, command, ...parameters);
    }

    handlePropertyChange(propertyName,value,formattedValue) {
        var changed = false;
        try {
            let val = this.convertFrom(Number(value),Number(this.uom[propertyName]));
            if (this[propertyName] !== val) {
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



type Constructor<T> = new (...args: any[]) => T;

    export const ISYBinaryStateDevice = <T extends Constructor<ISYDevice>>(Base: T) => {
        return class extends Base {
           
            get state() :boolean{
                return this.ST > 0;
            }

            async updateState(state :boolean) : Promise<any> {
                if (state !== this.state) {
                    return this.sendCommand((state) ? Commands.On : Commands.Off);
                }
                return Promise.resolve({});   
            }
        };
    };

    export const ISYLevelDevice =  <T extends Constructor<ISYDevice>>(base: T)=> class extends base
    {
        
        get level() : number
        {
            return this.ST;
        }

        async updateLevel(level : number) : Promise<any>{
    
           
            if(level !== this.level)
            {
                if(level > 0)
                   return this.sendCommand(Commands.On,this.convertTo(level,Number(this.uom.ST)));
                else
                   return this.sendCommand(Commands.Off);
            }
            return Promise.resolve({});        
        }
    };