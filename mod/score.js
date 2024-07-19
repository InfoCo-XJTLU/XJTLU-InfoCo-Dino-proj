DistanceMeter.bonus = 0;

DistanceMeter.prototype.getActualDistance = function(distance) {
    return distance ? Math.round(distance * this.config.COEFFICIENT) + DistanceMeter.bonus : 0;
}

DistanceMeter.prototype.addBonus = function(n){
    DistanceMeter.bonus += n;
}

DistanceMeter.prototype.reset = function() {
    this.update(0, 0);
    this.achievement = false;
    /**INFOCO MODIFIED*/ DistanceMeter.bonus = 0;
}