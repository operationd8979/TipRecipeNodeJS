const { check } = require('express-validator');
const util = require('node:util');
const option = {
    password: {
        minLength: 6,
        minNumbers: 1,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
    },
    username: {
        max: 42,
        min: 6,
    },
};
module.exports = {
    checkChain: function () {
        return [
            check(
                'password',
                util.format(
                    'Password must be at least %d characters, %d sysmbols, %d uppercase, %d lowercase, %d numbers.',
                    option.password.minLength,
                    option.password.minSymbols,
                    option.password.minUppercase,
                    option.password.minLowercase,
                    option.password.minNumbers,
                ),
            ).isStrongPassword(option.password),
            check('email', 'Wrong format of email.').isEmail(),
            check(
                'username',
                util.format(
                    'Username must be until %d to %d characters.',
                    option.username.min,
                    option.username.max,
                ),
            ).isLength(option.username),
        ];
    },
    checkEmail: function () {
        return check('email', 'Wrong format of email.').isEmail();
    },
    checkUsername: function () {
        return check(
            'username',
            util.format(
                'Username must be until %d to %d characters.',
                option.username.min,
                option.username.max,
            ),
        ).isLength(option.username);
    },
    checkPassword: function () {
        return check(
            'password',
            util.format(
                'Password must be at least %d characters, %d sysmbols, %d uppercase, %d lowercase, %d numbers.',
                option.password.minLength,
                option.password.minSymbols,
                option.password.minUppercase,
                option.password.minLowercase,
                option.password.minNumbers,
            ),
        ).isStrongPassword(option.password);
    },
};
