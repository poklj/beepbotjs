module.exports = {

    /**
     * remove ALL memory in its entirety.
     */
    wipeAllMemory() {
        Memory = {};
    },
    removeDeadCreepMem(){
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                Memory.creeps[name] = undefined;
            }
        }
    }
};