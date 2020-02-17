const BaseDomainEvent = require("./baseDomainEvent");

const UserHabitCreatedEvent = BaseDomainEvent.discriminator('UserHabitCreatedEvent',
    new mongoose.Schema({
        habit_uuid: {
            type: String,
            required: true,
            unique: true
        },
        user_uuid: {
            type: String,
            required: true,
            unique: true
        },
        habit_text: {
            type: String,
            required: true
        }
    })
);

module.exports = UserHabitCreatedEvent;