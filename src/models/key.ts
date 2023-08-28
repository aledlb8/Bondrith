import mongoose from 'mongoose';

const keySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        uniquie: true
    },
    used: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Key = mongoose.model('Key', keySchema);

export default Key;