import fs from 'fs'
import path from 'path'
import cors from 'cors'
import multer from 'multer' 
import * as DB from './connection'
import express, { Request, Response} from 'express'

const app = express()
const upload = multer({ storage: multer.memoryStorage() }) // this is middleware needed for receiving FormData
const PICTURES_PATH = path.join(__dirname, '..', 'pfps')
const PORT = 3000

app.use(express.json())
app.use(cors({ origin: '*', methods: 'GET, POST', credentials: true }))
if (!fs.existsSync(PICTURES_PATH)) 
    fs.mkdirSync(PICTURES_PATH, { recursive: true })

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
    EXAMPLE: /api/cards?title=best math tutor in the&tagsAny=Math&tagsAll=math
    EXAMPLE: /api/cards?tagsAny=it&tagsAll=programming,algorithms&title=best%20programmer&area=madrid&community=madrid
*/
app.get('/api/cards', async (req, res) => { await getCards(req, res) })
app.get('/api/user/:email/:password', async (req, res) => { await getUser(req, res)})
app.get('/api/pfp/:filename', async (req, res) => getPfp(req, res))
app.post('/api/user', async (req, res) => { await postUser(req, res) })                                 // requires a 'email' and 'password'
app.post('/api/contact', async (req, res) => { await postContact(req, res) })                       // requires 'userId', 'email' and 'phoneNum'
app.post('/api/card', upload.single('file'), async (req, res) => { await postCard(req, res) })      // can include an image

// these are just for seeing what's in the DB
app.get('/api/users', async (_, res) => { res.send(await DB.User.find()) })
app.get('/api/contacts', async (_, res) => { res.send(await DB.Contact.find()) })
app.get('/api/tags', async (_, res) => { res.send(await DB.Tag.find()) })
app.get('/api/communities', async (_, res) => { res.send(await DB.Community.find()) })
app.get('/api/areas', async (_, res) => { res.send(await DB.Area.find()) })
app.listen(PORT, '0.0.0.0', () => console.log('=> Server running'))


function exactRegex(val: any) {
    return {$regex: `^${val}$`, $options: 'i'}
}


function regex(val: any) {
    return {$regex: val, $options: 'i'}
}


function getPfp(req: Request, res: Response) {
    res.set('Cache-control', 'public, max-age=1d') 
    res.sendFile(`${PICTURES_PATH}/${req.params.filename}`, err => {
        if (err && !res.headersSent) 
            res.status(404).send('File not found')
    })
}


async function getCards(req: Request, res: Response) {
    try {
        if (Object.keys(req.query).length === 0) 
            return res.send(await DB.getPopulatedCards())

        let filter: any = {}

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


async function getUser(req: Request, res: Response) {
    const u = await DB.User.findOne({email: req.params.email, password: req.params.password})
    if (u) {
        const c = await DB.Contact.findOne({userId: u?._id})
        res.json({userId: u?._id, contactId: c?._id}) 
    } else res.status(500).send('Failed to GET user. Bad URL perhaps?')
}


async function postUser(req: Request, res: Response) {
    const u = await DB.User.create(new DB.User({email: req.body.email, password: req.body.password}))
    if (!u) return res.status(409).send({ error: "Couln't create user, bad request perhaps? Or maybe user already exists?"})
    res.status(201).send({userId: u._id})
}


async function postContact(req: Request, res: Response) {
    if (!req.body.userId || !req.body.phoneNum || !req.body.email) 
        return res.status(500).send({error: "Need these 3 things: 'userId', 'phoneNum' and 'email'"})

    let contactData: any = {}       
    Object.entries(req.body).forEach(([key, value]) => {
        if (value) contactData[key] = value
    })

    const c = await DB.Contact.create(new DB.Contact(contactData))
    if (!c) return res.status(500).send('Json sent to create user not valid. Check that document keys match DB collection keys')
    res.status(201).send({contactId: c._id})
}


async function postCard(req: Request, res: Response) {
    // create card
    let cardData: any = {}       
    Object.entries(req.body).forEach(([key, value]) => {
        if (value) cardData[key] = value
    })
    const card = await DB.Card.create(new DB.Card(cardData))
    if (!card) return res.status(500).send('Could not insert card goddamnit')

    // check the file and save it (or not)
    const MIMES = ['image/jpg', 'image/jpeg', 'image/png']
    const f = req.file
    if (!f) 
        return res.status(201).send('Card inserted, no picture was given')
    if (f.size > 4194304)
        return res.status(500).send(`${f.originalname} exceeds 4MB max size`)
    if (!MIMES.includes(f.mimetype)) 
        return res.status(500).send(`${f.originalname} of type ${f.mimetype} not supported`)

    const filename = `${card._id}.${f.mimetype.split('/')[1]}`
    try {
        fs.writeFileSync(`${PICTURES_PATH}/${filename}`, f.buffer)
    } catch (e) {
        return res.status(500).send(`Error saving picture: ${e}`)
    }

    // update the card to contain the pfp
    const cardWithPfp = await DB.Card.findOneAndUpdate({_id: card._id}, {pictures: [filename]})
    if (!cardWithPfp) return res.status(500).send('Coulnt update the card with the picture, wtf?')
    res.status(201).send('Card inserted, picture saved')
}
