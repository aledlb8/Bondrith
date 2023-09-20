import mongoose, { Document, Schema } from 'mongoose';

interface IKey extends Document {
    key: string;
    used: boolean;
    createdAt: Date;
}

const keySchema = new Schema<IKey>({
    key: {
        type: String,
        required: true,
        unique: true,
    },
    used: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Key = mongoose.model<IKey>('Key', keySchema);

export default Key;
export { IKey };