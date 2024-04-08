module.exports = {
    mongo: {
        development: {
            connectionString: 'mongodb://localhost:27017/db_recipes',
        },
        production: {
            connectionString: 'your_production_connection_string',
        },
    },
};
