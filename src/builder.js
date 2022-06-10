const buildEngine = require("./buildEngine");
const handshakeActions = require("./handshakeActions");
const miningEngine = require("./miningEngine");



module.exports = {
    role: 'builder',
    body: [MOVE,WORK,CARRY,CARRY],
    /**
     * 
     * @param {Creep} creep Creep to run
     */
    run(creep){
        //Creep keepalive, if it's about to die, renew it with the nearest spawn. Do this before anything else.
        if (creep.ticksToLive < 100) {
            creep.say("I'm dying");
            var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            creep.moveTo(nearestSpawn);
            handshakeActions.refreshMe(nearestSpawn, creep);
        } else {
            
        /**
         * If a creep doesn't have energy, go to the nearest container and withdraw energy, if no container is found, go to the nearest spawn and check it's memory to see if it is mode normal, if it is, withdraw energy from it.
         * if it is not, go to the nearest source and harvest it.
         * 
         * when a creep has energy, go to the nearest structure and build it.
         * if no structure is found, go to the rooms controller and upgrade it.
         */
        //if creep is not near sourcetoMine, deregister it from miningEngine
        if(creep.store.energy == 0) {
            creep.memory.mode == "empty";
        }
        if(creep.store.energy == creep.store.getCapacity()) {
            creep.memory.mode = "normal";
        }
        if(creep.store.energy != creep.store.getCapacity() && creep.memory.mode == "empty") {
            var nearestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store.energy > 0;
                }
            });
            if(nearestContainer) {
                creep.moveTo(nearestContainer);
                creep.withdraw(nearestContainer, RESOURCE_ENERGY);
            } else {
                var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
                if(nearestSpawn.memory.mode == "normal") {
                    creep.moveTo(nearestSpawn);
                    creep.withdraw(nearestSpawn, RESOURCE_ENERGY);
                }
            }
        } else {
            var nearestStructure = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
            if(nearestStructure) {
                
                var buildres = creep.build(nearestStructure);
                if(buildres == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearestStructure);
                }
                if(buildres == ERR_NOT_ENOUGH_RESOURCES) {
                    creep.memory.mode = "empty";
                }
            } else {
                creep.moveTo(Game.rooms[creep.memory.home].controller);
                creep.upgradeController(Game.rooms[creep.memory.home].controller);
            }
        }
        }
    }
}
