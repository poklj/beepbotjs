/**
 * Creep that just maintains the controller
 * 
 */
var handshakeActions = require("./handshakeActions");

module.exports = {
    body: [WORK, CARRY, TOUGH, MOVE, MOVE],
    role: 'maintainer',
    /**
     * Run the creep
    * @param {Creep} creep
    */
   run(creep) {
        var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
        //if energy is zero, mode empty
        if(creep.store.energy == 0) {
            creep.memory.mode = "empty";
        }
        //if energy is full, mode full
        if(creep.store.energy == creep.store.getCapacity()) {
            creep.memory.mode = "normal";
        }

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
        if(creep.memory.mode == "empty") {
            var nearestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store.energy > 0;
                }
            });
            if(nearestContainer) {
                creep.moveTo(nearestContainer);
                creep.withdraw(nearestContainer, RESOURCE_ENERGY);
                return;
            }
            //don't stand idle on adjacent tiles of the spawn
            else {
                //loiter around the spawn inside a circle nearby until it's able to pull energy
                var spawnPos = nearestSpawn.pos;

                var distanceFromSpawn = 4; // Distance to loiter from the spawn
                var angle = 70; // Angle to loiter around the spawn
                
                var x = spawnPos.x + Math.round(distanceFromSpawn * Math.cos(angle));
                var y = spawnPos.y + Math.round(distanceFromSpawn * Math.sin(angle));
                var loiterPos = new RoomPosition(x, y, spawnPos.roomName);
                
                new RoomVisual(creep.room.name).circle(loiterPos, {color: 'blue', radius: 1});
                creep.moveTo(loiterPos);
                return;
            }
        }

        if(creep.memory.mode == "normal") {
            
            //maintain the controller
            var controller = creep.room.controller;
            var maintainres = creep.upgradeController(controller);
            new RoomVisual(creep.room.name).line(creep.pos, controller.pos, {color: 'orange'});
            if(maintainres == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
                return;
            } 
        }

    }
}