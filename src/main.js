// This is the Main script that is each game loop. This will be a little strange but deal with the declaritiveness and suffer.
var gamestate = require('./gamestate');
var spawnBehavior = require('./spawn');

var _ = require('lodash');
const creep = require('./creep');


console.log("Gameloop" + Game.time);

for(const spawnHash in Game.spawns) {
    spawnBehavior.run(Game.spawns[spawnHash]);
}

for(const creepHash in Game.creeps) {
    creep.runFromRole(Game.creeps[creepHash]);
}