
var harvester = require("./harvester");
var builder = require("./builder");
var maintainer = require("./maintainer");
var repairer = require("./repairer");
const defenderBasic = require("./defenderBasic");

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
    },
}