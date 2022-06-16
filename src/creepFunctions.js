module.exports = {
    /**
     * Check and store the tile delta for each creep, to allow us to operate and identify when we've been standing still and for how long.
     * @param {Creep} creep 
     * @returns 
     */
    tileDelta(creep) {
        if(creep.memory.stopTime == undefined) {
            creep.memory.stopTime = 0;
        }
        if(creep.memory.lastTile == undefined) {
            creep.memory.lastTile = creep.pos.y + "," + creep.pos.x + "," + creep.pos.roomName;
        }
        if(creep.memory.lastTile == creep.pos.y + "," + creep.pos.x + "," + creep.pos.roomName) {
            creep.memory.stopTime++;
        } else {
            creep.memory.stopTime = 0;
        }
        return creep.memory.stopTime;

    },
};