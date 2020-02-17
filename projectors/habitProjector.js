// Two flows
    // Augment existing projection
    // Build Projection from scratch


// Update projection
// CreateProjection from scratch
// Creating the model will be from OUTSIDE this part
// TODO: Check in about timestamps
/**
 * How many times has it been midnight between these two times
 * @param {Number} newCheckin Unix timestamp
 * @param {Number} prevCheckin Unix timestamp
 */
const midnightsSinceLastCheckin = (newCheckin, prevCheckin) => {
    //
}

/**
 * Add events to a projection
 * @param {DomainEvents[]} events uses the HabitCreated and HabitMarked events, processes them sequentially
 * @param {HabitProjection} prevProjection the previous HabitProjection Model
 */
const updateProjection = (events, prevProjection) => {
    const { habitUuid, lastCheckin } = prevProjection;
    let {lastCheckin} = prevProjection;
    const currentDailyStreak = events.reduce((event, streak) => {
         // count the midnights since last checkin
         const midnights = midnightsSinceLastCheckin(event.createdAt, lastCheckin);
         // update the last checkin
         lastCheckin = event.createdAt;
         
         if(midnights === 1){   // it's the next day, bump our streak
             return streak + 1;
         } else if(midnights > 1){ // we missed a checkin, reset our streak
             return 0;
         } else { // it's been to early, filter this out
             return streak;
         }
    }, currentDailyStreak)
}

module.exports = buildProjection;