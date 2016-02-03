var isy = require('./isy.js');

var ISYVariable = function(isy, id, name, type) {
    this.isy = isy;
    this.id = id;
    this.name = name;
    this.value = undefined;
    this.init = undefined;
    this.type = type;
    this.lastChanged = new Date();
    
    this.getCurrentVariableValue();
}

ISYVariable.prototype.getCurrentVariableValue = function() {
    this.isy.sendGetVariable(this.id, this.type, function(val,init) {
        this.value = val;
        this.init = init;
    });
}

ISYVariable.prototype.markAsChanged = function() {
    this.lastChanged = new Date();
}

exports.ISYVariable = ISYVariable;