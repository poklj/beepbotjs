// made to prevent circular references in both creepUtil and spawnUtil. This is a hack. I should fix them both.

module.exports = {
     /**
     * Have a creep request that a spawn renew it's life
     * @param {StructureSpawn} spawn 
     * @param {Creep} creep 
     */
    refreshMe(spawn, creep){
        spawn.renewCreep(creep);
    },
        
}