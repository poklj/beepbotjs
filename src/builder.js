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
            if(creep.withdraw(closestContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
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