
import {ISY} from "./isy";

export class ISYVariable {
    isy: ISY;
    id: any;
    name: any;
    value: any;
    init: any;
    type: any;
    lastChanged: Date;
    constructor(isy :ISY, id, name, type) {
        this.isy = isy;
        this.id = id;
        this.name = name;
        this.value = undefined;
        this.init = undefined;
        this.type = type;
        this.lastChanged = new Date();
    }
    markAsChanged() {
        this.lastChanged = new Date();
    }
    sendSetValue(value, onComplete) {
        this.isy.sendSetVariable(this.id, this.type, value, function (success) {
            onComplete(success);
        });
    }
}
