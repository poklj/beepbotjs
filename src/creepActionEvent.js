const creepUtil = require("./creepUtil");
const creep = require("./creepUtil");

/**
 * Definition of a creep action event,
 * @param {Creep} creep creep to perform action with
 * @param {string} actionType Type of action to be performed.
 * @param {any} target Target of action, can be a room position, room object, or creep object.
 * @param {Array} args Arguments to be passed to action.
 */
class Action {
    constructor(creep, action, target, args) {
        this.creepID = creep.id;
        this.action = action;
        this.target = target;
        this.args = args;
    }
    
    run(creep) {
        console.log("CreepAction at " + Game.time + "in " + creep.room  + " | " +  creep.na + ' ' + this.action.type + ' ' + this.target.id);
        if (this.action.type == 'move') {
            creep.moveTo(this.target);
        }
        else if (this.action.type == 'harvest') {
            creep.harvest(this.target);
        }
        else if (this.action.type == 'transfer') {
            if(this.args.resourceType == RESOURCE_ENERGY) { //TODO: replace this with a check that we're trying to transfer something thats transferable
                creep.transfer(this.target, this.args.resourceType);
            }
        }
        else if (this.action.type == 'build') {
            // Behavior if we attempt to build but can't... see: https://docs.screeps.com/simultaneous-actions.html for the strange creep execution behavior
            var buildAttempt = creep.build(this.target);
            if(buildAttempt == ERR_NOT_IN_RANGE) {
                creep.moveTo(this.target);
            }
            else if(buildAttempt == ERR_INVALID_TARGET) {
                creep.say('Invalid target');
                console.error('Creep ' + creep.name + ' tried to build an invalid target');
            }
            else if(buildAttempt == ERR_NOT_ENOUGH_RESOURCES) {
                creep.say('Not enough resources');
                console.error('Creep ' + creep.name + ' tried to build but did not have enough resources');
            }
        }
        else if (this.action.type == 'upgrade') {
            creep.upgrade(this.target);
        }
        else if (this.action.type == 'repair') {
            creep.repair(this.target);
        }
        else if (this.action.type == 'withdraw') {
            creep.withdraw(this.target);
        }
        else if (this.action.type == 'drop') {
            creep.drop(this.target);
        }
        else if (this.action.type == 'pickup') {
            creep.pickup(this.target);
        }
        else if (this.action.type == 'attack') {
            creep.attack(this.target);
        }
        else if (this.action.type == 'ranged_attack') {
            creep.ranged_attack(this.target);
        }
        else if (this.action.type == 'heal') {
            creep.heal(this.target);
        }
        else if (this.action.type == 'ranged    _heal') {
            creep.ranged_heal(this.target); 
        }   
        else if (this.action.type == 'tough') {
            creep.tough(this.target);
        }
        else if (this.action.type == 'claim') {
            creep.claim(this.target);
        }
        else if (this.action.type == 'reserve') {
            creep.reserve(this.target);
        }
        else if (this.action.type == 'unclaim') {
            creep.unclaim(this.target);
        }
        else if (this.action.type == 'dismantle') {
            creep.dismantle(this.target);
        }
    }
}

module.exports ={
    Action,  
    execute(action, creep) {
        action.run(creep);
    }
}
