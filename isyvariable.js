var ISYVariable = function(isy, id, name, type) {
    this.isy = isy;
    this.id = id;
    this.name = name;
    this.value = undefined;
    this.init = undefined;
    this.type = type;
    this.lastChanged = new Date();
}

ISYVariable.prototype.markAsChanged = function() {
    this.lastChanged = new Date();
}

ISYVariable.prototype.sendSetValue = function(value, onComplete) {
    this.isy.sendSetVariable(this.id, this.type, value, function(success) {
        onComplete(success);
    })
}

exports.ISYVariable = ISYVariable;