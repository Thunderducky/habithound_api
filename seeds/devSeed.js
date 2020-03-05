const mongoose = require("mongoose");
const moment = require("moment");
const uuidv4 = require("uuid/v4");
const chalk = require("chalk");
const db = require("../models");

const { log, NEWLINE } = require("./seedHelper");
const habitProjector = require("../projectors/habitProjector");

const factory = require("./factory");

// const createTempHabitProjection = async (habitUuid) => {
//     const habitProjectionData = {
//         habitUuid,
//         currentDailyStreak: 0,
//         lastCheckin: null
//     };
//     const habitProjection = db.DomainProjections.HabitProjection(habitProjectionData);
//     return habitProjection.save();
// }

// Small time helper to help keep the dates consistent
const now = moment().valueOf();
const daysAgo = (days) => {
    return moment(now).subtract(days, "days").valueOf();
}
const minutes = (min) => min * 60 * 1000; // in milliseconds

log.newline();
log.info("Connecting to MongoDB")
log.newline();
try {
mongoose.connect("mongodb://localhost/habithacker", { useNewUrlParser: true, useUnifiedTopology: true}).then(async () => {
    log.info("Clearing existing data");
    await db.User.deleteMany({});
    await db.DomainEvents.UserHabitCreatedEvent.deleteMany({});
    await db.DomainEvents.UserHabitMarkedEvent.deleteMany({});
    await db.DomainProjections.HabitProjection.deleteMany({});
    log.success("Database cleared!")

    log.info("Creating Data");

    // Create User
    const dbUser = await factory.createUser({ 
        time: daysAgo(5) 
    }).save();
    
    // Create Event - 5 days ago
    const dbHabitCreatedEvent = await factory.createUserHabitCreatedEvent({
        userUuid: dbUser.uuid,
        habitText: "example text",
        time: daysAgo(5) + minutes(10)
    }).save();

    // User marked the habit complete ~ 4 days ago
    const dbHabitMarkEvent = await factory.createUserHabitMarkedEvent({
        habitUuid: dbHabitCreatedEvent.habitUuid,
        time: daysAgo(4) + minutes(20)
    }).save()

    // User marked the habit completed ~ 3 days ago
    const dbHabitMarkEvent2 = await factory.createUserHabitMarkedEvent({
        habitUuid: dbHabitCreatedEvent.habitUuid,
        time: daysAgo(3) + minutes(10)
    }).save()

    // Create a projection
    const dbHabitProjection = await factory.createHabitProjection({
        userUuid: dbHabitCreatedEvent.userUuid,
        habitUuid: dbHabitCreatedEvent.habitUuid, 
        habitText: dbHabitCreatedEvent.habitText
    }).save();

    // Process Events
    const events = [dbHabitMarkEvent, dbHabitMarkEvent2];
    log.info("Starting Streak", dbHabitProjection.currentDailyStreak, "should be", 0);
    habitProjector.updateProjection(events, dbHabitProjection);
    log.info("Ending Streak", dbHabitProjection.currentDailyStreak, "should be ", 2);

    // Update our projection
    await dbHabitProjection.save();
    mongoose.connection.close();
})
} catch(err){
    console.log(err);
    mongoose.connection.close();
}

