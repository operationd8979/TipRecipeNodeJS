const fs = require('fs-extra');
const con = require('../../config/db');

class CachingService {
    static instance = null;

    constructor() {
        this.commonPath = './cache/';
        this.cacheLifetime = 3600;
    }

    static getInstance() {
        if (this.instance == null) {
            this.instance = new CachingService();
        }
        return this.instance;
    }

    checkExistedCache(hotKey) {
        const path = this.commonPath + hotKey;
        if (
            fs.existsSync(path) &&
            (Date.now() - fs.statSync(path).mtime.getTime()) / 1000 < this.cacheLifetime
        ) {
            // console.log('Get cache');
            const data = require('../../' + path);
            return data ?? null;
        }
        return null;
    }

    addCache(hotKey, data) {
        const path = this.commonPath + hotKey;
        if (
            fs.existsSync(path) &&
            (Date.now() - fs.statSync(path).mtime.getTime()) / 1000 < this.cacheLifetime
        ) {
            return false;
        }
        // console.log('Add cache');
        fs.writeFileSync(path, `module.exports = ${JSON.stringify(data)}`);
        return true;
    }
}

module.exports = CachingService;
