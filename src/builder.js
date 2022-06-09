const buildEngine = require("./buildEngine");

module.exports = {
    role: 'builder',
    body: [MOVE,WORK,CARRY,CARRY],
    /**
     * 
     * @param {Creep} creep Creep to run
     */
    run(creep){
        //Creep behavior
        if(creep.store.energy == 0) {
            //pull energy from containers
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) || (structure.structureType == STRUCTURE_SPAWN) && structure.store.energy > 0;
                }});
            
            var closestContainer = creep.pos.findClosestByPath(containers);
            var canWithdraw = true;
            if (closestContainer == STRUCTURE_SPAWN) {
                //negotiate with the spawn to see if its alllowed to actually withdraw energy.. otherwise it will just sit there and wait
                canWithdraw = spawnUtil.canWithdraw(Game.spawns[closestContainer.id]);
            }
            //if the spawn is allowed to withdraw, then withdraw otherwise move to the container
            if(canWithdraw) {
                var withdrawAttempt = creep.withdraw(closestContainer, RESOURCE_ENERGY);
                if(withdrawAttempt == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestContainer);
                }
                
            } else {
                //if the spawn is not allowed to withdraw, then move to the container and wait for the spawn to allow it
                creep.say("Can't withdraw");
                creep.moveTo(closestContainer);
            }
        }
        else {
            var closestConstructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if(creep.build(closestConstructionSite) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestConstructionSite);
            }
        }
    }

}