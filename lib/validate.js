const Joi = require('joi');
const utils = require('./utils');

function validateEmailAndPassword({ email, password, confirmPassword }) {
    if (!utils.isValidateEmail(email)) {
        return {
            status: 422,
            message: 'Email is not a valid email.',
            type: 'email',
        };
    }

    if (!utils.validatePassword(password)) {
        return {
            status: 225,
            message:
                'Password must be 6 to 32 characters and it must contain at least one number, one uppercase and one lowercase letter.',
            type: 'password',
        };
    }

    if (confirmPassword !== password) {
        return {
            status: 226,
            message: 'Password and password confirmation do not match.',
            type: 'password',
        };
    }

    return null
}

function validateLogin(user) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    const { error } = schema.validate(user);
    return error && error.details ? error.details[0].message : '';
}

function validateUser(user) {
    const schema = Joi.object({
        firstName: Joi.string().min(3).max(50).required(),
        lastName: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().min(5).max(50).required(),
        role: Joi.string(),
        password: Joi.string().min(6).max(32).required(),
        confirmPassword: Joi.string().min(6).max(32),
    }).with('password', 'confirmPassword');

    const { error } = schema.validate(user);
    return error && error.details
        ? {
              message: error.details[0].message,
              type: error.details[0].path[0],
          }
        : null;
}

function validateNewPassword(user) {
    const schema = Joi.object({
        email: Joi.string().email().min(5).max(50).required(),
        password: Joi.string().min(6).max(32).required(),
        confirmPassword: Joi.string().min(6).max(32),
        token: Joi.string().required(),
    }).with('password', 'confirmPassword');

    const { error } = schema.validate(user);
    return error && error.details ? error.details[0].message : '';
}

function validateOauth(user) {
    const schema = Joi.object({
        email: Joi.string().email().min(5).max(50).required(),
        firstName: Joi.string(),
        lastName: Joi.string(),
        oauthId: Joi.string().required(),
        oauth: Joi.string().required(),
    });

    const { error } = schema.validate(user);
    return error && error.details ? error.details[0].message : '';
}

module.exports = {
    validateEmailAndPassword,
    validateUser,
    validateLogin,
    validateNewPassword,
    validateOauth,
};
