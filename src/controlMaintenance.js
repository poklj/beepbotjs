/**
 * Creep that just maintains the controller
 * 
 */

module.exports = {
    body: [WORK, CARRY, TOUGH, MOVE],
    role: 'maintenance',
    /**
     * Run the creep
    * @param {Creep} creep
    */
   run(creep) {
        //Creep keepalive
        if (creep.ticksToLive < 100) {
            creep.say("I'm dying");
            var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            creep.moveTo(nearestSpawn);
            handshakeActions.refreshMe(nearestSpawn, creep);
        }
        //Creep behavior to acquire energy
        if(creep.store.energy < creep.store.getCapacity() && creep.memory.mode == "empty") {
            var nearestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store.energy > 0;
                }
            });
            if(nearestContainer) {
                creep.moveTo(nearestContainer);
                creep.withdraw(nearestContainer, RESOURCE_ENERGY);
            }
        }

        if(creep.store.energy == creep.store.getCapacity() && creep.memory.mode == "empty") {
            creep.memory.mode = "normal";
            //maintain the controller
            var controller = creep.room.controller;
            var maintainres = creep.upgradeController(controller);
            if(maintainres == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
            } else if(maintainres == ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.mode = "empty";
            }

        }

    }
}