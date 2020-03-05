const moment = require("moment");
const { midnightsBetweenDates} = require("../utils/timeHelper");
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

        const midnights = midnightsBetweenDates(event.createdAt, lastCheckin);
        lastCheckin = event.createdAt;
         
         if(midnights === 1){   // it's the next day, bump our streak
             return streak + 1;
         } else if(midnights > 1){ // we missed a checkin, reset our streak
             return 1;
         } else { // it's been to early, filter this out
             return streak;
         }
    }, prevProjection.currentDailyStreak)

    // Update projection Stats
    prevProjection.lastCheckin = lastCheckin
    prevProjection.currentDailyStreak = currentDailyStreak;
}

module.exports = {
    updateProjection
};