
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
            }
            if(nearestSpawn == undefined) {
                console.log("Builder: No nearest spawn found");
                
            } else {
                handshakeActions.refreshMe(saviorSpawn, creep);
                return; //don't do anything else if we're dying and are near a spawn
            }

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
                new RoomVisual(creep.pos.roomName).line(creep.pos, sourceToMine.pos, {color: 'red'});
                console.log("Harvester" + Game.time + ": " + creep.name + " moving to source" + creep.memory.sourceToMine);
            }
            else if (harvestAttempt == OK) {
                creep.say("bonk");
            }
        } else {
            miningEngine.freeSourceSlot(creep.memory.sourceToMine, creep.room);
            creep.memory.sourceToMine = "DEPOSITING";
            /**
             * if a nearby spawn's store isn't full of energy, deposit energy into it 
             * if all spawns are full of energy, deposit energy into the storage
             * if the storage is full or doesn't exist, dump energy into the nearest container
             * 
             */
            var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            var nearestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });

            if(nearestSpawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                var transRes = creep.transfer(nearestSpawn, RESOURCE_ENERGY);
                new RoomVisual(creep.pos.roomName).line(creep.pos, nearestSpawn.pos, {color: 'green'});
                if (transRes == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearestSpawn);
                }
            }
            else if(nearestContainer != undefined) {
                new RoomVisual(creep.pos.roomName).line(creep.pos, nearestContainer.pos, {color: 'green'});
                var transRes = creep.transfer(nearestContainer, RESOURCE_ENERGY);
                if (transRes == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearestContainer);
                }
            }

    

            



            // // If a spawn isn't full, carry energy to it
            // var spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS, {
            //     filter: (spawn) => { spawn.store.energy < spawn.store.getCapacity(); }
            //     }
            // );
            // if(spawn != undefined) {
            //     new RoomVisual(creep.pos.roomName).line(creep.pos, spawn.pos, {color: 'green'});
            //     if(creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //         creep.moveTo(spawn);
            //     }
            // }
            // // If a storage isn't full, carry energy to it
            // if(creep.room.storage != undefined) {
            //     if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //         creep.moveTo(creep.room.storage);
            //     }
            // }
            // //carry energy to closest container
            // if(creep.room.storage == undefined && creep.room.find(FIND_STRUCTURES, {filter: (structure) => {return structure.structureType == STRUCTURE_CONTAINER}}).length > 0) {
            //     var containers = creep.room.find(FIND_STRUCTURES, {
            //         filter: (structure) => {
            //             return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store.energy < structure.store.getCapacity();
            //         }
            //     });
            //     if(containers.length > 0) {
            //         new RoomVisual(creep.pos.roomName).line(creep.pos, containers[0].pos, {color: 'green'});
            //         if(creep.transfer(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //             creep.moveTo(containers[0]);
            //         }
            //     }
            // }
            // //if storage is full, go to spawn and transfer energy to spawn
           
        }
    }


}