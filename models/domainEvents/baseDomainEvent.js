const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// TODO: Make this Class unimplementable directly
const BaseDomainEventSchema = new Schema({
    uuid: {
        type: String,
        required: true,
        unique: true
    },
    version: {
        type: Number,
        required: true
    },
}, {
    timestamps: true, // gives us createdAt and updatedAt for free
    discriminatorKey: "etype"
});

const BaseDomainEvent = mongoose.model("DomainEvent", BaseDomainEventSchema);

module.exports = BaseDomainEvent;