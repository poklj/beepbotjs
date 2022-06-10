/**
 * Creep that just maintains the controller
 * 
 */
var handshakeActions = require("./handshakeActions");

module.exports = {
    body: [WORK, CARRY, TOUGH, MOVE, MOVE],
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
            //Dump energy into the spawn to prevent death from timeout
            if(creep.store.energy > 0) {
                creep.transfer(nearestSpawn, RESOURCE_ENERGY);
                creep.memory.mode = "";
            }
            handshakeActions.refreshMe(nearestSpawn, creep);
            return; //don't do anything else if we're dying (this is a hack) 
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