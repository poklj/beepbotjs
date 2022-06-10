// This is the Main script that is each game loop. This will be a little strange but deal with the declaritiveness and suffer.
var gamestate = require('./gamestate');
var spawnBehavior = require('./spawnUtil');

var _ = require('lodash');
const creep = require('./creepUtil');
const buildEngine = require('./buildEngine');
const miningEngine = require('./miningEngine');


console.log("Gameloop" + Game.time);

for (const roomID in Game.rooms) {
    var room = Game.rooms[roomID];
    buildEngine.initializeClaimedRoomMemory(room);
    buildEngine.saturateToLevel(room);
    miningEngine.initializeSourcesInClaimedRooms(room);
}

for(const spawnHash in Game.spawns) {
    spawnBehavior.run(Game.spawns[spawnHash]);
}
for(const creepHash in Game.creeps) {
    console.log("BeepBot: " + Game.creeps[creepHash].name + " is running");
    
    //aggregate all roles of all alive creeps
    var roles = _.map(Game.creeps, (creep) => { return creep.memory.role; });
    //take the array of roles and count the number of times each role appears on an alive creep
    var roleCounts = _.countBy(roles);
    Memory.creepTally = roleCounts;
    creep.runFromRole(Game.creeps[creepHash]);
}
