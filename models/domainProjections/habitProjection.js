const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HabitProjectionSchema = new Schema({
    habitUuid: {
        type: String,
        required: true,
        unique: true
    },
    currentDailyStreak: {
        type: Number,
        required: true,
        default: 0
    },
    lastCheckin: {
        type: Date
    }
    // TODO: Add a way of keeping track of which events we have processed so far and which we haven't
});

const HabitProjection = mongoose.model("HabitProjection", HabitProjectionSchema);

// make some methods? Nah, have that in an external file
// and then create it in the database based off of that

module.exports = HabitProjection;