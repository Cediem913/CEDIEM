const User = require('../models/User');
const queryer = require('../models/queryer');
const bcrypt = require('bcrypt');

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
                const salt = await bcrypt.genSalt(10);
                const tokenPublic = await bcrypt.hash((user + email + password),salt);
                const tokenSession = await bcrypt.hash(Date.now().toString(),salt);
                /*let authorizedUser = await User.create({
                    id_user: user,
                    Email: email,
                    Secret: password,
                    TokenPublic: tokenPublic,
                    TokenSession: tokenPublic,
                    IsActive: -1,
                    dateUp: Date.now()
                });*/authorizedUser = true;/* */

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
                    var success_msg = 'Registro correcto, accede a tu correo ( '+email+' ) para activar tu cuenta';
                    res.render('website/acceso',{success_msg});
                }
            } catch (e) {
                if (e | e.errors[0].message == 'PRIMARY must be unique') {
                    errors.push({ text: 'El usuario "' + user + '" ya existe, intenta acceder con el' });
                } else {
                    errors.push({ text: 'Problemas con el sistema intenta de nuevo mas tarde' });
                }
                console.log(e);
                res.send(e);
                //res.render("website/acceso", {errors});
            }
        }
    },

    logoutP: function (req, res, next) {
        req.session.destroy(err => {
            if (err) {
                res.redirect('/');
            }
            res.clearCookie(process.env.COOKIE_SESION_ID);
            res.redirect('/acceso');
        });
    },

    signin: function (req, res, next) {
        var title = 'Acceso';
        res.render('website/acceso', { title });
    },

    signinP: async function (req, res, next) {
        const { user, password } = req.body;
        var errors = [];
        if (user && password) {
            const user2 = await User.findOne({
                attributes: ['id_user', 'Secret', 'Email','IsActive','TokenPublic'],
                where: {
                    id_user: user
                }
            });
            /*const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);*/

            var isCorrect = false;
            if (user2 && password) {
                isCorrect = user2.Secret == password;//await bcrypt.compare(hash, user2.Secret);
            }

            if (isCorrect) {
                if(user2.IsActive == 1){
                    await User.update(
                        {dateSesion: Date.now()},
                        {where: { id_user: user2.id_user }}
                    );

                    req.session.id_user = user2.id_user;
                    req.session.Secret = user2.Secret;
                    req.session.Email = user2.Email;
                    req.session.TokenPublic = user2.TokenPublic;
                    
                    console.log(req.session)
                    res.redirect('/');
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
    }
}
