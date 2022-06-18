/**
 * beep bots Room construction manager.
 */

const roomLevel = require('roomLevel');
module.exports = {
    /**
     * initialize the memory of a room if we operate on it. 
     * @param {Room} room
     * 
     */
    initializeClaimedRoomMemory(room) {
        if (room.memory.claimedByMe == undefined) {
            room.memory.claimedByMe = room.controller.my;
            room.memory.controllerLevel = room.controller.level;
            room.memory.buildQueue = []; // List of structures that need building
            room.memory.numContainers = 0;
            room.memory.numExtensions = 0;
            
            //Define a main spawn and label it on it's memory
            if(room.find(FIND_MY_SPAWNS).length == 1) {
                room.memory.mainSpawn = room.find(FIND_MY_SPAWNS)[0].id;
                room.find(FIND_MY_SPAWNS)[0].memory.mainSpawn = true;
            }
        }
    },

    /**
     * 
     * @param {Room} room 
     */
    saturateToLevel(room) {
        //update controller level in memory if it has changed
        if (room.controller.level < room.memory.controllerLevel) {
            room.memory.controllerLevel = room.controller.level;
        }
        if(room.controller.level == 1) {
            //TODO: Create a more complex base building plan, however for now, lets just build a simple base
            //Get the spawn in the room with MainSpawn memory
            var mainSpawn = room.find(FIND_MY_SPAWNS, {filter: (spawn) => {return spawn.memory.mainSpawn == true;}})[0];
            
            console.log("Main spawn: " + mainSpawn.name);
            var spawnPos = mainSpawn.pos; // RoomPosition
            //Build Containers
            if(room.memory.numContainers == undefined) {
                room.memory.numContainers = _.find(Game.structures, (structure) => {
                     return structure.structureType == STRUCTURE_CONTAINER && structure.pos.roomName == room.name; 
                    }).length;
            }
            if(room.memory.l1placed == undefined) {
                
                var containerMatrix = [[-1, -1], [1, -1]]; // x and y offsets for container placement from spawn
                containerMatrix.forEach((offset) => {
                        room.createConstructionSite(spawnPos.x + offset[0], spawnPos.y + offset[1], STRUCTURE_CONTAINER);
                });
                room.memory.l1placed = true;
            }
            
            //Build roads to sources only if we have at least one container
            if(room.memory.numContainers > 0) {

            }
        }
        //Room level 2, build extensions and cover the base with ramparts.
        if(room.controller.level == 2) {
            var rampartRadiusFromSpawn = 2;
            if(room.memory.numExtensions == undefined) {
                room.memory.numExtensions = _.find(Game.structures, (structure) => {
                        return structure.structureType == STRUCTURE_EXTENSION && structure.pos.roomName == room.name; 
                        }).length;
            }
            if(room.memory.l2placed == undefined) {
                //How far to propagate ramparts from spawns in spaces.
                
                //find rooms mainspawn
                var mainSpawn = Game.getObjectById(room.memory.mainSpawn);
                var spawnPos = mainSpawn.pos; // RoomPosition
            
                //build ramparts outwards from spawn
                for(var x = -rampartRadiusFromSpawn; x <= rampartRadiusFromSpawn; x++) {
                    for(var y = -rampartRadiusFromSpawn; y <= rampartRadiusFromSpawn; y++) {
                        room.createConstructionSite(spawnPos.x + x, spawnPos.y + y, STRUCTURE_RAMPART);
                    }
                }

                //build extensions

                room.memory.l2placed = true;
            }
            if(room.memory.l2placed == true) {
                var mainSpawn = Game.getObjectById(room.memory.mainSpawn);
                var spawnPos = mainSpawn.pos; // RoomPosition
                var containerMatrix = [[-1, -1], [1, -1], [1, 1]]; // x and y offsets for container placement from spawn
                containerMatrix.forEach((offset) => {
                        room.createConstructionSite(spawnPos.x + offset[0], spawnPos.y + offset[1], STRUCTURE_CONTAINER);
                });
                var extensionMatrix = [[0, -2], [0, 2], [-2, 0], [2, 0]]; // x and y offsets for extension placement from spawn
                extensionMatrix.forEach((offset) => {
                        room.createConstructionSite(spawnPos.x + offset[0], spawnPos.y + offset[1], STRUCTURE_EXTENSION);
                });
                //ensure we have ramparts protecting the base
                for(var x = -rampartRadiusFromSpawn; x <= rampartRadiusFromSpawn; x++) {
                    for(var y = -rampartRadiusFromSpawn; y <= rampartRadiusFromSpawn; y++) {
                        room.createConstructionSite(spawnPos.x + x, spawnPos.y + y, STRUCTURE_RAMPART);
                    }
                }
                //build some roads to the nearest wall terrain  to the main spawn
                var nearestWallToSpawn = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_WALL && structure.pos.getRangeTo(spawnPos) <= 2;
                    }
                });
                //build a road to any minerals in the room
                var minerals = room.find(FIND_MINERALS);
                minerals.forEach((mineral) => {
                    var path = room.findPath(spawnPos, mineral.pos, {ignoreCreeps: true});
                    path.forEach((step) => {
                        //look at the terrain at the step and build a road if it's swamp or plain
                            var pos = new RoomPosition(step.x, step.y, room.name);
                            var chk = pos.lookFor(LOOK_TERRAIN);
                            if(chk == "swamp" || chk == "plain") {
                                room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
                            }
                        });
                });
                var sources = room.find(FIND_SOURCES);
                sources.forEach((source) => {
                    var path = room.findPath(spawnPos, source.pos, {ignoreCreeps: true});
                    path.forEach((step) => {
                        var pos = new RoomPosition(step.x, step.y, room.name);
                        var chk = pos.lookFor(LOOK_TERRAIN);
                        if(chk == "swamp" || chk == "plain") {
                            room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
                        }
                    });
                });

                //build a road from the mainspawn to the room controller
                var path = room.findPath(spawnPos, room.controller.pos, {ignoreCreeps: true});
                path.forEach((step) => {
                    //if the tile is not plains or swamp, don't build a road
                    var pos = new RoomPosition(step.x, step.y, room.name);
                    var chk = pos.lookFor(LOOK_TERRAIN);
                    if(chk == "swamp" || chk == "plain") {
                        room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
                    }
                });            
        }

        }

    },

    /**
     * 
     * @param {Room} room 
     * @param {string} structureType STRUCTURE_*
     * @param {string} id id of the ConstructionSite 
     */
    registerBuildQueue(room, structureType, id) {
        if (room.memory.buildQueue == undefined) {
            room.memory.buildQueue = [];
        }
        room.memory.buildQueue.push({
            type: structureType,
            id: id
        });
    },

}