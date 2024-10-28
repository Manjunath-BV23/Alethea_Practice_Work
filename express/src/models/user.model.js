const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Email is invalid'],
    },
    age: {
        type: Number,
        min: [0, 'Age cannot be negative'],
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
