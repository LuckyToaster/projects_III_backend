import express, { Request, Response} from 'express'
import fs from 'fs'
import cors from 'cors'
import multer from 'multer' 
import * as DB from './connection'

const upload = multer({ storage: multer.memoryStorage() })
const app = express()
const PICTURES_PATH = './pfps'

app.use(express.json())
app.use(cors({ origin: '*', methods: 'GET, POST', credentials: true }))

// these are just for seeing what's in the DB
app.get('/api/users', async (_, res) => { res.send(await DB.User.find()) })
app.get('/api/contacts', async (_, res) => { res.send(await DB.Contact.find()) })
app.get('/api/tags', async (_, res) => { res.send(await DB.Tag.find()) })
app.get('/api/communities', async (_, res) => { res.send(await DB.Community.find()) })
app.get('/api/areas', async (_, res) => { res.send(await DB.Area.find()) })
app.get('/api/user/:id', async (req, res) => { res.send(await DB.User.findById(req.params.id)) }) // validate these so server doenst crash on bad urls

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

app.get('/api/user/:email/:password', async (req, res) => { 
    const u = await DB.User.findOne({email: req.params.email, password: req.params.password})
    if (u) {
        const c = await DB.Contact.findOne({userId: u?._id})
        res.json({userId: u?._id, contactId: c?._id}) 
    } else res.status(500).send('Failed to GET user. Bad URL perhaps?')
})

app.get('/api/pfp/:filename', async (req, res) => {
    res.set('Cache-control', 'public, max-age=1d') 
    res.sendFile(`${PICTURES_PATH}/${req.params.filename}`, _ => res.status(404).send('File not found, or worse'))
    //res.sendFile(path.join(__dirname, '..', 'pfps', req.params.filename), _ => res.status(404).send('File not found or worse'))
})

app.post('/api/user', async (req, res) => await postUser(req, res)) // requires a 'email' and 'password'
app.post('/api/contact', async (req, res) => { await postContact(req, res) }) // requires 'userId' (to relate to user), and at least 'email' and 'phoneNum'
app.post('/api/card', upload.single('file'), async (req, res) => { await postCard(req, res) }) // can include an image

app.listen(3000, '0.0.0.0', () => console.log('=> Server running'))

/*
    THIS IS HOW YOU WOULD POST DATA AND AN IMAGE

    <form id='form_container'>
        <input id="msgInput" type="text" placeholder="Message"/>
        <label for="fileInput" id="customFileInput">
            <i class="fas fa-image"></i>
        </label>
        <input id='fileInput' type="file"/>
        <button id='submitBtn'><i class="fas fa-paper-plane"></i></button>
    </form>

    async function post() {
        const msgInput = document.getElementById('msgInput')
        const fileInput = document.getElementById('fileInput')

        const fd = new FormData()
        fd.append('msg', msgInput.value)
        if (fileInput.files[0] != null) 
            fd.append('file', fileInput.files[0])

        const res = await fetch(`${URL}insert`, {method: 'POST', body: fd}) // you would send the FormData in the body
        res.ok ? console.log('POST OK') : console.log('POST ERROR')

        msgInput.value = ''
        fileInput.value = ''
    }
*/

function exactRegex(val: any) {
    return {$regex: `^${val}$`, $options: 'i'}
}


function regex(val: any) {
    return {$regex: val, $options: 'i'}
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


async function postUser(req: Request, res: Response) {
    const u = await DB.User.create(new DB.User({email: req.body.email, password: req.body.password}))
    if (!u) res.status(409).send({ error: "Couln't create user, bad request perhaps? Or maybe user already exists?"})
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
    if (!c) res.status(500).send('invalid document, could not insert into DB')
    res.status(201).send({contactId: c._id})
}


const communities = {
     "Madrid": "67436fd20aea345911445629",
     "Cataluña": "67436fd20aea34591144562a",
     "Andalucía": "67436fd20aea34591144562b",
     "Valencia": "67436fd20aea34591144562c", 
     "Galicia": "67436fd20aea34591144562d",
     "Castilla y León": "67436fd20aea34591144562e",
     "País Vasco": "67436fd20aea34591144562f",
     "Canarias": "67436fd20aea345911445630",
     "Castilla-La Mancha": "67436fd20aea345911445631",
     "Murcia": "67436fd20aea345911445632",
     "Aragón": "67436fd20aea345911445633",
     "Baleares": "67436fd20aea345911445634",
     "Extremadura": "67436fd20aea345911445635",
     "Asturias": "67436fd20aea345911445636",
     "Navarra": "67436fd20aea345911445637",
     "Cantabria": "67436fd20aea345911445638",
     "La Rioja": "67436fd20aea345911445639",
     "Ceuta": "67436fd20aea34591144563a",
     "Melilla": "67436fd20aea34591144563b"
}

const areas = {
   "Madrid": "67437a0c1b1040f78d24bab1",
   "Barcelona": "67437a0c1b1040f78d24bab2",
   "Girona": "67437a0c1b1040f78d24bab3",
   "Lleida": "67437a0c1b1040f78d24bab4",
   "Tarragona": "67437a0c1b1040f78d24bab5",
   "Almería": "67437a0c1b1040f78d24bab6",
   "Cádiz": "67437a0c1b1040f78d24bab7",
   "Córdoba": "67437a0c1b1040f78d24bab8",
   "Granada": "67437a0c1b1040f78d24bab9",
   "Huelva": "67437a0c1b1040f78d24baba",
   "Jaén": "67437a0c1b1040f78d24babb",
   "Málaga": "67437a0c1b1040f78d24babc",
   "Sevilla": "67437a0c1b1040f78d24babd",
   "Alicante": "67437a0c1b1040f78d24babe",
   "Castellón": "67437a0c1b1040f78d24babf",
   "Valencia": "67437a0c1b1040f78d24bac0",
   "A Coruña": "67437a0c1b1040f78d24bac1",
   "Lugo": "67437a0c1b1040f78d24bac2",
   "Ourense": "67437a0c1b1040f78d24bac3",
   "Pontevedra": "67437a0c1b1040f78d24bac4",
   "Ávila": "67437a0c1b1040f78d24bac5",
   "Burgos": "67437a0c1b1040f78d24bac6",
   "León": "67437a0c1b1040f78d24bac7",
   "Palencia": "67437a0c1b1040f78d24bac8",
   "Salamanca": "67437a0c1b1040f78d24bac9",
   "Segovia": "67437a0c1b1040f78d24baca",
   "Soria": "67437a0c1b1040f78d24bacb",
   "Valladolid": "67437a0c1b1040f78d24bacc",
   "Zamora": "67437a0c1b1040f78d24bacd",
   "Álava": "67437a0c1b1040f78d24bace",
   "Guipúzcoa": "67437a0c1b1040f78d24bacf",
   "Vizcaya": "67437a0c1b1040f78d24bad0",
   "Las Palmas": "67437a0c1b1040f78d24bad1",
   "Santa Cruz de Tenerife": "67437a0c1b1040f78d24bad2",
   "Albacete": "67437a0c1b1040f78d24bad3",
   "Ciudad Real": "67437a0c1b1040f78d24bad4",
   "Cuenca": "67437a0c1b1040f78d24bad5",
   "Guadalajara": "67437a0c1b1040f78d24bad6",
   "Toledo": "67437a0c1b1040f78d24bad7",
   "Murcia": "67437a0c1b1040f78d24bad8",
   "Huesca": "67437a0c1b1040f78d24bad9",
   "Teruel": "67437a0c1b1040f78d24bada",
   "Zaragoza": "67437a0c1b1040f78d24badb",
   "Islas Baleares": "67437a0c1b1040f78d24badc",
   "Badajoz": "67437a0c1b1040f78d24badd",
   "Cáceres": "67437a0c1b1040f78d24bade",
   "Asturias": "67437a0c1b1040f78d24badf",
   "Navarra": "67437a0c1b1040f78d24bae0",
   "Cantabria": "67437a0c1b1040f78d24bae1",
   "La Rioja": "67437a0c1b1040f78d24bae2",
   "Ceuta": "67437a0c1b1040f78d24bae3",
   "Melilla": "67437a0c1b1040f78d24bae4"
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
    const cardWithPfp = await DB.Card.findOneAndUpdate({id: card._id}, {pictures: [filename]})
    if (!cardWithPfp) return res.status(500).send('Coulnt update the card with the picture, wtf?')
    res.status(201).send('Card inserted, picture saved')
}
