const router = require('express').Router();
const AuthController = require('../../controller/api/auth');
const AuthMiddleware = require('../../middlewares/auth');

router.post('/login', AuthController.login);

router.post('/register', AuthMiddleware.register, AuthController.register);

router.post('/verified', AuthController.verifiedEmail);

router.post('/send-password-token', AuthController.sendPasswordToken);

router.post('/reset-password', AuthController.resetPassword);

router.post('/oauth', AuthController.oauth);

module.exports = router;
