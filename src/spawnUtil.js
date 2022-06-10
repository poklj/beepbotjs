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

        console.log("SpawnBehavior" + Game.time + ": " + spawn.name);
        //Bootstrap flag

        var numOfHarvestersInRoom = _.sum(Game.creeps, (creep) => creep.memory.role == "harvester" && creep.room.name == spawn.room.name);
        var numOfBuildersInRoom = _.sum(Game.creeps, (creep) => creep.memory.role == "builder" && creep.room.name == spawn.room.name);
        var numOfHarvestersQueued = _.sum(spawn.memory.queue, (str) => str == "harvester");
        var numOfBuildersQueued = _.sum(spawn.memory.queue, (str) => str == "builder");
        var numOfQueued = spawn.memory.queue.length;
        var numofContainersInRoom = _.sum(Game.structures, (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.room.name == spawn.room.name);
        var numOfMaintainersInRoom = _.sum(Game.creeps, (creep) => creep.memory.role == "maintainer" && creep.room.name == spawn.room.name);
        var numOfMaintainersQueued = _.sum(spawn.memory.queue, (str) => str == "maintainer");

        Game.map.visual.text("Queue: " + numOfQueued, new RoomPosition(spawn.pos.x , spawn.pos.y + 1, spawn.pos.roomName) , {color: 'white'});

        console.log("Harvesters: " + numOfHarvestersInRoom + " Queued: " + numOfHarvestersQueued);
        console.log("Builders: " + numOfBuildersInRoom + " Queued: " + numOfBuildersQueued);
        spawn.memory.mode = "normal";
        
            if(numOfHarvestersInRoom + numOfHarvestersQueued <= 5 ) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has less than 2 harvesters, requesting more");
                this.registerCreate(spawn, 'harvester');
            }
            if(numOfBuildersInRoom + numOfBuildersQueued <= 2 ) {
                    console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has less than 2 builders, requesting more");
                    this.registerCreate(spawn, 'builder');
            }
            //If we have a container queue a maintainer
            if(numofContainersInRoom > 1 && numOfMaintainersInRoom + numOfMaintainersQueued == 0) 
            {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has more than 1 container, requesting maintainer");
                this.registerCreate(spawn, 'maintainer');
            }

        if(numOfQueued > 0) {
            console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has " + numOfQueued + " queued");
            spawn.memory.mode = "hasQueue";
        } else {
            spawn.memory.mode = "normal";
        }
        //Spawn behavior

        if(this.canCreateCreep(spawn)) {
            console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " can create creep");
            this.spawnNextInQueue(spawn);
        }

        //ingress for spawn behavior

    },

    registerCreate(spawn, role) {
        //register new creep type to be created
        console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Registering new creep role to spawn" + JSON.stringify(role));
        spawn.memory.queue.push(role);

    },

    hasQueuedCreep(spawn) {
        //check if there is a creep in the queue for this spawn
        console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Checking if there is a creep in the queue, queue length: " + spawn.memory.queue.length);
        return spawn.memory.queue.length > 0 ;
    },

    /**
     * Check if a spawn is able to create a creep.
     * @param {StructureSpawn} spawn the Spawn to check if able to create a creep
     * @returns 
     */
    canCreateCreep(spawn){
        console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Checking if spawn can create creep");
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
        console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " attempting to spawn next creep in queue");
        if(this.hasQueuedCreep(spawn) && this.canCreateCreep(spawn) ) {
            var qRole = spawn.memory.queue[0];
            console.log("SpawnBehavior" + Game.time + ": " + spawn.name + "attempting Spawning creep with role: " + JSON.stringify(qRole) + "with body: " + JSON.stringify(creepUtil.bodyFromRole(qRole)));
            var result = spawn.spawnCreep(creepUtil.bodyFromRole(qRole), 
                "Creep" + Game.time + "_" + qRole,{
                    memory: {
                        role: qRole,
                    }
                }); 
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Spawning result: " +   result.toString());
            if(result == OK) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Successfully spawned creep");
                spawn.memory.queue.shift();
            }
            else if (result == ERR_INVALID_ARGS) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Invalid arguments");
            }
            else if(result == ERR_NOT_ENOUGH_ENERGY) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Not enough energy");
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