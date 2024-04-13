const nodemailer = require('nodemailer');
const config = require('../../config/config');

const transporter = nodemailer.createTransport({
    host: config.mailTrap.host,
    port: config.mailTrap.port,
    secure: false,
    auth: {
        user: config.mailTrap.username,
        pass: config.mailTrap.password,
    },
});

module.exports = async function (email, subject, message) {
    const info = await transporter.sendMail({
        from: '"ChipChip 👻" <chipchip@tipcompany.email>',
        to: email,
        subject: subject,
        text: message,
    });
};
