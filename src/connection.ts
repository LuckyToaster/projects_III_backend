import { createConnection } from 'mongoose';
import  * as Schemas  from './schemas'
export { 
    User, 
    Contact, 
    Card, 
    Tag, 
    Community, 
    Area,
    getPopulatedCards
} 

const db = createConnection('mongodb://127.0.0.1:27017/salsa_db')
const User = db.model('users', Schemas.user)
const Contact = db.model('contacts', Schemas.contact)
const Card = db.model('cards', Schemas.card)
const Tag = db.model('tags', Schemas.tag)
const Community = db.model('communities', Schemas.community)
const Area = db.model('areas', Schemas.area)


async function getPopulatedCards(filter: any = {}) {
    return await Card.find(filter)
        .populate('communityId')
        .populate('areaId')
        .populate('tagIds')
        .populate('contactId')
        .sort({createdAt: -1})
}
