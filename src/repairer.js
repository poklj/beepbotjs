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
        

        if(creep.room.controller.ticksToDowngrade < 2000) {
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
                //orange room visual line from the creep to the controller in the room
                new RoomVisual(creep.room.name).line(creep.pos, creep.room.controller.pos, {color: 'orange'});

            }
            return;
        }
        //Creep keepalive
        if (creep.ticksToLive < 100) {
            creep.say("I'm dying");
            new RoomVisual(creep.room.name).line(creep.pos, creep.pos.findClosestByRange(FIND_MY_SPAWNS).pos, {color: 'black'});
            var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            if(creep.memory.nearestSpawn == undefined) {
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
            //loiter nearby if we are empty and no nearby container has energy
            var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) &&
                        (structure.store.energy > 0);
                }
            });

        } 
        if(creep.store.energy > 0) {
            creep.memory.mode = "normal";
        }

        //Creep behavior to acquire energy
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

            if( container) {
                creep.say("-- container");
                creep.moveTo(container);
                new RoomVisual(creep.room.name).line(creep.pos, container.pos, {color: 'white'});
                creep.withdraw(container, RESOURCE_ENERGY, this.maxEnergyDraw);
            //If we can't find a container, we'll try to find a spawn that is in mode "normal"
            } else {
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
            var structureToRepair = null;
            //find all structures that need repair
            var structures = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART || structure.structureType == STRUCTURE_ROAD) &&
                        structure.hits < structure.hitsMax;
                    }});

            //for every structure in need of repair find the structure with the lowest hits
            if(structures.length > 0) {
                var currLowest = structures[0];

                for(var i = 0; i < structures.length; i++) {
                    if(structures[i].hits < currLowest.hits) {
                        currLowest = structures[i];
                    }
                }
            }

            if(currLowest) {
                structureToRepair = currLowest;
            }
            

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
            if(structureToRepair == null) {
                //loiter nearby 
                var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
                //loiter around the spawn inside a circle nearby until it's able to pull energy
                var spawnPos = nearestSpawn.pos;
                var distanceFromSpawn = 4; // Distance to loiter from the spawn
                var angle = 70; // Angle to loiter around the spawn
                
                var x = spawnPos.x + Math.round(distanceFromSpawn * Math.cos(angle));
                var y = spawnPos.y + Math.round(distanceFromSpawn * Math.sin(angle));
                var loiterPos = new RoomPosition(x, y, spawnPos.roomName);
                
                new RoomVisual(creep.room.name).circle(loiterPos, {color: 'blue', radius: 1});
                creep.moveTo(loiterPos);
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
};
