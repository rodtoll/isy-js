import { Controls } from "./isy";
import { EventEmitter } from "events";
import { triggerAsyncId } from "async_hooks";


export class ISYNode {
    constructor(isy, node) {
       
        this.isy = isy;
        this._nodeType = 0;
        this.flag = node["@flag"];
        this.nodeDefId = node["@nodeDefId"];
        this.address = node.address;
        this.name = node.name;
        this.family = node.family;
        this.parent = node.parent;
        this.elkId = node.ELK_ID;
        this.propertyChanged = new EventEmitter();
        this.propsInitialized = false;
        this.logger = (msg) => {
            return isy.logger(`${this.name} (${this.address}): ${msg}`);
        };
        this.lastChanged = new Date();
    }

    handlePropertyChange(propertyName,value,formattedValue)
    {
        return true;
    }
  

    
    handleEvent(event) {

        let actionValue = null;
        if (event.action instanceof Object) {
            actionValue = event.action._;
        } else if (event.action instanceof Number || event.action instanceof String) {
            actionValue = Number(event.action);
        }

        // if(this.nodeDetail === undefined)
        // {
        //     var that = this;
        //     this.isy.getNodeDetail(this, (nodeDetail) => {
                
        //         that.nodeDetail = nodeDetail;
        //         let node = nodeDetail.properties;
        //         if (Array.isArray(node.property)) {
        //             //var properties = nodes[index].childrenNamed('property');
        //             for (var prop of node.property) {
        //                 this[prop.id] = Number(prop.value);
        //                 this.formatted[prop.id] = prop.formatted;
        //                 this.uom[prop.id] = prop.uom;
        //                 this.logger(`Property ${Controls[prop.id].label} (${prop.id}) initialized to: ${this[prop.id]} (${this.formatted[prop.id]})`);
        //             }
        //         } else {

        //             this[node.property.id] = Number(node.property.value);
        //             this.formatted[node.property.id] = node.property.formatted;
        //             this.uom[node.property.id] = node.property.uom;
        //             this.logger(`Property ${Controls[node.property.id].label} (${node.property.id}) initialized to: ${this[node.property.id]} (${this.formatted[node.property.id]})`);
        //         }
        //         if (event.control in this) {
        //             var formatted = ("fmtAct" in event) ? event.fmtAct : actionValue;
        //             this.handlePropertyChange(event.control,actionValue,formatted);
        //         }
        //     });
        // }
        // else
        // {
            if (event.control in this) { //property not command
                var formatted = ("fmtAct" in event) ? event.fmtAct : actionValue;
                return this.handlePropertyChange(event.control,actionValue,formatted);
            }
            else
            {
                this.logger(`Command ${Controls[event.control].label} (${event.control}) triggered`);
                return false;
            }
            
        //}
    }

    onPropertyChanged(propertyName,callback)
    {
        this.propertyChanged.addListener(propertyName,callback);
    }
    

    onPropertyChanged(callback) {
       
        this.propertyChanged.addListener('',callback);
    }

}