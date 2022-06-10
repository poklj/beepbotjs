
const handshakeActions = require('handshakeActions');
const miningEngine = require('./miningEngine');

module.exports = {
    body: [WORK, CARRY, MOVE],
    role: 'harvester',
    /**
     * 
     * @param {Creep} creep 
     */
    run(creep){
        //Creep behavior
        //TODO: replace this a mining manager.... memory!
        
        //Creep Keepalive
        if (creep.ticksToLive < 100) {
            creep.say("I'm dying");
            var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            creep.moveTo(nearestSpawn);
            //Dump energy into the spawn to prevent death from timeout
            if(creep.store.energy > 0) {
                creep.transfer(nearestSpawn, RESOURCE_ENERGY);
            }
            handshakeActions.refreshMe(nearestSpawn, creep);
        }
        if(creep.memory.sourceToMine == undefined) {
            creep.memory.sourceToMine = "";
        }
        if(creep.memory.sourceToMine == "DEPOSITING" && creep.store.energy == 0) {
            creep.memory.sourceToMine = "";
        }
        if(creep.store.energy < creep.store.getCapacity()) {
            //harvest energy from source in memory
            if(creep.memory.sourceToMine == "") {
                creep.memory.sourceToMine = miningEngine.giveSafeSourceToCreep(creep.room, creep);
            }
            var sourceToMine = Game.getObjectById(creep.memory.sourceToMine);
            var harvestAttempt = creep.harvest(sourceToMine);

            if(harvestAttempt == ERR_NOT_IN_RANGE) {
                creep.say("moving to " + creep.memory.sourceToMine);
                creep.moveTo(sourceToMine);
                Game.map.visual.line(creep.pos, sourceToMine.pos, {color: 'red'});
                console.log("Harvester" + Game.time + ": " + creep.name + " moving to source" + creep.memory.sourceToMine);
            }
            else if (harvestAttempt == OK) {
                creep.say("bonk");
            }
        } else {
            miningEngine.freeSourceSlot(creep.memory.sourceToMine, creep.room);
            creep.memory.sourceToMine = "DEPOSITING";
            //carry energy to storage
            if(creep.room.storage != undefined) {
                if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }
            //carry energy to closest container
            if(creep.room.storage == undefined && creep.room.find(FIND_STRUCTURES, {filter: (structure) => {return structure.structureType == STRUCTURE_CONTAINER}}).length > 0) {
                var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store.energy < structure.store.getCapacity();
                    }
                });
                if(containers.length > 0) {
                    if(creep.transfer(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(containers[0]);
                    }
                }
            }
            //if storage is full, go to spawn and transfer energy to spawn
            else {
                if(creep.transfer(creep.room.find(FIND_MY_SPAWNS)[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    Game.map.visual.line(creep.pos, creep.room.find(FIND_MY_SPAWNS)[0].pos, {color: 'green'});
                    creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
                }
            }
        }
    }


}