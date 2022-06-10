const gamestate = require("./gamestate");

/**
 * Mining manager, responsible for managing the mining process of a room.
 * 
 */
module.exports = {
    /**
     * initialize a rooms sources, if they are not already initialized
     * scan the spaces around a source to find the amount of space available for a worker to mine
     * store the amount of space in the rooms memory as "so
     * @param {Room} room room to scan
     */
    initializeSourcesInClaimedRooms(room) {
        if(room.memory.sourcesSpace == undefined) {
            room.memory.sourcesSpace = {};
        }
        if(room.memory.sourcesActiveBots == undefined) {
            room.memory.sourcesActiveBots = {}; //List of creeps that are currently mining a source in this room by source id
        }
        if(room.controller.my) {
            var sources = room.find(FIND_SOURCES);
            //for every source in the room, scan the surrounding spaces for empty space a creep can mine
            for (var i = 0; i < sources.length; i++) {
                var source = sources[i];
                var sourceSpace = this.scanSource(source);
                room.memory.sourcesSpace[source.id] = sourceSpace; // Commit the source space to the room memory under sourcesSpace defined as an array of source IDs with values of the amount of space available
                if(room.memory.sourcesActiveBots[source.id] == undefined) {
                    room.memory.sourcesActiveBots[source.id] = 0;
                }
            }
            console.log("Initialized sources space in room " + room.name);
        }
    },

    /**
     * give a source that has open space to a creep
     * @param {Room} room room to scan
     * @param {Creep} creep creep to assign a source to, For looking at distance optimization
     */
    giveSafeSourceToCreep(room, creep) {
        //prioritize closest source:
        var closestsourcetoCreep = creep.pos.findClosestByRange(FIND_SOURCES).id; 
        
        if(room.memory.sourcesActiveBots[closestsourcetoCreep] < room.memory.sourcesSpace[closestsourcetoCreep]) {
            console.log("Giving source " + closestsourcetoCreep + " to creep " + creep.name + " : Closest");
            room.memory.sourcesActiveBots[closestsourcetoCreep]++;
            return closestsourcetoCreep;
        }
        //Else if the source is full, just assign a source from the pool of sources
        else {
            for(const sourceID in room.memory.sourcesSpace) {

                // room.memory.sourcesActiveBots[sourceID]++; // Increment the number of creeps mining this source            
                if(room.memory.sourcesActiveBots[sourceID] < room.memory.sourcesSpace[sourceID]) {
                    //If the source has open space, give it to the creep
                    room.memory.sourcesActiveBots[sourceID]++;
                    console.log("Giving source " + sourceID + " to creep");
                    return sourceID;
                }
    
            }
        }
        
    },

    /**
     * free up a slot as a creep is no longer mining a source
     * @param {Room} room room to scan
     * @param {string} sourceID source to free up
     */
    freeSourceSlot(sourceID, room) {
        room.memory.sourcesActiveBots[sourceID]--;
    },


    /**
     * scan a source for empty terrain to mine
     * @param {Source} source 
     * @returns 
     */
    scanSource(source) {
        var sourceSpace = 0;
        var sourcePos = source.pos;
        var sourceRange = 1;
        
        //scan the source's range for empty space
        for (var x = sourcePos.x - sourceRange; x <= sourcePos.x + sourceRange; x++) {
            for (var y = sourcePos.y - sourceRange; y <= sourcePos.y + sourceRange; y++) {
                var pos = new RoomPosition(x, y, sourcePos.roomName);
                if (pos.isNearTo(sourcePos)) {
                    if (pos.lookFor(LOOK_TERRAIN)[0] == 'plain') {
                        sourceSpace++;
                    }
                }
            }
        }
        return sourceSpace;
    }
}