const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

// TODO: Make this Class unimplementable directly
const UserSchema = new Schema({
    uuid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true, // gives us createdAt and updatedAt for free
});
// TODO: Better password validation
UserSchema.pre('save', async function(next){
    if(this.isModified('password') || this.isNew){
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
    }
});

UserSchema.methods.comparePassword = function(pass){
    return bcrypt.compare(pass, this.password)
}

const User = mongoose.model("User", UserSchema);

module.exports = User;