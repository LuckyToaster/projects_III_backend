import { createConnection } from 'mongoose';
import  * as Schemas  from './schemas'
import express from 'express'
import cors from 'cors'

// ============================================================================
// DB CONNECTION ==============================================================
// ============================================================================

const db = createConnection('mongodb://127.0.0.1:27017/salsa_db')
const User = db.model('users', Schemas.user)
const Contact = db.model('contacts', Schemas.contact)
const Card = db.model('cards', Schemas.card)
const Tag = db.model('tags', Schemas.tag)
const Community = db.model('communities', Schemas.community)
const Area = db.model('areas', Schemas.area)

// ============================================================================
// SERVER =====================================================================
// ============================================================================

const app = express()
app.use(express.json())
app.use(cors({ 
    origin: '*',
    methods: 'GET, POST', credentials: true 
}))

app.get('/api/users', async (_, res) => { res.send(await User.find()) })
app.get('/api/contacts', async (_, res) => { res.send(await Contact.find()) })
app.get('/api/tags', async (_, res) => { res.send(await Tag.find()) })
app.get('/api/communities', async (_, res) => { res.send(await Community.find()) })
app.get('/api/areas', async (_, res) => { res.send(await Area.find()) })

/*
    All the filters go in a case insensitive regex, meaning: 'math' will match with 'MaTH' and 'Mathematics'
    Community and area however, don't match as substrings and only match with case insensitive equivalents
    api/cards (base URL, returns all cards)
    FILTERS:
        title=space separated values 
        tagsAny=comma,separated,values
        tagsAll=comma,separated,values
        community=value
        area=value
    You can combine these filters
    EXAMPLE: /api/cards?title="best tutor ever"&tagsAny=Math,it&tagsAll=algorithms
    EXAMPLE: /api/cards?tagsAny=it&tagsAll=programming,algorithms&title=best%20programmer&area=madrid&community=madrid
*/
app.get('/api/cards', async (req, res) => { 
    try {
        if (Object.keys(req.query).length === 0) 
            res.send(await getPopulatedCards())

        let filter: any = {};

        // will {$reqgex: req.query.title, $options: 'i'} suffice ?
        if (req.query.title) 
            filter.title = {$regex: (req.query.title as string).toLowerCase(), $options: 'i'}

        if (req.query.community) {
            const c = await Community.findOne({name: {$regex: `^${req.query.community}$`, $options: 'i'}})
            filter.communityId = c?._id 
        }

        if (req.query.area) {
            const a = await Area.findOne({name: {$regex: `^${req.query.area}$`, $options: 'i'}})
            filter.areaId = a?._id 
        }

        if (req.query.tagsAny || req.query.tagsAll) {
            let anyTagIds: any = []
            let allTagIds: any = []

            if (req.query.tagsAny) {
                const tags = (req.query.tagsAny as string).split(',').map(t => new RegExp(t, 'i'))
                anyTagIds = (await Tag.find({name:{$in: tags}})).map(t => t._id)
                console.log(tags)
                console.log(anyTagIds)
            }

            if (req.query.tagsAll) {
                const tags = (req.query.tagsAll as string).split(',').map(t => new RegExp(t, 'i'))
                allTagIds = (await Tag.find({name:{$in: tags}})).map(t => t._id)
                console.log(tags)
                console.log(allTagIds)
            }

            if (anyTagIds.length && allTagIds.length) 
                filter.$and = [{tagIds: {$in: anyTagIds}}, {tagIds: {$all: allTagIds}}]
            else if (anyTagIds.length) filter.tagIds = {$in: anyTagIds}
            else if (allTagIds.length) filter.tagIds = {$all: allTagIds}
        }

        res.send(await getPopulatedCards(filter))
    } catch (error) {
        res.status(500).send({ error: 'Invalid URL' });
    }
})


// POST user
// POST card (for a given user)
// POST card

async function getPopulatedCards(filter: any = {}) {
    return await Card.find(filter)
        .populate('communityId')
        .populate('areaId')
        .populate('tagIds')
        .populate('contactId')
        .sort({createdAt: -1})
}

app.listen(3000, '0.0.0.0', () => console.log('=> Server running'))


