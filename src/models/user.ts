import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        uniquie: true
    },
    secret: {
        type: String,
        required: true,
        unique: true
    },
    ip: {
        type: String,
        required: false
    },
    hwid: {
        type: String,
        required: false
    },
    discordId: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

export default User;