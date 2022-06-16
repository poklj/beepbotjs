// jshint esversion: 6
const memoryPrint = require("./memoryPrint");

module.exports = {

    /* 
     * get all rooms adjacent to the given room
        * @param {Room} room
        * @returns {Room[]}
    */
    getAdjacentRooms(room) {
        var adjacentRooms = [];
        for(var exit in Game.map.describeExits(room.name)) {
            adjacentRooms.push(Game.rooms[exit]); //Add the adjacent room to the array
        }
        return adjacentRooms;
    },
    /**
     * Calculate Room Viability, for now, just give us the total score of all tiles within the room divided by the total tiles in the room . This is a simple heuristic using some arbitrary scoring criteria.

     * @param {Room} room
     * @returns {number} score
     * 
     */
    calculateRoomViability(room) {
        var score = 0;

        //for every tile in the room, calculate the viability of the tile
        for(var x = 0; x < 50; x++) {
            for(var y = 0; y < 50; y++) {
                score = this.calculateTileViability(new RoomPosition(x, y, room.name));
            }
        }
        // average the sum of all tile scores by the amount of tiles.
        score = score / (50 * 50);

        //Increase room score for room resources
        
        //if a room has 2 or more sources in it, increase the score by 10
        if(room.find(FIND_SOURCES).length > 1) {
            score += 10;
        }

        // check if adjacent rooms have an average greater or equal then 2 per room, or half if there is greater then the average of 1 per room
        var adjacentRooms = this.getAdjacentRooms(room);
        var average = 0;

        for(var i = 0; i < adjacentRooms.length; i++) {
            if(adjacentRooms[i] != undefined) {
                average += adjacentRooms[i].find(FIND_SOURCES).length;
            }
        }

        average = average / adjacentRooms.length;

        if(average >= 2) {
            score += 10;
        }
        else if(average >= 1) {
            score += 5;
        }

        //reduce the score by half if any of the adjacent rooms are owned by someone else
        for(var i = 0; i < adjacentRooms.length; i++) {
            if(!adjacentRooms[i].controller.my) {
                score = score / 2;
            }
        }
        //If room contains any deposits of any resource, increase the score by 5
        if(room.find(FIND_DEPOSITS).length > 0) {
            score += 5;
        }
        // if room contains any minerals, increase the score by 5 multiplied by the regeneration ammount. DENSITY_LOW is 0.5, DENSITY_MEDIUM is 1, DENSITY_HIGH is 2, DENSITY_ULTRA is 3
        //multiply the score again by the amount of minerals in the room, regardless of their density
        var room_minerals = room.find(FIND_MINERALS);
        if(room_minerals.length > 0) {
            for(var i = 0; i < room_minerals.length; i++) {
                switch(room_minerals[i].density) {
                    case DENSITY_LOW:
                        score += 5 * 1;
                        break;
                    case DENSITY_MEDIUM:
                        score += 5 * 2;
                        break;
                    case DENSITY_HIGH:
                        score += 5 * 3;
                        break;
                    case DENSITY_ULTRA:
                        score += 5 * 4;
                        break;
                }
            }
            score += score * room_minerals.length;
        }
        //if adjacent rooms have minerals in them, increase the score by 5
        var adjacent_minerals = 0;
        for(var i = 0; i < adjacentRooms.length; i++) {
            adjacent_minerals += adjacentRooms[i].find(FIND_MINERALS).length;
        }
        if(adjacent_minerals > 0) {
            score += 5;
        }
        

        this.renderRoomViability(room, score);
        return score; 
    },

    /**
     * Calculate Tile Viability for a given room position
     * The style of growth will be a combination between a Bunker and a Stamp like structure placement that I'm going to refer to as Vineyard growth.
     * 
     * The goal of "Vineyard growth" is to use natural structures to create a creeping defensive emplacement for important structures, limiting attack angles for attackers and hopefully
     * creating natural funnels to take advantange of dumber attack strategies.
     * 
     * The intial spawn for a colony will follow a bunker strategy, the necissary placement of which should both cover the Controller, and be nearby to at least a single source of energy.
     * 
     * @param {RoomPosition} position
     * @returns {number} score
     */
    calculateTileViability(roomPosition) {
        // if the tile is a wall, return a score of 0 and don't bother checking anything else as we can't place anything on a wall, also skip drawing anything.
        if(roomPosition.lookFor(LOOK_TERRAIN)[0] === 'wall') {
            return 0;
        }

        var tileScore = 0;

        //if the tile is within 5 tiles of the controller add a score of 5 to the tile
        if(roomPosition.inRangeTo(Game.rooms[roomPosition.roomName].controller, 5)) {
            tileScore += 5;
        }

        //get the average range to all sources in the room and within adjacent rooms
        var sources = Game.rooms[roomPosition.roomName].find(FIND_SOURCES);
        var sourceRanges = [];
        for(var source of sources) {
            sourceRanges.push(roomPosition.getRangeTo(source));
        }
        
        var adjacentRooms = this.getAdjacentRooms(Game.rooms[roomPosition.roomName]);

        for(var adjacentRoom of adjacentRooms) {
            if(adjacentRoom != undefined) {
                var adjacentSources = adjacentRoom.find(FIND_SOURCES);
                for(var adjacentSource of adjacentSources) {
                    sourceRanges.push(roomPosition.getRangeTo(adjacentSource));
                }
            }
        }
        var averageSourceRange = sourceRanges.reduce((a, b) => a + b, 0) / sourceRanges.length;
        tileScore += averageSourceRange; // add the average range to the tile score to give it a score based on the distance to sources within one rooms distance ((this is an major bonus to the tile score... give more score to tiles that benefit from power projection.))


        // get the average range to all sources of energy in the room.
        var averageRange = 0;
        var sources = Game.rooms[roomPosition.roomName].find(FIND_SOURCES);
        for(var source of sources) {
            averageRange += roomPosition.getRangeTo(source);
        }
        averageRange /= sources.length;

        //if there's a source closer then the average range to all sources in the room add 5 to the tile (Stacking if there's more then one source within the average range)
        for(var source of sources) {
            if(roomPosition.getRangeTo(source) < averageRange) {
                tileScore += 5;
            }
        }

        this.renderTileViability(roomPosition, tileScore);
        // normalize the score to between 0 and 1
        return tileScore / 100;
    },
    /**
     * DEBUG
     * render the tile viability map for a given room
     * @param {RoomPosition} roomPosition 
     */
    renderTileViability(roomPosition, tileScore) {
        if(Memory.debug == undefined || Memory.debug == true) {
            new RoomVisual(roomPosition.roomName).text(tileScore, roomPosition.x, roomPosition.y, {color: 'white', font: 0.5});
        }
        
        
        //the tile score is a number between 0 and 1, map it to a color between red and green
        var color = '#ff0000';
        if(tileScore > 0.5) {
            color = '#00ff00';
        }
        if(tileScore > 0.75) {
            color = '#ffff00';
        }
        if(tileScore > 0.9) {
            color = '#00ffff';
        }
        if(tileScore > 0.95) {
            color = '#0000ff';
        }
        new RoomVisual(roomPosition.roomName).rect(roomPosition.x - 0.5, roomPosition.y - 0.5, 1, 1, {fill: color});


    },
    /**
     * 
     * @param {Room} room 
     * @param {Number} score 
     */
    renderRoomViability(room, score) {
        if(Memory.debug != undefined && Memory.debug == true) {
            //Hack to avoid a Screeps API bug where if you attempt to render map visuals in sim it will incorrectly render inside the room as if you're using `RoomVisual`
            if(room.name != 'sim') {
                //get the status of the room, if the room is respawn, the style should black bordered, blue text, or black bordered, green text if it is a novice room

                var status = Game.map.getRoomStatus(room.name);
                var style = {};
                switch(status) {
                    case 'normal':
                        style = {color: 'white'};
                        break;
                    case 'respawn':
                        style = {stroke: '#000000', color: '#0000ff'};
                        break;
                    case 'novice':
                        style = {stroke: '#000000', color: '#00ff00'};
                        break;
                }
                Game.map.visual(score, new RoomPosition(0, 0, room.name, style));
            }
        }

    },

    /**
     * invalidate all room viability scores in memory
        */
    invalidateRoomViability() {
        for(var room in Memory.rooms) {
            if(Memory.rooms[room].viability != undefined) {
                Memory.rooms[room].viability = undefined;
            }
        }
    },

    viabilityChk(roomName) {
        var room = Game.rooms[roomName];
        
        var score = this.calculateRoomViability(Game.rooms[roomName]);
        console.log('Forced room viability score for ' + roomName + ' is ' + score);
        return score;
    }
}