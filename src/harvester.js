


module.exports = {
    body: [WORK, CARRY, MOVE],
    role: 'harvester',
    /**
     * 
     * @param {Creep} creep 
     */
    run(creep){
        //Creep behavior
        //TODO: replace this a mining manager.... memory!

        if(creep.store.energy < creep.store.getCapacity()) {
            //harvest energy
            var sources = creep.room.find(FIND_SOURCES);
            var harvestAttempt = creep.harvest(sources[0]);
            if(harvestAttempt == ERR_NOT_IN_RANGE) {
                creep.say("moving to " + sources[0].id);
                creep.moveTo(sources[0]);
                Game.map.visual.line(creep.pos, sources[0].pos, {color: 'red'});
                console.log("Harvester" + Game.time + ": " + creep.name + " moving to source" + sources[0].id);
            }
            else if (harvestAttempt == OK) {
                creep.say("bonk");
            }
        } else {
            //carry energy to storage
            if(creep.room.storage != undefined) {
                if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }
            //if storage is full, go to spawn and transfer energy to spawn
            else {
                if(creep.transfer(creep.room.find(FIND_MY_SPAWNS)[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
                }
            }
        }
    }


}