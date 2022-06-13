//repairer is a creep that repairs structures
var handshakeActions = require("./handshakeActions");
module.exports = {
    body: [WORK, CARRY, MOVE],
    role: 'repairer',
    priority: 4,
    /**
     * Run the creep
     * @param {Creep} creep
        */
    energyMaxWithdrawl: 50,
    /**
     * 
     * @param {Creep} creep 
     */
    run(creep) {
        //Creep keepalive
        if (creep.ticksToLive < 100) {
            creep.say("I'm dying");
            new RoomVisual(creep.room.name).line(creep.pos, creep.pos.findClosestByRange(FIND_MY_SPAWNS).pos, {color: 'black'});
            var nearestSpawn;
            if(creep.memory.nearestSpawn == undefined) {
               var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
               creep.memory.saviorSpawn = nearestSpawn.id;
            }
            var saviorSpawn = Game.getObjectById(creep.memory.saviorSpawn);
            creep.moveTo(saviorSpawn);
            //Dump energy into the spawn to prevent death from timeout
            if(creep.store.energy > 0) {
                creep.transfer(nearestSpawn, RESOURCE_ENERGY);
                creep.memory.mode = "";
            } else {
                handshakeActions.refreshMe(saviorSpawn, creep);
                return; //don't do anything else if we're dying and are near a spawn
            }

        }

        if(creep.store.energy == 0) {
            creep.memory.mode = "empty";
        }
        if(creep.store.energy > 0) {
            creep.memory.mode = "normal";
        }

        //Creep behavior to acquire energy
        if(creep.memory.mode == "empty") {
            var nearestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store.energy > 0;
                }
            });
            if(nearestContainer) {
                creep.moveTo(nearestContainer);
                creep.withdraw(nearestContainer, RESOURCE_ENERGY, this.energyMaxWithdrawl);
            }
            //If we can't find a container, we'll try to find a spawn that is in mode "normal"
            else {
                var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS, {
                    filter: (spawn) => {
                        return spawn.memory.mode == "normal" || spawn.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
                    }
                });
                if(nearestSpawn) {
                    creep.moveTo(nearestSpawn);
                    creep.withdraw(nearestSpawn, RESOURCE_ENERGY, this.energyMaxWithdrawl);
                }
            }
        }

        if(creep.memory.mode == "normal") {
            //Repair the lowest damaged structure in the room
            var structureToRepair = _.find(creep.room.find(FIND_STRUCTURES), function(structure) {
                return (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) && structure.hits < structure.hitsMax 
                    && creep.room.name == structure.room.name;
            });

            //if we can't find a structure to repair, we'll try to upgrade the controller room we spawned in (taken from this creeps memory)
            if(!structureToRepair) {
                if(creep.memory.spawnID == undefined) {
                    console.log("Repairer: " + creep.name + " has no spawnID");
                    creep.memory.spawnID = creep.room.memory.mainSpawn;
                }
                var creepsSpawn = Game.getObjectById(creep.memory.spawnID);
                var controllerToUpgrade = creepsSpawn.room.controller;
                if(controllerToUpgrade.my) {
                    
                    if(creep.upgradeController(controllerToUpgrade) == ERR_NOT_IN_RANGE) {
                        new RoomVisual(creep.pos.roomName).line(creep.pos, controllerToUpgrade.pos, {color: 'orange'});
                        creep.moveTo(controllerToUpgrade);
                    }
                }
            }
            if(structureToRepair) {
                new RoomVisual(creep.pos.roomName).line(creep.pos, structureToRepair.pos, {color: 'blue'});
                creep.moveTo(structureToRepair);
                creep.say("Repairing");
                new RoomVisual(creep.pos.roomName).line(creep.pos, structureToRepair.pos, {color: 'purple'});
                var repairRes = creep.repair(structureToRepair);
                if(repairRes == ERR_NOT_IN_RANGE) {
                    creep.say("moving to repair");
                    creep.moveTo(structureToRepair);
                }
                if(repairRes == ERR_NOT_ENOUGH_RESOURCES) {
                    creep.memory.mode = "empty";
                }
            }
        }
    }
}
