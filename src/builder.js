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
    maxEnergyDraw: 25,
    run(creep){
        //Creep keepalive, if it's about to die, renew it with the nearest spawn. Do this before anything else.
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
            
        
        if(creep.store.energy == 0) {
            creep.memory.mode = "empty";
        }

        if(creep.store.energy > 0) {
            creep.memory.mode = "normal";

        }
        if(creep.memory.mode == "empty") {
            var nearestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store.energy > 0;
                }
            });
            if(nearestContainer) {
                creep.say("-- container");
                creep.moveTo(nearestContainer);
                creep.withdraw(nearestContainer, RESOURCE_ENERGY, this.maxEnergyDraw);
            } else {
                creep.say("-- spawn");
                var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
                if(nearestSpawn.memory.mode == "normal") {
                    creep.moveTo(nearestSpawn);
                    creep.withdraw(nearestSpawn, RESOURCE_ENERGY, 35);
                }
            }
        } 
        if(creep.memory.mode == "normal") {

            //construction sites in room with highest progress
            var highestProgress = 0;
            var highestProgressSite = null;
            for(var site in creep.room.find(FIND_CONSTRUCTION_SITES)) {
                if(creep.room.find(FIND_CONSTRUCTION_SITES)[site].progress > highestProgress) {
                    highestProgress = creep.room.find(FIND_CONSTRUCTION_SITES)[site].progress;
                    highestProgressSite = creep.room.find(FIND_CONSTRUCTION_SITES)[site];
                }
            }
            // nearest construction site
            var nearestStructure = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES)
        
            if(highestProgressSite) {
                nearestStructure = highestProgressSite;
            }

                
;
            if(nearestStructure) {
                creep.say("Building");
                new RoomVisual(creep.pos.roomName).line(creep.pos, nearestStructure.pos, {color: 'blue'});
                var buildres = creep.build(nearestStructure);
                if(buildres == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearestStructure);
                }
                if(buildres == ERR_NOT_ENOUGH_RESOURCES) {
                    creep.memory.mode = "empty";
                }
            } else {
                if(creep.memory.spawnID == undefined) {
                    console.log("Repairer: " + creep.name + " has no spawnID");
                    creep.memory.spawnID = creep.room.memory.mainSpawn;
                }
                var creepsSpawn = Game.getObjectById(creep.memory.spawnID);
                var controllerToUpgrade = creepsSpawn.room.controller;

                if(controllerToUpgrade.my) {
                    new RoomVisual(creep.pos.roomName).line(creep.pos, controllerToUpgrade.pos, {color: 'orange'});
                    if(creep.upgradeController(controllerToUpgrade) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(controllerToUpgrade);
                    }
                }
            }
        }
        }
    }

