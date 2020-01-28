const User = require('../models/User');

const Course = require('../models/Course');
const Sell = require('../models/Sell');
const Root = require('../models/Root');
const Service = require('../models/Service');

const queryer = require('../models/queryer');
const bcrypt = require('bcrypt');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const service = require('../controllers/serviceController');
const user = require('../controllers/userController');

var self = module.exports = {

    main: function (req, res, next) {
        var title = 'Inicio';

        var fields = queryer.getCourseBasicFields();
        var filter = queryer.getCourseBasicFilter();
        var orderBy = [['StartDate', 'ASC']];
        const courses = Course.findAll({ attributes: fields, where: filter, limit: 15, order: orderBy });

        fields = queryer.getRootBasicFields();
        filter = queryer.getRootBasicFilter();
        const roots = Root.findAll({ attributes: fields, where: filter });

        fields = queryer.getServiceBasicFields();
        filter = queryer.getServiceBasicFilter();
        const services = Service.findAll({ attributes: fields, where: filter, limit: 15 });

        Promise.all([courses, roots, services]).then(responses => {
            res.render('inicio', { title, courses: responses[0], roots: responses[1], services:responses[2] });
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

    prepare: async function (req, res, next) {
        var {type, product} = req.params;
        var parameters = {type, product};
        var result = {};
        var title = "";

        if(type == 1){
            result.title = "Apartar Curso";
            //validator result = await course.validateCourseBeforeBuy(product);
            result.type = "Aparta tu Curso";
            result.isService = true;
        }else if(type == 2){
            title = "Apartar Servicio";
            result = await service.validateServiceBeforeBuy(product);
            result.type = "Aparta tu servicio";
            result.isService = true;
        }
        //console.log(result)
        res.render('website/prepara',{title, result, type, product, parameters});
    },

    buyWithCard: async function (req, res, next) {
        var service = require('../controllers/serviceController');
        var {type, product} = req.body;
        var params = req.body;
        var result = {};
        var title = "Compra erronea";
        var path = "/";
        var errors;

        if(type == 1){
            path = '/curso/';
        }else if(type == 2){
            path = '/servicio/';
            result = await service.validateServiceBeforeBuy(product);
            if(result.available){
                title = "Compra exitosa";
                result.id_sell = await service.buyProduct(result,params);
            }else{
                errors.push(result.message);
            }
            result.isService = true;
        }
        
        //res.render('website/comprado',{result,title});
        res.send({result,errors,title});
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
                attributes: ['id_user', 'Secret', 'Email','TokenPublic','TokenSession'],
                where: {
                    id_user: id_user
                }
            });
        }
        next();
    }
}
