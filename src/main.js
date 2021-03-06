// This is the Main script that is each game loop. This will be a little strange but deal with the declaritiveness and suffer.
var gamestate = require('./gamestate');
var spawnBehavior = require('./spawnUtil');

var _ = require('lodash');
const creep = require('./creepUtil');
const buildEngine = require('./buildEngine');
const miningEngine = require('./miningEngine');
const roomEngine = require('./roomEngine');
const memoryUtil = require('./memoryUtil');
// Any modules that you use that modify the game's prototypes should be require'd
// before you require the profiler.
const profiler = require('screeps-profiler');
const towerEngine = require('./towerEngine');



console.log("Gameloop" + Game.time);
//Debug mode memory flag to turn on/off debug mode to enable some more intensive debugging features of beepbot.
var debugMode = true;

//every 100 ticks we flush the creep memory.
if(Game.time % 100 == 0) {
    memoryUtil.removeDeadCreepMem();
}
towerEngine.globalTower();


// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function() {
  profiler.wrap(function() {
    //main.js { 

    //If RoomVisualData is initalized, then we can use it to draw some visual data to the screen.
    if (Memory.RoomVisualData != undefined) {
        if(Memory.RoomVisualData.length > 0) {
            for(const roomName in Memory.RoomVisualData) {
                Game.rooms[roomName].visual.import(Memory.RoomVisualData[roomName]);
            }
        }
    } else {
        Memory.RoomVisualData = {};
    }
    // if the debug mode isn't in memory then set it to the current hard value.
    if(Memory.debug == undefined) {
        Memory.debug = debugMode;
    }
    // Set the debug mode to the memory flag if it's not set to the same hard value.
    if(Memory.debug != debugMode) {
        Memory.debug = debugMode;
    }
    if(Memory.mainRoom == undefined) {
        //find the main spawn room.
        var mainSpawn = room.find(FIND_MY_SPAWNS)[0];
        Memory.mainRoom = mainSpawn.room.name;
        buildEngine.initializeClaimedRoomMemory(room);
        miningEngine.initializeSourcesInClaimedRooms(room);
    }
        //get the rooms adjacent to the main spawn room
    if(Memory.mainRoom != undefined) {
        // var mainRoom = Game.rooms[Memory.mainRoom];
        // var adjacentRooms = roomEngine.getAdjacentRooms(mainRoom);
        // mainRoom.memory.adjacentRooms = adjacentRooms;
        //for each adjacent room, initialize the room in the mining engine
        // adjacentRooms.forEach((room) => {
        //         miningEngine.initializeSourcesInClaimedRooms(room);
        // });
    }

    for (const roomID in Game.rooms) {
        var room = Game.rooms[roomID];

        //if main room name is not in memory then set it to the main spawn room.



        miningEngine.runEngine(room);
        //every other tick we try to saturate the room to the level of the controller.
        if(Game.time % 10 == 0) {
            buildEngine.saturateToLevel(room);
        }

        //for all claimed rooms, set it's sign to something beepy.
        for(const roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if(room.controller.my) {
                room.visual.text("Beepbot", 0, 0, {align: 'left', opacity: 0.8});

            }
        }
        //store room Visual Data


        //for every room that has the status of 'respawn' or 'novice', feed it to the roomEngines room viability calculation. and store it's score in the room's memory, only calculate once.
        // if(Game.map.getRoomStatus(room.name).status != undefined || Game.map.getRoomStatus(room.name).status == 'respawn' || Game.map.getRoomStatus(room.name).status == 'novice' || Game.map.getRoomStatus(room.name).status == 'normal') {
        //     if(room.memory.viability == undefined) {
        //         var score = roomEngine.calculateRoomViability(room);
        //         room.memory.viability = score;
        //     }
        // } 
    }   

    for(const spawnHash in Game.spawns) {
        spawnBehavior.run(Game.spawns[spawnHash]);
    }
    for(const creepHash in Game.creeps) {   
        //aggregate all roles of all alive creeps
        var roles = _.map(Game.creeps, (creep) => { return creep.memory.role; });
        //take the array of roles and count the number of times each role appears on an alive creep
        var roleCounts = _.countBy(roles);
        Memory.creepTally = roleCounts;
        
        //if the creep is a harvester, only run every other tick.
        creep.runFromRole(Game.creeps[creepHash]);
    }

    //Persist Visuals to the Memory
    for(const roomID in Game.rooms) {
        Memory.RoomVisualData[roomID] = Game.rooms[roomID].visual.export();
    }

    var flushvisuals = function() {
        Memory.RoomVisualData = undefined;
    }
});
};