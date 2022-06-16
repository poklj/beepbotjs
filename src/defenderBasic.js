// jshint esversion: 6

var handshakeActions = require("./handshakeActions");
module.exports = {
    bodySmall: [MOVE, TOUGH, ATTACK],
    body: [MOVE, MOVE, MOVE ,TOUGH, RANGED_ATTACK ,ATTACK, ATTACK],
    role: 'defenderBasic',
    priorty: 8, // TODO: make this a floating priority based on an contextual threat mode, so that if we need defenders we can boost them up or leave them if we don't need them.
    ticksToLive: -1, // amount of ticks to start attempting to renew
    /**
     * 
     * @param {Creep} creep 
     */
    run(creep) {

        //Creep keepalive
        if (creep.ticksToLive < -1) { //Disable keepalive on builders for now
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
        //if there's a flag named move, move to it
        if(Game.flags["move"] != undefined) {
            creep.moveTo(Game.flags["move"]);
        }
        //if there's an flag named attack move to it and attack
        if(Game.flags["attack"] != undefined) {
            creep.moveTo(Game.flags["attack"]);
            creep.attack(Game.flags["attack"]);
        }

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
        //If there's a flag marked as attack, move to the room and attack the flag


        //If we don't have a hostile creep, loiter nearby exits
        if(!nearestHostile && !Game.flags["attack"] && !Game.flags["move"]) {

            //nearests spawns
            var nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            var spawnPos = nearestSpawn.pos;

            var distanceFromSpawn = 8; // Distance to loiter from the spawn
            var angle = 4; // Angle to loiter around the spawn

            var x = spawnPos.x + Math.round(distanceFromSpawn * Math.cos(angle));
            var y = spawnPos.y + Math.round(distanceFromSpawn * Math.sin(angle));
            var loiterPos = new RoomPosition(x, y, spawnPos.roomName);

            new RoomVisual(creep.room.name).circle(loiterPos, {fill: 'red', radius: 1});

            
            creep.moveTo(loiterPos);
            return;
        }

    
    }
        
}