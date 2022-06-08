/**
 * A task is a unit of work that can be executed by a creep.
 *  in the attempt to acomplish a goal it may not be able to, but this will resolve the correct solution to acomplish the goal.
 * 
 * The information about what a creep is trying to do is stored in the creep's memory.
 */
class Task {
    constructor(taskName) {
        this.taskName = taskName;
    }
    /**
     * 
}