
module.exports = {
    body: [MOVE, HEAL, HEAL, HEAL],
    role: 'repairer',
    priority: 4,
    /**
     * creep run function
     * @param {Creep} creep
     */
    run(creep) {

        //Find the nearest Combat creep and heal it (a combat creep is a creep with a role of 'defenderBasic' or 'defenderAdvanced')
        var nearestCombat = creep.pos.findClosestByRange(FIND_MY_CREEPS, 
            {filter: (creep) => creep.memory.role == 'defenderBasic' || creep.memory.role == 'defenderAdvanced'});
        if(nearestCombat) {
            if(creep.heal(nearestCombat) == ERR_NOT_IN_RANGE) {
                creep.moveTo(nearestCombat);
            }
        }
    }
}
