const config = require('../config/config');

const verification = (to, token) => {
    return {
        from: `Example App <${config.SEND_GRID_FROM}>`,
        to,
        subject: 'Welcome to Example App! Confirm Your Email',
        html: `
                <h3>Please verify your account by clicking the link:</h3>
                <hr />
                <a href="${config.BASE_URL}/verified-email/${token}" target="_blank" style="box-sizing:border-box;border-color:#348eda;font-weight:400;text-decoration:none;display:inline-block;margin:0;color:#ffffff;background-color:#348eda;border:solid 1px #348eda;border-radius:2px;font-size:14px;padding:12px 45px">
                    Confirm Email Address
                </a>
            `,
    };
};

const resetPassword = (to, token) => {
    return {
        from: `Example App <${config.SEND_GRID_FROM}>`,
        to,
        subject: 'Reset Password!',
        html: `
                <p>You recently requested to reset your password for your Example App account. Click the button below to reset it.</p>
                <hr />
                <a href="${config.BASE_URL}/reset-password/${token}" target="_blank" style="box-sizing:border-box;border-color:#348eda;font-weight:400;text-decoration:none;display:inline-block;margin:0;color:#ffffff;background-color:#348eda;border:solid 1px #348eda;border-radius:2px;font-size:14px;padding:12px 45px">
                    Reset Password
                </a>
                <p>If you did not request a password reset, please ignore this email. This password reset is only valid for the next 1 hour.</p>
            `,
    };
};

module.exports = {
    verification,
    resetPassword,
};
