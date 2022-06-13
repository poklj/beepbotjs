// jshint esversion: 6
var harvester = require("./harvester");
var builder = require("./builder");
var maintainer = require("./maintainer");
var repairer = require("./repairer");
const defenderBasic = require("./defenderBasic");
const hauler = require("./hauler");

module.exports = {
    bodyFromRole(role){
        if (role == "harvester") {
            return harvester.body;
        } else if(role == "builder") {
            return builder.body;
        } else if(role == "maintainer") {
            return maintainer.body;
        } else if(role == "repairer") {
            return repairer.body;
        } else if(role == "defenderBasic") {
            return defenderBasic.body;
        } else if(role == "hauler") {
            return hauler.body;
        }
    },

    /**
     * return the creep with the given id
     * @param {string} id
     * @returns {Creep} the creep with the given id or undefined if not found
     */
    getCreepById(id) {
        return _.filter(Game.creeps, (creep) => creep.id == id);
    },
    runFromRole(creep){
        let creepRole = creep.memory.role;
        if (creepRole == "harvester") {
            harvester.run(creep);
        }
        if(creepRole == "builder") {
            builder.run(creep);
        }
        if(creepRole == "maintainer") {
            maintainer.run(creep);
        }
        if(creepRole == "repairer") {
            repairer.run(creep);
        }
        if(creepRole == "defenderBasic") {
            defenderBasic.run(creep);
        }
        if(creepRole == "hauler") {
            hauler.run(creep);
        }

    },
    /**
     * return the priorty of a creep by it's role, if we don't have a priorty for a given role or the role isn't defined in this function, reutrn 99
     * @param {string} role
     * @returns {number} the priority of the role
     * @memberof creepUtil
     */
    getPriorityByRole(role) {
        var priority = 99;
        if (role == "harvester") {
            priority = harvester.priority;
        }
        if(role == "builder") {
            priority = builder.priority;
        }
        if(role == "maintainer") {
            priority = maintainer.priority;
        }
        if(role == "repairer") {
            priority = repairer.priority;
        }
        if(role == "defenderBasic") {
            priority = defenderBasic.priority;
        }
        if(role == "hauler") {
            priority = harvester.priority;
        }

        return priority;
    }
}