var handshakeActions = require("./handshakeActions");
module.exports = {
    body: [MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, ATTACK, ATTACK, HEAL],
    role: 'defenderBasic',
    priorty: 8, // TODO: make this a floating priority based on an contextual threat mode, so that if we need defenders we can boost them up or leave them if we don't need them.
    /**
     * 
     * @param {Creep} creep 
     */
    run(creep) {

        //Creep keepalive
        if (creep.ticksToLive < 100) {
            creep.say("I'm dying");
            var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            creep.moveTo(nearestSpawn);
            //Dump energy into the spawn to prevent death from timeout
            if(creep.store.energy > 0) {
                creep.transfer(nearestSpawn, RESOURCE_ENERGY);
                creep.memory.mode = "";
            }
            handshakeActions.refreshMe(nearestSpawn, creep);
            return; //don't do anything else if we're dying (this is a hack) 
        }
        //Find the nearest hostile creep only in the room the creep is in
        var nearestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
            filter: (hostile) => {
                return hostile.room.name == creep.room.name;
            }
        });

        if(nearestHostile) {
            creep.moveTo(nearestHostile);
            //if the creep is in range, attack it
            creep.rangedAttack(nearestHostile);
            creep.attack(nearestHostile);
            //Heal any adjacent creeps only if they are hurt and we are next to them (This is if we are ranging can we do this, see simultanous actions) 
            var adjacentCreeps = creep.pos.findInRange(FIND_MY_CREEPS, 1);
            for(var i in adjacentCreeps) {
                if(adjacentCreeps[i].hits < adjacentCreeps[i].hitsMax) {
                    creep.heal(adjacentCreeps[i]);
                }
            }

        }

    }
        
}