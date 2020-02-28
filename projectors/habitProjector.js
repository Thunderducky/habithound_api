const moment = require("moment");
// TODO: Move this into a utils folder and add some tests
/**
 * How many times has it been midnight between these two times
 * @param {Number} newCheckin Unix timestamp
 * @param {Number} prevCheckin Unix timestamp
 */
const midnightsSinceLastCheckin = (newCheckin, prevCheckin) => {
    // console.log(newCheckin, prevCheckin);
    // const start = moment(prevCheckin).startOf("day");
    // console.log("START", start.toDate());
    // return moment(start).diff(newCheckin, "hours")
    const beginningOfPrevDay = moment(prevCheckin).startOf("day");
    const nextDay = moment(newCheckin);
    return moment(nextDay).diff(beginningOfPrevDay, "day")
}

/**
 * Add events to a projection
 * @param {DomainEvents[]} events uses the HabitCreated and HabitMarked events, processes them sequentially
 * @param {HabitProjection} prevProjection the previous HabitProjection Model
 */
const updateProjection = (events, prevProjection) => {
    const { habitUuid } = prevProjection;
    let {lastCheckin} = prevProjection;
    const currentDailyStreak = events.reduce((streak, event) => {
        if(!lastCheckin){
            lastCheckin = event.createdAt;
            return 1; // if there is no last checkin this is the beginning of the streak
        } 

        const midnights = midnightsSinceLastCheckin(event.createdAt, lastCheckin);
        lastCheckin = event.createdAt;
         
         if(midnights === 1){   // it's the next day, bump our streak
             return streak + 1;
         } else if(midnights > 1){ // we missed a checkin, reset our streak
             return 0;
         } else { // it's been to early, filter this out
             return streak;
         }
    }, prevProjection.currentDailyStreak)
    // Update projection Stats
    prevProjection.lastCheckin = lastCheckin
    prevProjection.currentDailyStreak = currentDailyStreak;
}

module.exports = {
    updateProjection,
    midnightsSinceLastCheckin
};