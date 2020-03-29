const express       = require('express');
const bodyParser    = require('body-parser');
const session         = require('express-session');
const fs            = require('fs'); 
const app           = express();
const conn          = require('./app/models/db.js')

// app.set('views', './views'); // specify the views directory
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
const readJson = fs.readFileSync('data.json', 'utf8');
let data = JSON.parse(readJson);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
})); 

require('./app/routes/loginroutes.js')(app);
require('./app/routes/index.js');

//--------------------SET OUR VIEWS AND VIEWS ENGINE-------------------------
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

// var router = express.Router();

// -------------------------------TEST ROUTE------------------------------------
// router.get('/', function(req, res){
//     res.json({ message: 'Welcome to our upload module apis' });
// });

// --------------------------------DATA JSON WITH API---------------------------------------
//GET DATA WITH API                                                                      //|
app.get('/api/todos', (req, res) => {                                                    //|
    var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    res.send(data);
});

//GET DATA BY ID WITH API
app.get('/api/todo/:id', (req, res) => {
    const id  = req.params.id -1;
    res.send(data[id]);
});

//POST DATA ATAU CREATE DATA ACTIVITY WITH API
app.post('/api/todos', (req, res) => {
    const obj = req.body.title;

    // console.log(obj);

    data.push({ id : data.length + 1, title: obj });

    fs.writeFileSync('./data.json', JSON.stringify(data));
    res.redirect('/api/todos');
});

//UPDATE DATA WITH API
app.put('/api/todo/:id', (req, res) => {
    const Id  = req.params.id ;
    const ttl = req.body.title;

    let dataId;

    for(let i = 0; i < data.length; i++){
        if(Number(Id) === data[i].id){
            dataId = i;
        }
    }
    data[dataId].title = ttl;
    // console.log(data);
    fs.writeFileSync('./data.json', JSON.stringify(data));
    res.redirect('/api/todos');
});

//DELETE DATA WITH API
app.delete('/api/todo/:id', (req, res) => {
    const Id = req.params.id;
    const NewData = [];

    for (let i = 0; i < data.length; i++) {
        if(Number(Id) !== data[i].id){
            NewData.push(data[i]);
        }
    }
    data = NewData;
    fs.writeFileSync('./data.json', JSON.stringify(data));
    res.redirect('/api/todos');
})

//----------------------------------DATA JSON WITH VIEWS------------------------------------

//GET DATA WITH VIEWS
app.get('/todos', (req, res) => {
    res.render('todos', { data });
});

//CREATE DATA WITH VIEWS

app.get('/todo/new', (req, res) => {
    res.render('form');
});

app.post('/todos', (req, res) => {
    const ttl = req.body.title;

    data.push({ id: data.length + 1, title: ttl });
    // console.log(data);
    fs.writeFileSync('./data.json', JSON.stringify(data));
    res.redirect('/todos');
});

//EDIT DATA WITH VIEWS
app.get('/todo/update/:id', (req, res) => {
    const { id } = req.params;
    let dataId;

    for(let i = 0; i < data.length; i++) {
        if (Number(id) === data[i].id) {
            dataId = i;
        }
    }
    res.render('edit', { data : data[dataId] });
});

app.post('/todo/update/:id', (req, res) => {
    const Id = req.params.id;
    const ttl = req.body.title;

    let dataId;
    for(let i = 0; i < data.length; i++){
        if(Number(Id) === data[i].id){
            dataId = i;
        }
    }

    data[dataId].title = ttl;
    fs.writeFileSync('./data.json', JSON.stringify(data));
    res.redirect('/todos');
});

//DELETE DATA WITH VIEWS

app.get('/todo/delete', (req, res) => {
    res.render('delete', { data });
});

app.get('/todo/delete/:id', (req, res) => {
    const Id = req.params.id;
    const newData = [];

    for(let i = 0; i < data.length; i++){
        if(Number(Id) !== data[i].id){
            newData.push(data[i]);
        }
    }
    data = newData;
    // console.log(data);
    fs.writeFileSync('data.json', JSON.stringify(data));
    res.redirect('/todos');
});

conn.connect(function(err){
    if(!err) {
        console.log("Database is connected.... nn");
    } else {
        console.log("Error connecting database .... nn");
    }
});

app.listen(3000, () => {
    console.log('Server is running at port 3000');
});