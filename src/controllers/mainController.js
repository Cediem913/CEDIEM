const User = require('../models/User');

const Course = require('../models/Course');
const Sell = require('../models/Sell');

const Root = require('../models/Root');
const queryer = require('../models/queryer');
const bcrypt = require('bcrypt');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

var self = module.exports = {

    main: function (req, res, next) {
        var title = 'Inicio';

        var fields = queryer.getCourseBasicFields();
        var filter = queryer.getCourseBasicFilter();
        var orderBy = [['StartDate', 'ASC']];
        const courses = Course.findAll({ attributes: fields, where: filter, limit: 10, order: orderBy });

        fields = queryer.getRootBasicFields();
        filter = queryer.getRootBasicFilter();
        const roots = Root.findAll({ attributes: fields, where: filter });

        Promise.all([courses, roots]).then(responses => {
            res.render('inicio', { title, courses: responses[0], roots: responses[1] });
        }).catch(err => {
            console.log(err);
        });
    },

    signinDirect: function (req, res, next) {
        var title = 'Acceso directo';
        res.render('website/acceso_directo', { title });
    },

    checkOutP: async function (req, res, next) {
        const customer = await stripe.customers.create({
            email: req.body.stripeEmail,
            source: req.body.stripeToken
        });

        const charge = await stripe.charges.create({
            amount: req.param('price'),
            currency: 'MXN',
            description: req.param('id_user') + '_' + req.param('product'),
            customer: customer.id,
        });

        const toinsert = {
            id_sell: charge.id,
            id_user: req.param('id_user'),
            Product: req.param('product'),
            Price: req.param('price'),
            StartDate: req.param('startDate'),
            EndDate: req.param('startDate'),
            Map: req.param('map'),
            SellDate: Date.now()
        }

        const sell = await Sell.create(toinsert);
        res.redirect('/',{message:[{Text:"Compra exitosa, accede a tu estatus para saber mas"}]});
    },

    buy: async function (req, res, next) {
        var service = require('../controllers/serviceController');
        var {type, product} = req.params;
        var result = {};

        if(type == 1){
            result.type = "Curso";   
        }else if(type == 2){
            result.type = "Servicio";
            service.validateServiceBeforeBuy(product); 
        }

        var title = "Comprar " + result.type;
        res.render('website/compra',{title, type,product});
    },

    contact: function (req, res, next) {
        var title = 'Contacto';
        res.render('website/contacto', { title });
    },

    //middleWares para redireccionar y para responder sesiones

    redirectLogin: (req, res, next) => {
        console.log('redirect login');
        if (!req.session.id_user) {
            res.redirect('/acceso');
        } else {
            next();
        }
    },

    redirectHome: (req, res, next) => {
        console.log('redirect home');
        if (req.session.id_user) {
            res.redirect('/cursos/1');
        } else {
            next();
        }
    },

    checkUsers: async (req, res, next) => {
        const { id_user, Email, Secret, TokenPublic} = req.session;
        console.log('ReqSesionUser_' + id_user + Email + Secret + TokenPublic);
        if (id_user) {
            res.locals.user = await User.findOne({
                attributes: ['id_user', 'Secret', 'Email','TokenPublic'],
                where: {
                    id_user: id_user
                }
            });
        }
        next();
    }
}
