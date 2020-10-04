const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minlength: 1,
        },
        lastName: {
            type: String,
            minlength: 1,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            minlength: 6,
            maxlength: 1024,
        },
        role: {
            type: String,
            default: 'manager',
            enum: ['manager', 'admin'],
        },
        verified: { type: Boolean, default: false },
        passwordToken: String,
        passwordTokenExpires: Date,
        googleId: String,
        microsoftId: String,
    },
    { timestamps: true },
);

const Users = mongoose.model('Users', usersSchema);

exports.Users = Users;
