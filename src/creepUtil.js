// jshint esversion: 6
var harvester = require("./harvester");
var builder = require("./builder");
var maintainer = require("./maintainer");
var repairer = require("./repairer");
const defenderBasic = require("./defenderBasic");
const hauler = require("./hauler");

module.exports = {
    /**
     * Check tile delta, and return the time we've been standing still, store the last tile and stop time in creep memory
     * @param {Creep} creep
     * @returns {number}
     */

    tileDelta(creep) {
        if(creep.memory.stopTime == undefined) {
            creep.memory.stopTime = 0;
        }
        if(creep.memory.lastTile == undefined) {
            creep.memory.lastTile = creep.pos.y + "," + creep.pos.x + "," + creep.pos.roomName;
        }
        if(creep.memory.lastTile == creep.pos.y + "," + creep.pos.x + "," + creep.pos.roomName) {
            creep.memory.stopTime++;
        } else {
            creep.memory.stopTime = 0;
        }
        return creep.memory.stopTime;

    },

    bodyFromRole(role, spawn){
        if (role == "harvester") {
            return harvester.body;
        } else if(role == "builder") {
            return builder.body;
        } else if(role == "maintainer") {
            return maintainer.body;
        } else if(role == "repairer") {
            return repairer.body;
        } else if(role == "defenderBasic") {
            if(spawn) {
                //if spawn has extensions use the larger version of the body
                if(spawn.room.find(FIND_STRUCTURES, {filter: (structure) => {return structure.structureType == STRUCTURE_EXTENSION}}).length > 0) {
                    return defenderBasic.body;
                }
            }
            return defenderBasic.body;
        } else if(role == "hauler") {
            return hauler.body;
        } else if(role == "healer") {
            return healer.body;
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
        if(creepRole == "healer") {
            healer.run(creep);
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
        } else if(role == "healer") {
            priority = healer.priority;
        }

        return priority;
    }
}