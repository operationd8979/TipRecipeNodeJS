const jsonwebtoken = require('jsonwebtoken');
const config = require('../../config/config');

class JwtService {
    static instance = null;

    constructor() {
        this.jwt = jsonwebtoken;
        this.secretKey = config.jwt.secretKey;
        this.expiresIn = config.jwt.expiresIn;
        this.algorithm = config.jwt.algorithm;
    }

    static getInstance() {
        if (this.instance == null) {
            this.instance = new JwtFilter();
        }
        return this.instance;
    }

    generateToken(email) {
        return this.jwt.sign({ email: email }, this.secretKey, {
            expiresIn: this.expiresIn,
            algorithm: this.algorithm,
        });
    }

    verifyToken(token) {
        try {
            let data = this.jwt.verify(token, this.secretKey);
            if (data.exp * 1000 > Date.now()) {
                return data.email;
            }
        } catch (error) {
            return null;
        }
    }
}

module.exports = JwtService;
