/**
 * The spawn module, defines Spawn behavior.
 * @module spawn
 */


const creep = require("./creep");
const gamestate = require("./gamestate");
const harvester = require("./harvester");

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
            spawn.memory
        }

        console.log("SpawnBehavior" + Game.time + ": " + spawn.name);
        //Bootstrap flag
        if(Game.creeps.length <= 0 && spawn.memory.queue.length <= 0 || spawn.memory.mode == null) {
            console.log("Bootstrap");
            spawn.memory.mode = "bootstrap";
            if(!this.hasQueuedCreep(spawn)) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " has no queued creeps, requesting bootstrap creeps");
                //register two harvesters for creation
                this.registerCreate(spawn, harvester.body);
                this.registerCreate(spawn, harvester.body);
            }
        } else {

            console.log("Normal");
            spawn.memory.mode = "normal";
        }
        //Spawn behavior

        if(this.canCreateCreep(spawn)) {
            console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " can create creep");
            this.spawnNextInQueue(spawn);
        }

        //ingress for spawn behavior

    },

    registerCreate(spawn, body) {
        //register new creep type to be created
        console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Registering new creep type" + JSON.stringify(body));
        Memory.spawns[spawn.name].queue.push(body);

    },

    hasQueuedCreep(spawn) {
        //check if there is a creep in the queue for this spawn
        console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Checking if there is a creep in the queue, queue length: " + spawn.memory.queue.length);
        return spawn.memory.queue.length > 0;
    },

    /**
     * Check if a spawn is able to create a creep.
     * @param {Spawn} spawn the Spawn to check if able to create a creep
     * @returns 
     */
    canCreateCreep(spawn){
        console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Checking if spawn can create creep");
        return spawn.spawning == null;
    },
    
    spawnNextInQueue(spawn) {
        //spawn the next creep in the queue
        console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Spawning next creep in queue");
        if(this.hasQueuedCreep(spawn)) {
            var body = spawn.memory.queue[0];
            console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Spawning creep with body: " + JSON.stringify(body));
            var result = spawn.spawnCreep(body, 
                creep.identifyFromBody(body), 
                {
                    memory: {
                        role: creep.identifyFromBody(body)
                    }
                }); 
            if(result == OK) {
                console.log("SpawnBehavior" + Game.time + ": " + spawn.name + " Successfully spawned creep");
                spawn.memory.queue.pop()
            }
        }

    }

}