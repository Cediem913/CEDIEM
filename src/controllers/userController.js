const User = require('../models/User');
const queryer = require('../models/queryer');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

var self = module.exports = {

    validateUser:async function (req, res, next) {
        var user = req.params.user;
        var result = await queryer.validateUserFunction(user);
        res.send(result);
    },

    validateEmail:async function (req, res, next) {
        var email = req.params.email;
        var result = await queryer.validateEmailFunction(email);
        res.send(result);
    },

    forgetUser:function (req, res, next) {
        var user = req.params.user;
        var message = '1';

        var userCount = self.existUser(user);

        if(userCount>0){
            var message = 'Usuario ya existe'; 
        }
        res.send(message);
    },

    login: function (req, res, next) {
        var title = 'Registro';
        res.render('website/registro', { title });
    },

    loginP: async function (req, res, next) {
        const { user, email, confirmEmail, password } = req.body;
        console.log({user, email, confirmEmail, password });
        const errors = [];
        if (user.length == 0 || email.length == 0) {
            errors.push({ text: 'los campos de usuario y correo no pueden ir vacíos' });
        }
        if (email != confirmEmail) {
            errors.push({ text: 'los correos no coinciden' });
        }
        if (password.length < 5) {
            errors.push({ text: 'las contraseña es menor a 5 caracteres' });
        }
        userValidations = await queryer.validateUserFunction(user);
        if (userValidations != 1) {
            errors.push({ text: userValidations });
        }
        emailValidations = await queryer.validateEmailFunction(email);
        if (emailValidations != 1) {
            errors.push({ text: emailValidations });
        }
        if (errors.length > 0) {
            res.render('website/registro', { errors, user, email, password, confirmEmail })
        } else {
            try {
                var salt = await bcrypt.genSalt(5);
                const tokenPublic = await bcrypt.hash((user + email + password),salt);
                salt = await bcrypt.genSalt(2);
                const tokenSession = await bcrypt.hash(Date.now().toString(),salt);
                /*let authorizedUser = await User.create({
                    id_user: user,
                    Email: email,
                    Secret: password,
                    TokenPublic: tokenPublic,
                    TokenSession: tokenPublic,
                    IsActive: -1,
                    dateUp: Date.now()
                });*/authorizedUser = true;
                sendEmail(email,"nocontestar@cediem.com",{subject:"Activacion Cediem",text:"<b>Hola " + user + " abre este enlace para activar tu <a href ='#'>cuenta</a></b>"});

                console.log({
                    id_user: user,
                    Email: email,
                    Secret: password,
                    TokenPublic: tokenPublic,
                    TokenSession: tokenSession,
                    IsActive: -1,
                    dateUp: Date.now()
                });

                if (authorizedUser) {
                    var success_msg = 'Registro correcto, accede a tu correo ('+email+') para activar tu cuenta';
                    res.render('website/acceso',{success_msg});
                }
            } catch (e) {
                console.log("xxxxxxxxxxxxxxxxxx"+e);
                if (e.errors[0].message == 'PRIMARY must be unique') {
                    errors.push({ text: 'El usuario "' + user + '" ya existe, intenta acceder con el' });
                } else {
                    errors.push({ text: 'Problemas con el sistema intenta de nuevo mas tarde' });
                }
                
                res.send(e);
                //res.render("website/acceso", {errors});
            }
        }
    },

    logoutP: async function (req, res, next) {
        const { id_user, token} = req.body;
        user2 = await User.findOne({
            attributes: ['id_user', 'Secret', 'Email','IsActive','TokenPublic'],
            where: {
                id_user: id_user,
                TokenSession: token
            }
        });

        
        if(user2 != null || user2 != undefined){
            await User.update(
                {TokenSession: null},
                {where: { id_user: user2.id_user }}
            );
            console.log({TokenSession: null},{where: { id_user: user2.id_user }});
            req.session.destroy(err => {
                if (err) {
                    res.redirect('/');
                }
                res.clearCookie(process.env.COOKIE_SESION_ID);
                res.redirect('/acceso');
            });
        }else{
            res.redirect('/');
        }
    },

    signin: function (req, res, next) {
        var title = 'Acceso';
        referer = req.headers.referer;
        res.render('website/acceso', { title, referer});
    },

    signinP: async function (req, res, next) {
        const { user, password, referer } = req.body;
        var errors = [];
        if (user && password) {
            var user2 = await User.findOne({
                attributes: ['id_user', 'Secret', 'Email','IsActive','TokenPublic','TokenSession'],
                where: {
                    id_user: user
                }
            });

            if(user2 == undefined || user2 == null){
                user2 = await User.findOne({
                    attributes: ['id_user', 'Secret', 'Email','IsActive','TokenPublic','TokenSession'],
                    where: {
                        Email: user
                    }
                });
            }

            var isCorrect = false;
            if (user2 && password) {
                isCorrect = user2.Secret == password;
            }

            if (isCorrect) {
                if(user2.IsActive == 1){
                    salt = await bcrypt.genSalt(2);
                    const tokenSession = await bcrypt.hash(Date.now().toString(),salt);
                    await User.update(
                        {dateSesion: Date.now(),
                        TokenSession: tokenSession},
                        {where: { id_user: user2.id_user }}
                    );
                    req.session.id_user = user2.id_user;
                    req.session.Secret = user2.Secret;
                    req.session.Email = user2.Email;
                    req.session.TokenPublic = user2.TokenPublic;
                    req.session.TokenSession = user2.TokenSession;
                    res.redirect(referer!= undefined? referer:'/');
                }else if(user2.IsActive == -1){
                    res.render('website/acceso', { errors:[{ text: 'Usuario inactivo, accede a tu correo para activarlo' }]});
                }else if(user2.IsActive == 0){
                    res.render('website/acceso', { errors:[{ text: 'Usuario deshabilitado, ponte en contacto con nosotros para recibir ayuda' }]});
                }else{
                    res.render('website/acceso', { errors:[{ text: 'Usuario inválido' }]});
                }
            } else {
                errors.push({ text: 'Usuario y/o contraseña erroneos' });
                res.render('website/acceso', { errors });
            }
        } else {
            errors.push({ text: 'Usuario y/o contraseña en blanco' });
            res.render('website/acceso', { errors });
        }
    },

    forget: function (req, res, next) {
        var title = 'Olvido';
        res.render('website/olvido', { title });
    },

    forgetP: async function (req, res, next) {
        var user = req.body.user;
        var errors = [];
        var success_msg;
        var title = "Olvido";

        if(user == undefined || user == null || user == ""){
            errors.push({ text: 'Usuario y/o correo en blanco' });
        }else{
            var user2 = await User.findOne({
                attributes: ['id_user', 'Secret', 'Email','IsActive','TokenPublic'],
                where: {
                    id_user: user
                }
            });
            if(user2 == undefined || user2 == null){
                user2 = await User.findOne({
                    attributes: ['id_user', 'Secret', 'Email','IsActive','TokenPublic'],
                    where: {
                        Email: user
                    }
                });
            }
            if(user2 == null || user2 == undefined){
                errors.push({text:"El usuario o correo no están registrados, intenta de nuevo"})
            }else{
                //mandar correo con token de sesion nuevo para validar, y en caso de que no indicar que está cancelado
                //enviarCorreo(user2.Email,user2.TokenSession,user2.id_user)
                success_msg = 'Se ha enviado un correo a "'+ user2.Email +'" de manera exitosa' ;
            }
        }
        res.render('website/olvido', { title,errors,success_msg });
    },

    recover: async function (req, res, next) {
        var title = 'Recuperar';
        var {user,token} = req.params;
        var recover = false;
        var errors = [];

        var userQ = await User.findOne({
            attributes: ['id_user', 'Secret', 'Email','IsActive','TokenPublic'],
            where: {
                id_user: user,
                TokenSession: token
            }
        });

        if(userQ != null || userQ != undefined){
            recover = true;
        }else{
            errors.push({text: "El link de recuperación caducó vuelve a generar uno"});
            var title = 'Error';
        }
        res.render('website/recuperar', { title,errors,recover,token,user});
    },

    recoverP: async function (req, res, next) {
        var title = 'Recuperar';
        var {user,token,newPassword ,confirmPassword} = req.body;
        console.log({user, token,newPassword ,confirmPassword})
        var recovered = true;
        const success_msg = "Has modificado tu contraseña, accede de nuevo con ella";

        res.render('website/recuperar', { title,recovered,success_msg});
    },

    activate: async function (req, res, next) {
        res.render('website/activar',{activated:true});
    },

    faq: async function (req, res, next) {
        res.render('website/dudas');
    }
}

function sendEmail(to, from, email) {
    var transporter = nodemailer.createTransport({
        service:"Godaddy",
        host: "smtpout.secureserver.net",  
        secureConnection: true,
        port: 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_AUTH
        }
    });
    var mailOptions = {
        from: from,
        to: to,
        subject: email.subject,
        text: email.text
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error){
            console.log(error);
        } else {
            console.log("Email sent");
        }
    });
}
