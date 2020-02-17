const BaseDomainEvent = require("./baseDomainEvent");

const UserHabitMarkedEvent = BaseDomainEvent.discriminator('UserHabitMarkedEvent',
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
        }
    })
);

module.exports = UserHabitMarkedEvent;