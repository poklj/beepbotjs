// jshint esversion: 6
var handshakeActions = require("./handshakeActions");


module.exports = {
    role: 'hauler',
    body: [CARRY, CARRY, MOVE, MOVE],
    /**
     * logic for increasing body type of hauler based on maxiumum build energy
    * @param {StructureSpawn} spawn
    */
    // getBody(spawn) {
    //     var body = this.body;
    //     //get the spawns maxiumum energy capacity
    //     var maxEnergy = spawn.room.energyCapacityAvailable;
    //     //get the current energy level
    //     var currentEnergy = spawn.room.energyAvailable;
    //     //count parts in body
    //     body = body.map(function(part) {
    //         return part;
    //     });
       
        //add parts until max build energy is reached

        
    //},
    priority: 2,
    /**
     * 
     * @param {Creep} creep 
     * @returns 
     */
    run(creep) {
        //creep.giveWay();
        if (creep.ticksToLive < 100) {
            if(creep.memory.nearestSpawn == undefined) {
                var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
                if(nearestSpawn != undefined) {
                     creep.memory.saviorSpawn = nearestSpawn.id;
                } else {
                     creep.memory.saviorSpawn = creep.memory.spawnID;
                }
             }

            creep.say("I'm dying");
            if(nearestSpawn != undefined) {
                new RoomVisual(creep.room.name).line(creep.pos, nearestSpawn.pos, {color: 'black'});
            }
            var saviorSpawn = Game.getObjectById(creep.memory.saviorSpawn);
            creep.moveTo(saviorSpawn, {reusePath: 50});
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

        // If we aren't full yet go find some energy
        if (creep.store.getFreeCapacity() > 0) {
            //if there's a flag emergency, go to it and withdraw energy

            //nearest tombstone with energy in it
            var nearestTombstone = creep.pos.findClosestByRange(FIND_TOMBSTONES, {
                filter: (tombstone) => {
                    return tombstone.store.energy > 0;
                }
            });

            var harvesters = creep.room.find(FIND_MY_CREEPS, {
                filter: (creep) => {
                    return creep.memory.role == 'harvester';
                }
            });

            var adjacentHarvester = false;
            for (var i = 0; i < harvesters.length; i++) {
                if (creep.pos.isNearTo(harvesters[i])) {
                    adjacentHarvester = true;
                }
            }

            //if there's a tombstone with energy in it and we're not adjacent to a harvester, go to it
            
            


            //Only look to loiter next to a harvester or find a tombstone if we're not already loitering around a harvester
            if(adjacentHarvester == false) {
                //if theres a nearby ruin with energy, go to it and withdraw energy
                var nearestRuin = creep.pos.findClosestByRange(FIND_RUINS, {
                    filter: (ruin) => {
                        return ruin.store.energy > 0;
                    }
                });
                if(nearestRuin != undefined) {
                    creep.moveTo(nearestRuin, {reusePath: 50});
                    creep.withdraw(nearestRuin, RESOURCE_ENERGY);
                }
                //if there's a tombstone, harvest from it
                if (nearestTombstone != undefined) {
                    new RoomVisual(creep.pos.roomName).line(creep.pos, nearestTombstone.pos, {color: 'blue'});
                    if (creep.withdraw(nearestTombstone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(nearestTombstone);
                        return;
                    }
                }
                //find any dropped resources in the room and collect them
                var droppedResources = creep.room.find(FIND_DROPPED_RESOURCES, {
                    filter: (resource) => {
                        return resource.resourceType == RESOURCE_ENERGY;
                    }
                });
                if (droppedResources.length > 0) {
                    new RoomVisual(creep.pos.roomName).line(creep.pos, droppedResources[0].pos, {color: 'blue'});
                    if (creep.pickup(droppedResources[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(droppedResources[0]);
                        return;
                    }
                }                

                //if a harvester has haulers nearby, drop it from the list of harvesters that need haulers
                // union harvesters without a hauler nearby with harvesters that are next to a source
                for (var i = 0; i < harvesters.length; i++) {
                    var harvester = harvesters[i];
                    var harvesterAdjacentHaulers = harvester.pos.findInRange(FIND_MY_CREEPS, 1, {
                        filter: (creep) => {
                            return creep.memory.role == 'hauler';
                        }
                    });
                    var harvestersAdjacentSources = harvester.pos.findInRange(FIND_SOURCES, 1);

                    //remove harvesters that have a hauler nearby or are not next to a source
                    if (harvesterAdjacentHaulers.length > 0 || harvestersAdjacentSources.length == 0) {
                        harvesters.splice(i, 1);
                        i--;
                    }
                }
                // find the closest harvester withouth a hauler next to it
                var closestHarvester = creep.pos.findClosestByPath(harvesters, {
                    filter: (creep) => {
                        return creep.memory.role == 'harvester';
                    }
                });
                // movce to the harvester without a hauler next to it
                if(closestHarvester != undefined) {
                    new RoomVisual(creep.pos.roomName).line(creep.pos, closestHarvester.pos, {color: 'cyan'});
                    creep.moveTo(closestHarvester, {reusePath: 15});
                } else {
                    // move to any harvester without a hauler
                    creep.moveTo(harvesters[0]);
                }
                //if there's no haulerless harvesters, move to closest harvester with a free adjacent space
                if(harvesters.length == 0) {
                    var closestHarvester = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                        filter: (creep) => {
                            return creep.memory.role == 'harvester';
                        }
                    });
                    //move to the closest harvester
                    if(closestHarvester != undefined) {
                        new RoomVisual(creep.pos.roomName).line(creep.pos, closestHarvester.pos, {color: 'cyan'});
                        creep.moveTo(closestHarvester, {reusePath: 15});
                    }
                }
            }

        } else {

            /**
             * if a nearby spawn's store isn't full of energy, deposit energy into it 
             * if all spawns are full of energy, deposit energy into the storage
             * if the storage is full or doesn't exist, dump energy into the nearest container
             * 
             */
            var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            if(nearestSpawn == undefined) {
                //set nearest spawn to the savior spawn
                nearestSpawn = Game.getObjectById(creep.memory.saviorSpawn);
                creep.moveTo(nearestSpawn);
                return;
            }
            var nearestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });

            if(nearestSpawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                var transRes = creep.transfer(nearestSpawn, RESOURCE_ENERGY);
                new RoomVisual(creep.pos.roomName).line(creep.pos, nearestSpawn.pos, {color: 'green'});
                if (transRes == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearestSpawn, {reusePath: 50});
                    return;
                }
            }
            //if theres an extension that isn't full, deposit energy into it
            var nearestExtension = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });

            //If there's a turret in the room that isn't at least half full, deposit energy into it
            var nearestTurret = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER) && structure.store.energy < structure.store.getCapacity(RESOURCE_ENERGY) / 2;
                }  
            });
            if(nearestTurret != undefined) {
                var transRes = creep.transfer(nearestTurret, RESOURCE_ENERGY);
                new RoomVisual(creep.pos.roomName).line(creep.pos, nearestTurret.pos, {color: 'green'});
                if (transRes == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearestTurret);
                    return;
                }
            }
            if(nearestExtension != undefined) {
                var transRes = creep.transfer(nearestExtension, RESOURCE_ENERGY);
                new RoomVisual(creep.pos.roomName).line(creep.pos, nearestExtension.pos, {color: 'green'});
                if (transRes == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearestExtension);
                    return;
                }
            }
            var turrets = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }  
            });

            //fill up the rest of a turret
            if(turrets != undefined) {
                var transRes = creep.transfer(nearestTurret, RESOURCE_ENERGY);
                new RoomVisual(creep.pos.roomName).line(creep.pos, nearestTurret.pos, {color: 'green'});
                if (transRes == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearestTurret);
                    return;
                }
            }
            if(nearestContainer != undefined) {
                new RoomVisual(creep.pos.roomName).line(creep.pos, nearestContainer.pos, {color: 'green'});
                var transRes = creep.transfer(nearestContainer, RESOURCE_ENERGY);
                if (transRes == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearestContainer);
                    return;
                }
            }
            //if there's a flag named 'emergency' withdraw energy the container under it


            //loiter near a spawn if we can't deposit energy anywhere
            else {
                var spawnPos = nearestSpawn.pos;

                var distanceFromSpawn = 5; // Distance to loiter from the spawn
                var angle = 50; // Angle to loiter around the spawn

                var x = spawnPos.x + Math.round(distanceFromSpawn * Math.cos(angle));
                var y = spawnPos.y + Math.round(distanceFromSpawn * Math.sin(angle));
                var loiterPos = new RoomPosition(x, y, spawnPos.roomName);

                new RoomVisual(creep.room.name).circle(loiterPos, {color: 'red', radius: 1});
                creep.moveTo(loiterPos, {reusePath: 50});
                return; 

            }


        } 
     }
    
};