const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser')
const loginRoutes = require('./routes/login');
const { redirect } = require('express/lib/response');
const path = require('path');
const fileUpload = require('express-fileupload');


const app = express();
app.set('port', 4000);
app.use(fileUpload());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));

app.use(express.static('public'));

app.get('/dashboard/dashboard', (req, res) => {
	res.render('dashboard/dashboard'); 
  });

app.get('/login/index', (req, res) => {
	res.render('login/index'); 
  });
app.get('tasks/create', (req, res) => {
	res.render('tasks/create'); 
  });
app.get('/login/registroTienda', (req, res) => {
	res.render('login/registroTienda'); 
  });
app.get('/login/registroUsuario', (req, res) => {
	res.render('login/registroUsuario'); 
  });

  app.get('/tasks/dash', (req, res) => {
	res.render('tasks/dash'); 
  });

app.set('views', __dirname + '/views');
app.engine('.hbs', engine({
	extname: '.hbs',
}));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(myconnection(mysql, {
 host: 'localhost',
 user: 'root',
 password: '',
 port: 3306,
 database: 'daniel'
}, 'single'));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.listen(app.get('port'), () => {
 console.log('listening on port ', app.get('port'));
});

app.use('/', loginRoutes);

app.get('/', (req, res) => {
	if (req.session.loggedin) {
		let name = req.session.name;

 		res.render('home', { name });
	} else {
		res.redirect('/login');
	}
});
