// The factory doesn't persist things to the database, it just helps make them
const uuidv4 = require("uuid/v4");

const db = require("../models");

const makeRandomString = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Create a user model, does not persist it to the database
 * @param {Object} options all the options for the new user
 * @param {string} options.email - Specify the email of the user, must be unique
 * @param {string} options.passwrd - Defaults to okokok
 * @param {number} options.time - Defaults to Date.now()
 */
const createUser = (options = {}) => {
    const {
        email = `${makeRandomString()}@example.com`,
        password = "okokok",
        time = Date.now()
    } = options;

    return new db.User({
        uuid: uuidv4(),
        email,
        password,
        createdAt: time,
        updatedAt: time
    });
};

/**
 * Create a UserHabitCreatedEvent
 * @param {Object} options all the options for the new UserHabitCreatedEvent
 * @param {string} options.userUuid **required** the user who created the event
 * @param {string} options.habitText the text, random if not included
 * @param {number} options.time when the user event got created (Unix Time)
 */
const createUserHabitCreatedEvent = (options) => {
    if(!options.userUuid){
        throw new Error("options.userUuid cannot be null");
    }
    const {
        userUuid,
        habitText = makeRandomString(),
        time = Date.now()
    } = options;

    return new db.DomainEvents.UserHabitCreatedEvent({
        eventUuid: uuidv4(),
        habitUuid: uuidv4(),
        
        userUuid,
        habitText,
        createdAt: time,
        updatedAt: time,
        version: 1
    });
};
/**
 * Create a UserHabitMarkedEvent
 * @param {Object} options all the options for the new UserHabitCreatedEvent
 * @param {string} options.habitUuid **required** the habit being marked
 * @param {number} options.time when the user event got created (Unix Time)
 * @returns {UserHabitMarkedEvent}
 */
const createUserHabitMarkedEvent = (options = {}) => {
    const {
        habitUuid,
        time
    } = options;
    return new db.DomainEvents.UserHabitMarkedEvent({
        eventUuid: uuidv4(),

        habitUuid,
        createdAt: time,
        updatedAt: time,
        version: 1
    })
}
/**
 * Create a HabitProjection
 * @param {Object} options all the options for the new UserHabitCreatedEvent
 * @param {string} options.habitUuid **required** the habit being marked
 * @param {string} options.habitText **required** the text, 
 * @returns {HabitProjection}
 */
const createHabitProjection = (options = {}) => {
    const {
        userUuid,
        habitText,
        habitUuid
    } = options;
    if(!habitUuid){
        throw new Error("Projection must have a habitUuid");
    }
    if(!habitText){
        throw new Error("Projection must have habitText");
    }
    if(!userUuid){
        throw new Error("Projection must have a userUuid");
    }
    return db.DomainProjections.HabitProjection({
        habitUuid,
        habitText,
        userUuid,
        currentDailyStreak: 0,
        lastCheckin: null
    })
}

module.exports = {
    createUser,
    createUserHabitCreatedEvent,
    createUserHabitMarkedEvent,
    createHabitProjection
}