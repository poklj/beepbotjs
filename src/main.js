// This is the Main script that is each game loop. This will be a little strange but deal with the declaritiveness and suffer.
var gamestate = require('./gamestate');
var spawnBehavior = require('./spawn');

var _ = require('lodash');
const creep = require('./creepUtil');
const buildEngine = require('./buildEngine');


console.log("Gameloop" + Game.time);

for (const roomID in Game.rooms) {
    var room = Game.rooms[roomID];
    buildEngine.initializeClaimedRoomMemory(room);
    buildEngine.saturateToLevel(room);
}

for(const spawnHash in Game.spawns) {
    spawnBehavior.run(Game.spawns[spawnHash]);
}

for(const creepHash in Game.creeps) {
    console.log("BeepBot: " + Game.creeps[creepHash].name + " is running");
    if(Memory.creepnumbers == undefined) {
        Memory.creepnumbers = {};
    }
    Memory.creepnumbers[Game.creeps[creepHash].memory.role]++;
    creep.runFromRole(Game.creeps[creepHash]);
}
