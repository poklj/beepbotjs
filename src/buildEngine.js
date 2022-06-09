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
            var mainSpawn = Game.getObjectById(room.memory.mainSpawn);
            var spawnPos = mainSpawn.pos; // RoomPosition
            //Build Containers
            if(room.memory.numContainers == undefined) {
                room.memory.numContainers = _.find(Game.structures, (structure) => {
                     return structure.structureType == STRUCTURE_CONTAINER && structure.pos.roomName == room.name; 
                    }).length;
            }
            if(room.memory.l1placed == undefined) {
                
                var containerMatrix = [[-1, -1], [1, -1], [-1, 1], [1, 1]]; // x and y offsets for container placement from spawn
                containerMatrix.forEach((offset) => {
                        room.createConstructionSite(spawnPos.x + offset[0], spawnPos.y + offset[1], STRUCTURE_CONTAINER);
                });
                room.memory.l1placed = true;
            }
            
            //Build roads to sources
            var sources = room.find(FIND_SOURCES);
            sources.forEach((source) => {
                var path = room.findPath(spawnPos, source.pos, {ignoreCreeps: true});
                path.forEach((step) => {
                    room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
                });
            });
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