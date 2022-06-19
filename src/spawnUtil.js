//jshinter esversion: 6

/**
 * The spawn module, defines Spawn behavior.
 * @module spawn
 */


const buildEngine = require("./buildEngine");
const creepUtil = require("./creepUtil");
const harvester = require("./harvester");
const builder = require("./builder");

module.exports = {
    /**
     * 
     * @param {StructureSpawn} spawn 
     */
    run(spawn) {
        Memory.lastProcessedSpawn = spawn;
        //initialize spawn memory
        //TODO: figure out how to more sanely recognize a uninitialized spawn
        if (spawn.memory.queue == null) {
            spawn.memory.queue = [];
        }

        //Bootstrap flag
        //room the spawn is in
        let room = spawn.room;

        var numOfHarvestersInRoom = _.sum(Game.creeps, (creep) => creep.memory.role == "harvester" && creep.room.name == spawn.room.name);
        var numOfBuildersInRoom = _.sum(Game.creeps, (creep) => creep.memory.role == "builder" && creep.room.name == spawn.room.name);
        var numOfHarvestersQueued = _.sum(spawn.memory.queue, (str) => str == "harvester");
        var numOfBuildersQueued = _.sum(spawn.memory.queue, (str) => str == "builder");
        var numOfQueued = spawn.memory.queue.length;
        var numofContainersInRoom = _.sum(Game.structures, (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.room.name == spawn.room.name);
        var numOfMaintainersInRoom = _.sum(Game.creeps, (creep) => creep.memory.role == "maintainer" && creep.room.name == spawn.room.name);
        var numOfMaintainersQueued = _.sum(spawn.memory.queue, (str) => str == "maintainer");
        var numOfRepairersInRoom = _.sum(Game.creeps, (creep) => creep.memory.role == "repairer" && creep.room.name == spawn.room.name);
        var numOfRepairersQueued = _.sum(spawn.memory.queue, (str) => str == "repairer");
        var numOfBasicDefendersInRoom =  _.sum(Game.creeps, (creep) => creep.memory.role == "defenderBasic" && creep.room.name == spawn.room.name);
        var numOfBasicDefendersQueued = _.sum(spawn.memory.queue, (str) => str == "defenderBasic");
        var numOfHaulersInRoom = _.sum(Game.creeps, (creep) => creep.memory.role == "hauler" && creep.room.name == spawn.room.name);
        var numOfHaulersQueued = _.sum(spawn.memory.queue, (str) => str == "hauler");


        var numOfFreeSourceSpaces = 0;
        //Number of source spaces in the room
        if(room.memory.sourcesSpace != undefined) {
            for(var source in room.memory.sourcesSpace) {
                numOfFreeSourceSpaces += room.memory.sourcesSpace[source];
            }
        }


        new RoomVisual(spawn.pos.roomName).text("Queue: " + numOfQueued, new RoomPosition(spawn.pos.x , spawn.pos.y + 1, spawn.pos.roomName) , {color: 'white'});

        spawn.memory.mode = "normal";
        
            // if(numOfHarvestersInRoom + numOfHarvestersQueued <= 5 ) {
            //     console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has less than 2 harvesters, requesting more");
            //     this.registerCreate(spawn, 'harvester');
            // }
            //queue enough harvesters to fill every source space in the room
            if(numOfHarvestersInRoom + numOfHarvestersQueued < numOfFreeSourceSpaces) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has less than " + numOfFreeSourceSpaces + " harvesters, requesting more");
                this.registerCreate(spawn, 'harvester');
            }
            // queue haulers up to half the number of harvesters that the room would queue
            if(numOfHaulersInRoom + numOfHaulersQueued < numOfFreeSourceSpaces ) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has less than " + numOfFreeSourceSpaces / 2 + " haulers, requesting more");
                this.registerCreate(spawn, 'hauler');
            }
            
            if(spawn.room.controller.level == 1 && numOfBuildersInRoom + numOfBuildersQueued <= 2 ) {
                    console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has less than 2 builders, requesting more");
                    this.registerCreate(spawn, 'builder');
            }
            if (spawn.room.controller.level == 2 && numOfBuildersInRoom + numOfBuildersQueued <= 2 ) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has less than 1 builder, requesting more");
                this.registerCreate(spawn, 'builder');
            }
            // if room level is 1 and there are no repairers, request a repairer
            if (spawn.room.controller.level >= 1 && numofContainersInRoom >= 1 && numOfRepairersInRoom + numOfRepairersQueued <= 0 ) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has no repairers, requesting more");
                this.registerCreate(spawn, 'repairer');
            }
            //If we have a container queue a maintainer
            if(numOfMaintainersInRoom + numOfMaintainersQueued < 2) 
            {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has more than 1 container, requesting maintainer");
                this.registerCreate(spawn, 'maintainer');
            }
            //if there's any enemies in the room spawn some defenders
            // if(spawn.room.find(FIND_HOSTILE_CREEPS).length > 0 && numOfBasicDefendersInRoom + numOfBasicDefendersQueued < 2) {
            //     console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has enemies, requesting defenders");
            //     this.registerCreate(spawn, 'defenderBasic');
            // }

            //if room level is 2 or higher, queue a repairer
            if(spawn.room.controller.level >= 2 && numOfRepairersInRoom + numOfRepairersQueued < 3) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has room level of " + spawn.room.controller.level + ", requesting repairer");
                this.registerCreate(spawn, 'repairer');
            }
            if(spawn.room.controller.level >= 2 && numOfBasicDefendersInRoom + numOfBasicDefendersQueued < -1) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has room level of " + spawn.room.controller.level + ", requesting basic defender");
                this.registerCreate(spawn, 'defenderBasic');
            }
        //if theres enemies in the room, queue a defender if there's more then 3 enemies
        if(spawn.room.find(FIND_HOSTILE_CREEPS).length > 3 && numOfBasicDefendersInRoom + numOfBasicDefendersQueued < 5) {
            this.registerCreate(spawn, 'defenderBasic');
        }


           
        if(numOfQueued > 0) {
            console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has " + numOfQueued + " queued");
            spawn.memory.mode = "hasQueue";
        } else {
            spawn.memory.mode = "normal";
        }

        // If we're over half saturation, queue allow builders to access spawn energy, only for level 1 rooms
        if((numOfHarvestersInRoom + numOfHaulersInRoom) /2  > numOfFreeSourceSpaces / 2 && numofContainersInRoom <= 2 && spawn.room.controller.level == 1) {
            spawn.memory.mode = "normal";
        }
        //Spawn behavior

        if(this.canCreateCreep(spawn)) {
            //for every entry in the queue, get the roles priorty lower is better, undefined is always last.
            var queue = spawn.memory.queue;
            //sort by priorty
            spawn.memory.queue = _.sortBy(queue, (str) => {
                creepUtil.getPriorityByRole(str);
            });
            this.spawnNextInQueue(spawn);
        }

    },

    registerCreate(spawn, role) {
        //register new creep type to be created
         spawn.memory.queue.push(role);
    },

    hasQueuedCreep(spawn) {
        //check if there is a creep in the queue for this spawn
        return spawn.memory.queue.length > 0 ;
    },

    /**
     * Check if a spawn is able to create a creep.
     * @param {StructureSpawn} spawn the Spawn to check if able to create a creep
     * @returns 
     */
    canCreateCreep(spawn){
        return spawn.spawning == null;
    },


    
    /**
     * Refresh a requesting creep. This is called when a creep asks to not die to timeout.
     * @param {StructureSpawn} spawn 
     * @param {Creep} creep 
     */


    /**
     * 
     * @param {StructureSpawn} spawn 
     */
    spawnNextInQueue(spawn) {
        //spawn the next creep in the queue

        if(this.hasQueuedCreep(spawn) && this.canCreateCreep(spawn) ) {
            var qRole = spawn.memory.queue[0];
            var result = spawn.spawnCreep(creepUtil.bodyFromRole(qRole), 
                "Creep" + Game.time + "_" + qRole,{
                    memory: {
                        role: qRole,
                        spawnID: spawn.id, //remember the spawn id that created this creep
                    }
                }); 
            if(result == OK) {
                spawn.memory.queue.shift();
            }
            else if (result == ERR_INVALID_ARGS) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Invalid arguments");
            }
            else if(result == ERR_NOT_ENOUGH_ENERGY) {
            }
            else if(result == ERR_BUSY) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Busy");
            }
            else if(result == ERR_NOT_ENOUGH_RESOURCES) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Not enough resources");
            }
            else if(result == ERR_RCL_NOT_ENOUGH) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " RCL not enough");
            }
        }

    }

}