const mongoose = require("mongoose");
const BaseDomainEvent = require("./baseDomainEvent");

const UserHabitCreatedEvent = BaseDomainEvent.discriminator('UserHabitCreatedEvent',
    new mongoose.Schema({
        habitUuid: {
            type: String,
            required: true,
            unique: true
        },
        userUuid: {
            type: String,
            required: true
        },
        habitText: {
            type: String,
            required: true
        }
    })
);

module.exports = UserHabitCreatedEvent;