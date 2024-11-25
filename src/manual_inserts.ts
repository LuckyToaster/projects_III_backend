
// PLEASE DO NOT ATTEMPT ANY MANUAL INSERTS

/*
const u1 = new User({email: 'user@mail.com', password: 'userpassword'})
const u2= new User({email: 'user2@mail.com', password: 'user2password'}) 
const u3 = new User({email: 'user3@mail.com', password: 'user3password'})
const u4 = new User({email: 'user4@mail.com', password: 'user4password'})
const contact = new Contact({userId: u1._id, phoneNum: '+34651461244', email: 'contactme@mail.com'})
User.insertMany([u1, u2, u3, u4])
Contact.insertMany([contact])
*/

/*
const madrid = new Community({name: 'Madrid'})
const cataluna = new Community({name: 'Cataluña'});
const andalucia = new Community({name: 'Andalucía'});
const valencia = new Community({name: 'Valencia'});
const galicia = new Community({name: 'Galicia'});
const castillaLeon = new Community({name: 'Castilla y León'});
const euskadi = new Community({name: 'País Vasco'});
const canarias = new Community({name: 'Canarias'});
const castillaMancha = new Community({name: 'Castilla-La Mancha'});
const murcia = new Community({name: 'Murcia'});
const aragon = new Community({name: 'Aragón'});
const baleares = new Community({name: 'Baleares'});
const extremadura = new Community({name: 'Extremadura'});
const asturias = new Community({name: 'Asturias'});
const navarra = new Community({name: 'Navarra'});
const cantabria = new Community({name: 'Cantabria'});
const rioja = new Community({name: 'La Rioja'});
const ceuta = new Community({name: 'Ceuta'});
const melilla = new Community({name: 'Melilla'});

await Community.insertMany([
    madrid, cataluna, andalucia, valencia, galicia, 
    castillaLeon, euskadi, canarias, castillaMancha, 
    murcia, aragon, baleares, extremadura, asturias, 
    navarra, cantabria, rioja, ceuta, melilla
]);

const communities = await Community.find()
console.log(communities)
*/


/*
const madrid = await Community.findOne({name: 'Madrid'})
const cataluna = await Community.findOne({name: 'Cataluña'});
const andalucia = await Community.findOne({name: 'Andalucía'});
const valencia = await Community.findOne({name: 'Valencia'});
const galicia = await Community.findOne({name: 'Galicia'});
const castillaLeon = await Community.findOne({name: 'Castilla y León'});
const euskadi = await Community.findOne({name: 'País Vasco'});
const canarias = await Community.findOne({name: 'Canarias'});
const castillaMancha = await Community.findOne({name: 'Castilla-La Mancha'});
const murcia = await Community.findOne({name: 'Murcia'});
const aragon = await Community.findOne({name: 'Aragón'});
const baleares = await Community.findOne({name: 'Baleares'});
const extremadura = await Community.findOne({name: 'Extremadura'});
const asturias = await Community.findOne({name: 'Asturias'});
const navarra = await Community.findOne({name: 'Navarra'});
const cantabria = await Community.findOne({name: 'Cantabria'});
const rioja = await Community.findOne({name: 'La Rioja'});
const ceuta = await Community.findOne({name: 'Ceuta'});
const melilla = await Community.findOne({name: 'Melilla'});

const madridAreas = [
    new Area({communityId: madrid?._id, name: 'Madrid'})
];

const catalunaAreas = [
    new Area({communityId: cataluna?._id, name: 'Barcelona'}),
    new Area({communityId: cataluna?._id, name: 'Girona'}),
    new Area({communityId: cataluna?._id, name: 'Lleida'}),
    new Area({communityId: cataluna?._id, name: 'Tarragona'})
];

const andaluciaAreas = [
    new Area({communityId: andalucia?._id,  name: 'Almería'}),
    new Area({communityId: andalucia?._id, name: 'Cádiz'}),
    new Area({communityId: andalucia?._id, name: 'Córdoba'}),
    new Area({communityId: andalucia?._id, name: 'Granada'}),
    new Area({communityId: andalucia?._id, name: 'Huelva'}),
    new Area({communityId: andalucia?._id, name: 'Jaén'}),
    new Area({communityId: andalucia?._id, name: 'Málaga'}),
    new Area({communityId: andalucia?._id, name: 'Sevilla'})
];

const valenciaAreas = [
    new Area({communityId: valencia?._id, name: 'Alicante'}),
    new Area({communityId: valencia?._id, name: 'Castellón'}),
    new Area({communityId: valencia?._id, name: 'Valencia'})
];

const galiciaAreas = [
    new Area({communityId: galicia?._id,  name: 'A Coruña'}),
    new Area({communityId: galicia?._id, name: 'Lugo'}),
    new Area({communityId: galicia?._id, name: 'Ourense'}),
    new Area({communityId: galicia?._id, name: 'Pontevedra'})
];

const castillaLeonAreas = [
    new Area({communityId: castillaLeon?._id, name: 'Ávila'}),
    new Area({communityId: castillaLeon?._id, name: 'Burgos'}),
    new Area({communityId: castillaLeon?._id, name: 'León'}),
    new Area({communityId: castillaLeon?._id, name: 'Palencia'}),
    new Area({communityId: castillaLeon?._id, name: 'Salamanca'}),
    new Area({communityId: castillaLeon?._id, name: 'Segovia'}),
    new Area({communityId: castillaLeon?._id, name: 'Soria'}),
    new Area({communityId: castillaLeon?._id, name: 'Valladolid'}),
    new Area({communityId: castillaLeon?._id, name: 'Zamora'})
];

const euskadiAreas = [
    new Area({communityId: euskadi?._id, name: 'Álava'}),
    new Area({communityId: euskadi?._id, name: 'Guipúzcoa'}),
    new Area({communityId: euskadi?._id, name: 'Vizcaya'})
];

const canariasAreas = [
    new Area({communityId: canarias?._id, name: 'Las Palmas'}),
    new Area({communityId: canarias?._id, name: 'Santa Cruz de Tenerife'})
];

const castillaManchaAreas = [
    new Area({communityId: castillaMancha?._id, name: 'Albacete'}),
    new Area({communityId: castillaMancha?._id, name: 'Ciudad Real'}),
    new Area({communityId: castillaMancha?._id, name: 'Cuenca'}),
    new Area({communityId: castillaMancha?._id, name: 'Guadalajara'}),
    new Area({communityId: castillaMancha?._id, name: 'Toledo'})
];

const murciaAreas = [
    new Area({communityId: murcia?._id, name: 'Murcia'})
];

const aragonAreas = [
    new Area({communityId: aragon?._id, name: 'Huesca'}),
    new Area({communityId: aragon?._id, name: 'Teruel'}),
    new Area({communityId: aragon?._id, name: 'Zaragoza'})
];

const balearesAreas = [
    new Area({communityId: baleares?._id, name: 'Islas Baleares'})
];

const extremaduraAreas = [
    new Area({communityId: extremadura?._id, name: 'Badajoz'}),
    new Area({communityId: extremadura?._id, name: 'Cáceres'})
];

const asturiasAreas = [
    new Area({communityId: asturias?._id, name: 'Asturias'})
];

const navarraAreas = [
    new Area({communityId: navarra?._id, name: 'Navarra'})
];

const cantabriaAreas = [
    new Area({communityId: cantabria?._id, name: 'Cantabria'})
];

const riojaAreas = [
    new Area({communityId: rioja?._id, name: 'La Rioja'})
];

const ceutaAreas = [
    new Area({communityId: ceuta?._id, name: 'Ceuta'})
];

const melillaAreas = [
    new Area({communityId: melilla?._id, name: 'Melilla'})
];

const allAreas = [
    ...madridAreas, ...catalunaAreas, ...andaluciaAreas, 
    ...valenciaAreas, ...galiciaAreas, ...castillaLeonAreas,
    ...euskadiAreas, ...canariasAreas, ...castillaManchaAreas,
    ...murciaAreas, ...aragonAreas, ...balearesAreas,
    ...extremaduraAreas, ...asturiasAreas, ...navarraAreas,
    ...cantabriaAreas, ...riojaAreas, ...ceutaAreas,
    ...melillaAreas
];

await Area.insertMany(allAreas)

const areas = await Area.find()
for (const area of areas) console.log(area?.name)
*/


/*
const tags = [
    new Tag({name: 'Mathematics'}),
    new Tag({name: 'Chemistry'}),
    new Tag({name: 'Biology'}),
    new Tag({name: 'English'}),
    new Tag({name: 'Lengua'}),
    new Tag({name: 'IT'}),
    new Tag({name: 'Programming'}),
    new Tag({name: 'Algorithms'}),
    new Tag({name: 'Java'}),
    new Tag({name: 'C++'}),
]
await Tag.insertMany(tags)
*/

/*
const users = await User.find()
const contacts = [
    new Contact({userId: users[0]?._id, phoneNum: '+34651461244', email: 'usercontact@mail.com'}),
    new Contact({userId: users[1]?._id, phoneNum: '646334422', email: 'user2contact@mail.com'}),
    new Contact({userId: users[2]?._id, phoneNum: '62838428', email: 'user3contact@mail.com'}),
    new Contact({userId: users[3]?._id, phoneNum: '61838473', email: 'user4contact@mail.com'}),
]
await Contact.insertMany(contacts)
*/

/*
const users = await User.find()
const contacts = await Contact.find()
const tags = await Tag.find()
const areas = await Area.find()

const cards = [
    new Card({
        userId: users[0]?._id,
        contactId: contacts[0]?._id,
        areaId: areas[49]?._id,
        communityId: areas[49]?.communityId,
        tagIds: [ tags[0]?._id ],
        title: 'Best Math tutor in the warld', 
        description: "I am the best math tutor, thank you thank you. You don't believe me? Well then book a class.",
        prices: [{price: 50, description: '2 Hours'}, {price: 30, description: '1 Hour'}],
    }),

    new Card({
        userId: users[1]?._id,
        contactId: contacts[1]?._id,
        areaId: areas[0]?._id,
        communityId: areas[0]?.communityId,
        tagIds: [ tags[5]?._id, tags[6]?._id, tags[7]?._id, tags[9]?._id ],
        title: 'Best programmer that has ever lived', 
        description: "I am the best programmer that has ever lived. F*** you I have a space alien!",
        prices: [{price: 100, description: '2 Hours'}, {price: 50, description: '1 Hour'}],
    }),

    new Card({
        userId: users[2]?._id,
        contactId: contacts[2]?._id,
        areaId: areas[5]?._id,
        communityId: areas[5]?.communityId,
        tagIds: [ tags[8]?._id ],
        title: 'Java for Enterprise', 
        description: "Hello sirs, I teach Java for business and students, very good value for money",
        prices: [{price: 35, description: '2 Hours'}, {price: 20, description: '1 Hour'}],
    }),

    new Card({
        userId: users[3]?._id,
        contactId: contacts[3]?._id,
        areaId: areas[15]?._id,
        communityId: areas[15]?.communityId,
        tagIds: [ tags[3]?._id, tags[4]?._id ],
        title: 'English / Spanish one to one classes', 
        description: "Just arrived? Need to learn English / Spanish as fast as possible? Don't worry I got you, I am 100% bilingual and it won't cost you a dime",
        prices: [{price: 45, description: '3 Hours'}, {price: 40, description: '2 Hour'}],
    }),
]
await Card.insertMany(cards)
*/
