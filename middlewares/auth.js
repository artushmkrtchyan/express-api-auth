const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { Users } = require('../models/users');

const { validateUser, validateEmailAndPassword } = require('../lib/validate');

const accessTokenSecret = config.JWT_TOKEN_SECRET || 'test-secret';

exports.generateAccessToken = (username) => {
    return jwt.sign(username, accessTokenSecret, { expiresIn: 5 * 60 * 60 });
};

exports.authenticateToken = (req, res, next) => {
    const { authorization } = req.headers;
    const token =
        authorization && authorization.split(' ')[0] === 'Bearer'
            ? authorization.split(' ')[1]
            : null;
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err)
            return res.status(401).json({ message: 'Unauthorized' });
        req.user = user;
        next();
    });
};

exports.register = async (req, res, next) => {
    const { email, password, confirmPassword } = req.body;

    const error = validateEmailAndPassword({
        email,
        password,
        confirmPassword,
    });
    if (error) {
        return res.status(422).json( error );
    }

    const err = validateUser(req.body);
    if (err) {
        return res.status(422).json(err);
    }

    try {
        const user = await Users.findOne({ email });
        if (user) {
            return res
                .status(422)
                .json({ status: 409, message: 'Email already exists.', type: "email" });
        }
    } catch (error) {
        return res.status(500).json({ error });
    }
    next();
};
