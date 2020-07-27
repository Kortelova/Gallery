const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const cacheodbc = require('cacheodbc');
const connection = new cacheodbc.ODBCConnection();
const bodyParser = require("body-parser");
const ba64 = require("ba64");
/*const passport = require('passport');
const validator = require('validator');*/

connection.connect("DSN=cacheWinHost", err => {
    if (err) {
        throw new Error("Cannot connect to API");
    }
});

//доступ до завантажених картинок
app.use('/public/images/', express.static('./uploads/'));

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/*app.use(passport.initialize());
app.use(passport.session());*/


//Route for http://localhost:8080/
app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset = utf-8'});
  let index = fs.createReadStream(__dirname + '/index.html', 'utf-8');
  index.pipe(res)
});

app.get('/index', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset = utf-8'});
  let index = fs.createReadStream(__dirname + '/index.html', 'utf-8');
  index.pipe(res);
});

app.get('/upload-main',(req, res, next) => res.render('menu-upload'));

app.get('/menu-scan', (req, res, next) => res.render('menu-scan'));

app.get('/delete/:id', (req, res, next) => {
   let id = req.params["id"];

   connection.query(`delete from gallery where name = '${id}'`, (err, value) => {
    });
   res.send('Success');
 });

app.get('/sign-up', (req, res, next) => res.render('sign-up'));

app.post('/sign-up', (req, res, next) => {
  console.log(req.body);
  let pass = validator.equals(req.body.password, req.body.confirm_password);
  let email = validator.isEmail(req.body.email);

  /*if(pass && email) {
    connection.query(`select * from user`, (err, value) => {
        console.log('cool');
    }); 
  }*/

});



//Налаштування мультеру
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname.replace(/\s/g, ''));
    }
});
 
app.use(multer({storage:storageConfig}).single("filedata"));


app.post("/upload-main/response",  function (req, res, next) {
   
  let filedata = req.file;

  if(!filedata)
      res.render('resUpload', {name: ''});
  else{
    let name = filedata.originalname;

    res.render('resUpload', {name: name});
    connection.query(`insert into gallery values('${name}')`, (err, value) => {
        console.log(err);
    }); 
  }
});
 
app.post('/upload-canvas', (req, res, next) => {
  let data_url = `data:image/jpeg;base64, ${req.body.photo}`;
  let time = new Date().toLocaleTimeString();
  var date = new Date().toLocaleDateString();
  let name = date+time;
  name = name.replace(/-/g, '');
  name = name.replace(/:/g, '');


  ba64.writeImageSync(`uploads/${name}`, data_url, function(err){
    if (err) throw err;
  });
  connection.query(`insert into gallery values('${name}.jpeg')`, (err, value) => {
        console.log('cool');
  }); 
});

app.get('/gallery', (req, res, next) => {

  connection.query('select * from gallery', (err,value) => {
    let masName = [];
    for(let i = 0; i < value.length; i++){
      masName[i] = value[i].name;
    }
    res.render('gallery', {img: masName});
  });
});

app.get('/slider-gallery', (req, res, next) => {

  connection.query('select * from gallery', (err,value) => {
    let masName = [];
    for(let i = 0; i < value.length; i++){
      masName[i] = value[i].name;
    }
    res.render('slider-gallery', {img: masName});
  });
});

app.listen(8080);

