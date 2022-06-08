
var harvester = require("./harvester");

module.exports = {
    identifyFromBody(body){
        let role = "";
        if (body == harvester.body) {
            role = "harvester";
        }

        return role;
    },
    runFromRole(creep){
        let creepRole = creep.memory.role;
        if (creepRole == "harvester") {
            harvester.run(creep);
        }
    }
}