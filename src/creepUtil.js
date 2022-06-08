
var harvester = require("./harvester");
var builder = require("./builder");

module.exports = {
    identifyFromBody(body){
        if (body == harvester.body) {
            return "harvester";
        } else if(body == builder.body) {
            return "builder";
        }
    },
    bodyFromRole(role){
        if (role == "harvester") {
            return harvester.body;
        } else if(role == "builder") {
            return builder.body;
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
    }
}