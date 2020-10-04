const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { Users } = require('../../models/users');
const utils = require('../../lib/utils');
const emails = require('../../lib/email');
const {
    validateLogin,
    validateEmailAndPassword,
    validateNewPassword,
    validateOauth,
} = require('../../lib/validate');
const { generateAccessToken } = require('../../middlewares/auth');
const config = require('../../config/config');

login = (req, res, next) => {
    const { email, password } = req.body;

    const err = validateLogin({ email, password });
    if (err) {
        return res.status(422).json({ errors: [{ message: err }] });
    }

    if (!utils.isValidateEmail(email)) {
        return res
            .status(401)
            .json({ message: 'Email is not a valid email.', type: 'email' });
    }
    Users.findOne({ email })
        .then((user) => {
            if (!user) {
                return res
                    .status(401)
                    .json({ message: 'Incorrect email', type: 'email' });
            }

            if (!utils.checkPassword(password, user.password)) {
                return res
                    .status(401)
                    .json({ message: 'Incorrect password.', type: 'password' });
            }

            if (!user.verified) {
                return res.status(403).json({
                    message: 'Your email address is not verified.',
                    type: 'verified',
                });
            }

            const { firstName, lastName } = user;
            const token = generateAccessToken({
                email,
                firstName,
                lastName,
            });
            return res.json({ token });
        })
        .catch((error) => next(error));
};

register = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            role = 'manager',
        } = req.body;
        const newUser = new Users({
            firstName,
            lastName,
            email,
            role,
            password: utils.generatePassword(password),
            passwordToken: crypto.randomBytes(32).toString('hex'),
            passwordTokenExpires: utils.addHoursToDateNow(1),
        });

        const user = await newUser.save();

        const transporter = nodemailer.createTransport(
            sendgrid({
                auth: {
                    api_key: config.SEND_GRID_API_KEY,
                },
            }),
        );

        const mailOptions = emails.verification(user.email, user.passwordToken);
        await transporter.sendMail(mailOptions, async function (err) {
            if (err) {
                await Users.findByIdAndRemove(user._id);
                return res.status(500).send({
                    message: 'Something went wrong.',
                    err: err.message,
                });
            }
            return res.status(200).send({
                message: `A verification email has been sent to ${user.email}.`,
            });
        });
    } catch (error) {
        return next(error);
    }
};

verifiedEmail = async (req, res, next) => {
    try {
        const user = await Users.findOne({ passwordToken: req.body.token });
        if (!user) {
            return res.status(400).send({
                message: 'We were unable to find a user for this token.',
            });
        }
        if (user.verified) {
            return res
                .status(400)
                .send({ message: 'This user has already been verified.' });
        }
        if (
            utils.getMillisecondsByDate(user.passwordTokenExpires) < Date.now()
        ) {
            return res.status(400).send({ message: 'Token expired.' });
        }

        user.passwordToken = undefined;
        user.passwordTokenExpires = undefined;
        user.verified = true;
        await user.save();

        return res.json({ message: 'Email verified.' });
    } catch (e) {
        return next(e);
    }
};

sendPasswordToken = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!utils.isValidateEmail(email)) {
            return res
                .status(400)
                .json({ message: 'Email is not a valid email.' });
        }

        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        const transporter = nodemailer.createTransport(
            sendgrid({
                auth: {
                    api_key: config.SEND_GRID_API_KEY,
                },
            }),
        );

        user.passwordToken = crypto.randomBytes(32).toString('hex');
        user.passwordTokenExpires = utils.addHoursToDateNow(1);
        user.save();

        let mailOptions = emails.verification(user.email, user.passwordToken);

        if (user.verified) {
            mailOptions = emails.resetPassword(user.email, user.passwordToken);
        }

        await transporter.sendMail(mailOptions, async function (err) {
            if (err) {
                return res.status(500).send({
                    message: 'Something went wrong.',
                    err: err.message,
                });
            }
            return res.status(200).send({
                message: `Email has been sent to ${user.email}.`,
            });
        });
    } catch (e) {
        return next(e);
    }
};

resetPassword = async (req, res, next) => {
    try {
        const { email, password, confirmPassword, token } = req.body;
        const error = validateEmailAndPassword({
            email,
            password,
            confirmPassword,
        });
        if (error) {
            return res.status(422).json(error);
        }

        const err = validateNewPassword(req.body);
        if (err) {
            return res.status(422).json({ message: err});
        }

        const user = await Users.findOne({
            email,
            passwordToken: token,
            passwordTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).send({
                message: 'We were unable to find a user for this email or token.',
            });
        }

        user.password = utils.generatePassword(password);
        user.passwordToken = undefined;
        user.passwordTokenExpires = undefined;
        await user.save();
        return res.json({ message: 'Password changed successfully.' });
    } catch (e) {
        return next(e);
    }
};

oauth = async (req, res, next) => {
    try {
        const err = validateOauth(req.body);
        if (err) {
            return res.status(422).json({ errors: [{ message: err }] });
        }

        const { email, firstName, lastName, oauthId, oauth } = req.body;
        let userData = {};

        const user = await Users.findOne({ email });

        if (user) {
            if (user[oauth] === oauthId) {
                userData = user;
            } else {
                user.verified = true;
                user[oauth] = oauthId;
                user.passwordToken = undefined;
                user.passwordTokenExpires = undefined;
                userData = await user.save();
            }
        } else {
            const newUser = new Users({
                email,
                firstName,
                lastName,
                verified: true,
                [oauth]: oauthId,
            });
            userData = await newUser.save();
        }

        const token = generateAccessToken({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
        });
        return res.json({ token });
    } catch (e) {
        return next(e);
    }
};

module.exports = {
    login,
    register,
    verifiedEmail,
    sendPasswordToken,
    resetPassword,
    oauth,
};
