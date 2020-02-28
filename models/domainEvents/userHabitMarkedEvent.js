const mongoose = require("mongoose");
const BaseDomainEvent = require("./baseDomainEvent");

// TODO: Try out virtual stuff?
// Need to build relationships through this
const UserHabitMarkedEvent = BaseDomainEvent.discriminator('UserHabitMarkedEvent',
    new mongoose.Schema({
        habitUuid: {
            type: String,
            required: true
        }
    })
);

module.exports = UserHabitMarkedEvent;