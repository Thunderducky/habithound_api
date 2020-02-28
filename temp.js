const mongoose = require("mongoose");
const moment = require("moment");
const uuidv4 = require("uuid/v4");
const chalk = require("chalk");
const db = require("./models");
const NEWLINE = "\n";
const SPACE = " "
const habitProjector = require("./projectors/habitProjector");

const _output = (colorFn, prefix, info) => {
    let finalInfo;
    if(Array.isArray(info)){
        console.log(colorFn(prefix), ...info)
    }
}
const wrapColor = (colorFn, prefix) => {
    return (...info) => {
        _output(colorFn, prefix, info)
    }
}



const log = {
    info: wrapColor(chalk.blue, "INFO"),
    success: wrapColor(chalk.green, "SUCCESS"),
    warn: wrapColor(chalk.yellow, "WARN"),
    error: wrapColor(chalk.red, "ERROR"),
    direct: (...results) => console.log(...results),
    newline: (newlines = 1) => NEWLINE.repeat(newlines),
    indent: (tabLength) => SPACE.repeat(tabLength)
}

const createTempUser = async (time = Date.now()) => {
    try {
        const userData = {
            uuid: uuidv4(),
            email: "test@example.com",
            password: "okokok",
            createdAt: time,
            updatedAt: time
        } 
        const user = new db.User(userData);
        return user.save();
    } catch(ex){
        log.error(`Issue caught in ${chalk.yellow("createTempUser")}`, ex);
        throw new Error(ex)
    }

}

const createTempHabit = async (userUuid, time = Date.now()) => {
    try {
        const habitData = {
            uuid: uuidv4(),
            userUuid,
            habitUuid: uuidv4(),
            habitText: "test habit",
            createdAt: time,
            updatedAt: time,
            version: 1
        };
        const uhce = new db.DomainEvents.UserHabitCreatedEvent(habitData);
        return uhce.save();
    } catch(ex){
        log.error(`Issue caught in ${chalk.yellow("createTempHabit")}`, ex);
        throw new Error(ex)
    }
}

const createTempHabitMark = async (habitUuid, time = Date.now()) => {
    const markData = {
        uuid: uuidv4(),
        version: 1,
        habitUuid,
        createdAt: time,
        updatedAt: time
    }
    const uhme = new db.DomainEvents.UserHabitMarkedEvent(markData);
    return uhme.save();
}

const createTempHabitProjection = async (habitUuid) => {
    const habitProjectionData = {
        habitUuid,
        currentDailyStreak: 0,
        lastCheckin: null
    };
    const habitProjection = db.DomainProjections.HabitProjection(habitProjectionData);
    return habitProjection.save();
}

const now = moment().valueOf();
const daysAgo = (days) => {
    return moment(now).subtract(days, "days").valueOf();
}


const minutes = (min) => min * 60 * 1000; // in milliseconds
log.newline();
log.info("Connecting to MongoDB")
log.newline();
mongoose.connect("mongodb://localhost/habithacker_test", { useNewUrlParser: true, useUnifiedTopology: true}).then(async () => {
    log.success("DB Connected");
    log.newline(2);
    log.direct("======= Initializing Database ==========")
    log.info("Clearing existing data");
    await db.User.deleteMany({});
    await db.DomainEvents.UserHabitCreatedEvent.deleteMany({});
    await db.DomainEvents.UserHabitMarkedEvent.deleteMany({});
    await db.DomainProjections.HabitProjection.deleteMany({});
    log.success("Database cleared!")

    log.info("Creating Data");
    const dbUser = await createTempUser(daysAgo(5));
    log.direct();
    log.info(
        "User: " + dbUser.uuid, log.newline(1), log.indent(3), 
        "CreatedAt: " + moment(dbUser.createdAt).toDate()
    );
    const dbHabitCreatedEvent = await createTempHabit(dbUser.uuid, daysAgo(5) + minutes(10));
    log.direct();
    log.info(
        "Habit ID: " + dbHabitCreatedEvent.habitUuid, log.newline(1), log.indent(3),
        "CreatedAt: " + moment(dbHabitCreatedEvent.createdAt).toDate()
    );
    log.direct();
    const dbHabitMarkEvent = await createTempHabitMark(dbHabitCreatedEvent.habitUuid, daysAgo(4) + minutes(20));
    log.info(
        "Habit Mark ID: " + dbHabitMarkEvent.uuid, log.newline(1), log.indent(3),
        "Habit ID: " + dbHabitMarkEvent.habitUuid, log.newline(1), log.indent(3),
        "CreatedAt: " + moment(dbHabitMarkEvent.createdAt).toDate(), NEWLINE
    );

    const dbHabitMarkEvent2 = await createTempHabitMark(dbHabitCreatedEvent.habitUuid, daysAgo(3) + minutes(10));
    log.info(
        "Habit Mark ID: " + dbHabitMarkEvent2.uuid, log.newline(1), log.indent(3),
        "Habit ID: " + dbHabitMarkEvent2.habitUuid, log.newline(1), log.indent(3),
        "CreatedAt: " + moment(dbHabitMarkEvent2.createdAt).toDate(), NEWLINE
    );
    const events = [dbHabitMarkEvent, dbHabitMarkEvent2];

    log.success("Created all necessary data")
    log.direct(NEWLINE, chalk.inverse("    LET'S RUN THEM THROUGH THE PROJECTOR    ", NEWLINE));

    const dbHabitProjection = await createTempHabitProjection(dbHabitCreatedEvent.habitUuid);
    log.info("Habit Projection (Non-domain) ID: ", dbHabitProjection._id)
    // Now let's try and actually process ther marks and check what they are at each stage
    log.info("Starting Streak", dbHabitProjection.currentDailyStreak, "should be", 0);
    habitProjector.updateProjection(events, dbHabitProjection);
    log.info("Ending Streak", dbHabitProjection.currentDailyStreak, "should be ", 2);

    // Update our projection
    await dbHabitProjection.save();
    mongoose.connection.close();
})

