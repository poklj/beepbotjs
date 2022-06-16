const buildEngine = require("./buildEngine");
const handshakeActions = require("./handshakeActions");
const miningEngine = require("./miningEngine");



module.exports = {
    role: 'builder',
    body: [MOVE,WORK,CARRY,CARRY],
    priority: 3,
    /**
     * 
     * @param {Creep} creep Creep to run
     */
    ticksToLive: -1, // amount of ticks to start attempting to renew
    maxEnergyDraw: 30,
    run(creep){

        //if the room controller is about to downgrade, pull 5 energy and upgrade it
        if(creep.room.controller.ticksToDowngrade < 1000) {
            if(creep.carry.energy < 5) {
                var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER) &&
                            (structure.store[RESOURCE_ENERGY] > 0);
                    }
                });
                if(container != undefined) {
                    creep.moveTo(container);
                    creep.withdraw(container, RESOURCE_ENERGY);
                }
                 else {
                //grab 5 energy from spawn
                var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
                creep.moveTo(nearestSpawn);
                creep.withdraw(nearestSpawn, RESOURCE_ENERGY, 5);
                }
            } else { 
                //upgrade the controller
                creep.moveTo(creep.room.controller);
                creep.upgradeController(creep.room.controller);
            }
            return;
        }



        //Creep keepalive, if it's about to die, renew it with the nearest spawn. Do this before anything else.
        if (creep.ticksToLive < this.ticksToLive) {
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
            //Empty container loitering
        }

        if(creep.store.energy > 0) {
            creep.memory.mode = "normal";

        }
        if(creep.memory.mode == "empty") {
            
            //find all containers with energy in them
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) &&
                    (structure.store[RESOURCE_ENERGY] > 0);
                }
            });
            if(containers.length > 0) {
                //withdraw energy from the container with the most energy
                var container = containers[0];
                for(var i = 0; i < containers.length; i++) {
                    if(containers[i].store[RESOURCE_ENERGY] > container.store[RESOURCE_ENERGY]) {
                        container = containers[i];
                    }
                }
            }
            if(container) {
                creep.say("-- container");
                creep.moveTo(container);
                new RoomVisual(creep.room.name).line(creep.pos, container.pos, {color: 'white'});
                creep.withdraw(container, RESOURCE_ENERGY, this.maxEnergyDraw);
            } else {
                var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
                if(nearestSpawn.memory.mode == "normal") {
                    creep.say("-- spawn");
                    creep.moveTo(nearestSpawn);
                    creep.withdraw(nearestSpawn, RESOURCE_ENERGY, 35);
                } else {

                    if(nearestSpawn.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                        creep.moveTo(nearestSpawn);
                        creep.withdraw(nearestSpawn, RESOURCE_ENERGY, 15); //Sip a little from a maxed spawn.
                    } else {


                        //loiter around the spawn inside a circle nearby until it's able to pull energy
                        var spawnPos = nearestSpawn.pos;

                        var distanceFromSpawn = 4; // Distance to loiter from the spawn
                        var angle = 5; // Angle to loiter around the spawn

                        var x = spawnPos.x + Math.round(distanceFromSpawn * Math.cos(angle));
                        var y = spawnPos.y + Math.round(distanceFromSpawn * Math.sin(angle));
                        var loiterPos = new RoomPosition(x, y, spawnPos.roomName);

                        new RoomVisual(creep.room.name).circle(loiterPos, {color: 'red', radius: 1});
                        creep.moveTo(loiterPos);
                    }
            
                }
            }
        } 
        if(creep.memory.mode == "normal") {
            
            //construction sites in room with highest progress, preferably ramparts
            var highestProgress = 0;
            var highestProgressSite = null;
            for(var site in creep.room.find(FIND_CONSTRUCTION_SITES)) {
                if(creep.room.find(FIND_CONSTRUCTION_SITES)[site].progress > highestProgress) {
                    highestProgress = creep.room.find(FIND_CONSTRUCTION_SITES)[site].progress;
                    highestProgressSite = creep.room.find(FIND_CONSTRUCTION_SITES)[site];
                }
            }
            //if any construction sites are ramparts, do those first
            for(var site in creep.room.find(FIND_CONSTRUCTION_SITES)) {
                if(creep.room.find(FIND_CONSTRUCTION_SITES)[site].structureType == STRUCTURE_RAMPART) {
                    highestProgressSite = creep.room.find(FIND_CONSTRUCTION_SITES)[site];
                }
            }

            // nearest construction site
            var nearestStructure = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES)
            if(highestProgressSite) {
                nearestStructure = highestProgressSite;
            }

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

