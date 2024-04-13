module.exports = {
    hostName: 'localhost:3000',
    jwt: {
        secretKey: 'chipchip',
        expiresIn: '1d',
        algorithm: 'HS256',
    },
    mailTrap: {
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        username: '7cf9757c948223',
        password: 'ade73aebed42bc',
    },
    sql: {
        hostname: 'localhost',
        user: 'root',
        password: '',
        database: 'tiprecipe',
    },
};
