module.exports = {

    body: [WORK, CARRY, MOVE],
    role: "harvester",
    run(creep){
        //Creep behavior
        //TODO: replace this a mining manager.... memory!

        if(creep.carry.energy < creep.carryCapacity) {
            //harvest energy
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
                console.log("Harvester" + Game.time + ": " + creep.name + " moving to source" + sources[0].id);
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
    },


}