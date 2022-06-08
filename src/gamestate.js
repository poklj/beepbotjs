/**
 * Helper functions to query the gamestate
 */

module.exports = {
    timeDeltaToCurrent(time){
        return time - Game.time;
    },

    currentCreepAmount(){
        return Game.creeps;
    }

}