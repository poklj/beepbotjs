module.exports = {
    /**
     * get all the rooms adjacent to the given room
     * @param {Room} room
     * @returns {Room[]} rooms adjacent to the given room
     * 
     * @memberOf RoomEngine
     */
    getAdjacentRooms(room) {
        var adjacentRooms = [];
        for(var exit in Game.map.describeExits(room.name)) {
            adjacentRooms.push(Game.rooms[exit]); //Add the adjacent room to the array
        }
        return adjacentRooms;
    },
}