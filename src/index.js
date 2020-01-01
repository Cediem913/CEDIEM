const express = require('express');
const path = require('path');
const exhbs = require('express-handlebars')
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require('body-parser');

//Initializations
const app = express();
require('./database');

//Settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exhbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: [
        path.join(app.get('views'), 'website'),
        path.join(app.get('views'), 'partials')
    ],
    extname: '.hbs'
}));
app.set('view engine', '.hbs');
//require('./authentication/passport')(passport);

//Static files
app.use(express.static(path.join(__dirname, 'public')));

//Middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({
    name: process.env.COOKIE_SESION_ID,
    resave: false,
    saveUninitialized: true,
    secret: process.env.COOKIE_SESION_SECRET,
    cookie: {
        maxAge: parseInt(process.env.COOKIE_MAX_AGE),
        sameSite: true,
        httpOnly: false,
        secure: false
    }
}));
app.use(passport.initialize());
app.use(passport.session())
app.use(flash());
app.use(require('./controllers/mainController').checkUsers);
app.use(cookieParser());

//Routes
app.use(require('./routes/main'));
app.use(require('./routes/roots'));
app.use(require('./routes/courses'));
app.use(require('./routes/services'));
app.use(require('./routes/status'));
app.use(require('./routes/teachers'));
app.use(require('./routes/magazines'));
app.use(require('./routes/users'));

//Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

//Server listening
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});