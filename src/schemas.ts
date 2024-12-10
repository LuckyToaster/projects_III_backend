import { Schema, Types } from 'mongoose'
const { ObjectId } = Types;
export { user, contact, card, tag, community, area }


const user = new Schema(
    {
        email: { type: String, required: true, unique: true},
        password: { type: String, required: true },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false } 
)

const contact = new Schema(
    {
        userId: { type: ObjectId, ref: 'users', required: true, unique: true },  // one contact per user
        phoneNum: { type: String, required: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        hasWhatsapp: { type: Boolean, default: false },
        hasTelegram: { type: Boolean, default: false },
        socialMedia: {
            instagram: String,
            facebook: String,
            linkedin: String
        }
    },
    { timestamps: true, versionKey: false }
)

const card = new Schema(
    {
        userId: { type: ObjectId, ref: 'users', index: true },
        contactId: { type: ObjectId, ref: 'contacts', index: true },
        areaId: { type: ObjectId,  ref: 'areas', index: true }, 
        communityId: { type: ObjectId,  ref: 'communities', index: true }, 
        tagIds: [{type: ObjectId, ref: 'tags', index: true }],
        title: { type: String, required: true, maxLength: 50 }, 
        description: { type: String, required: true, maxLength: 300 },
        pictures: [String],
        prices: [{
            price: { type: Number, required: true, min: 0},
            description: { type: String, required: true, maxLength: 50},
        }],
    }, 
    { timestamps: true, versionKey: false }
)

const tag = new Schema(
    { 
        name: { type: String, required: true, unique: true }
    }, 
    { timestamps: true, versionKey: false}
)

const community = new Schema(
    {
        name: {type: String, required: true, unique: true}
    }, 
    {timestamps: true, versionKey: false}
)

const area = new Schema(
    {
        communityId: { type: ObjectId, ref: 'communities' },
        name: { type: String, required: true, unique: true }
    },
    { timestamps: true }
)

