import express, { Request, Response} from 'express'
import cors from 'cors'
import multer from 'multer' 
import * as DB from './connection'

const upload = multer({ dest: 'uploads/' })

const app = express()
app.use(express.json())
app.use(cors({ 
    origin: '*',
    methods: 'GET, POST', credentials: true 
}))

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
app.get('/api/cards', async (req, res) => {await getCards(req, res)})
app.get('/api/users', async (_, res) => {res.send(await DB.User.find())})
app.get('/api/contacts', async (_, res) => {res.send(await DB.Contact.find())})
app.get('/api/tags', async (_, res) => {res.send(await DB.Tag.find())})
app.get('/api/communities', async (_, res) => {res.send(await DB.Community.find())})
app.get('/api/areas', async (_, res) => { res.send(await DB.Area.find()) })
app.get('/api/user/:id', async (req, res) => {res.send(await DB.User.findById(req.params.id))})
app.post('/api/contact', async (req, res) => await postContact(req, res)) // requires 'userId', 'email' and 'phoneNum' in the request
app.post('/api/user', async (req, res) => await postUser(req, res)) // requires a 'email' and 'password' in the request
app.listen(3000, '0.0.0.0', () => console.log('=> Server running'))


function exactRegex(val: any) {
    return {$regex: `^${val}$`, $options: 'i'}
}


function regex(val: any) {
    return {$regex: val, $options: 'i'}
}


async function postUser(req: Request, res: Response) {
    try {
        await DB.User.create(new DB.User({email: req.query.email, password: req.query.password}))
    } catch (error) {
        res.status(409).send({ error: "Couln't create user, maybe it already exists"})
    }
}


async function postContact(req: Request, res: Response) {
    if (!req.query.userId || !req.query.phoneNum || !req.query.email) 
        res.status(500).send({error: "Need at least a 'userId', 'phoneNum' and 'email'"})

    let contactData: any = {}       
    Object.entries(req.query).forEach(([key, value]) => {
        if (value) contactData[key] = value;
    });

    const c = await DB.Contact.create(new DB.Contact(contactData))
    if (c) res.status(201).send()
    else res.status(500).send('invalid document, could not insert into DB')
}


async function getCards(req: Request, res: Response) {
    try {
        if (Object.keys(req.query).length === 0) 
            return res.send(await DB.getPopulatedCards())

        let filter: any = {};

        if (req.query.title) 
            filter.title = regex(req.query.title)

        if (req.query.community)
            filter.communityId = (await DB.Community.findOne({name: exactRegex(req.query.community)}))?._id

        if (req.query.area)
            filter.areaId = (await DB.Area.findOne({name: exactRegex(req.query.area)}))?._id

        if (req.query.tagsAny || req.query.tagsAll) {
            let anyTagIds: any = []
            let allTagIds: any = []

            if (req.query.tagsAny) {
                const tags = (req.query.tagsAny as string).split(',').map(t => new RegExp(t, 'i'))
                anyTagIds = (await DB.Tag.find({name:{$in: tags}})).map((t: any) => t._id)
            }

            if (req.query.tagsAll) {
                const tags = (req.query.tagsAll as string).split(',').map(t => new RegExp(t, 'i'))
                allTagIds = (await DB.Tag.find({name:{$in: tags}})).map((t: any) => t._id)
            }

            if (anyTagIds.length && allTagIds.length) 
                filter.$and = [{tagIds: {$in: anyTagIds}}, {tagIds: {$all: allTagIds}}]
            else if (anyTagIds.length) filter.tagIds = {$in: anyTagIds}
            else if (allTagIds.length) filter.tagIds = {$all: allTagIds}
        }

        res.send(await DB.getPopulatedCards(filter))
    } catch (error) { res.status(500).send({ error: 'Invalid URL' }) }
}

