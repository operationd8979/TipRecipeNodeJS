var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200    
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /\S+@\S+\.\S+/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        },
        maxLength: 200         
    },
    role: {
        type: [String],
        enum: ['USER', 'ADMIN']
    },
    passwordHash: {
        type: String,
        required: true,
    },
    createAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = new mongoose.model('user', userSchema);