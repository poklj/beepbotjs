
const handshakeActions = require('handshakeActions');
const miningEngine = require('./miningEngine');

module.exports = {
    body: [WORK, CARRY, MOVE],
    role: 'harvester',
    priority: 1, //Higher priority means it will be sorted to the top of a spawn queue
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
                creep.moveTo(sourceToMine);
                new RoomVisual(creep.pos.roomName).line(creep.pos, sourceToMine.pos, {color: 'red'});
                console.log("Harvester" + Game.time + ": " + creep.name + " moving to source" + creep.memory.sourceToMine);
            }
            else if (harvestAttempt == OK) {
                new RoomVisual(creep.pos.roomName).line(creep.pos, sourceToMine.pos, {color: 'red', lineStyle: 'dashed'});
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

            //loiter near a spawn if we can't deposit energy anywhere
            else {
                var spawnPos = nearestSpawn.pos;

                var distanceFromSpawn = 5; // Distance to loiter from the spawn
                var angle = 50; // Angle to loiter around the spawn

                var x = spawnPos.x + Math.round(distanceFromSpawn * Math.cos(angle));
                var y = spawnPos.y + Math.round(distanceFromSpawn * Math.sin(angle));
                var loiterPos = new RoomPosition(x, y, spawnPos.roomName);

                new RoomVisual(creep.room.name).circle(loiterPos, {color: 'red', radius: 1});
                creep.moveTo(loiterPos);

            }


        }
    }


}