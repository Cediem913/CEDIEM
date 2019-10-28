const Course = require('./Course');
const User = require('../models/User');
const Regex = require('regex');

exports.getCourseBasicFields = function() {
    return fields = [
        'id_course', 'id_root','Description', 'Price',
        'StartDate', 'Duration', 'Image','StartDate'
    ]
}

exports.getCourseBasicFilter = function(){
    return filter = {
        IsActive: 1
    };
}

exports.getRootBasicFields = function() {
    return fields = [
        'id_root', 'Description', 'Image'
    ]
}

exports.getRootBasicFilter = function(){
    return where = {
        IsActive:1
    };
}

exports.validateUserFunction = async function (username){
    var message = '1';
    /*var regex = new Regex(/[!@#$%^&*()/,.?":{}|<>-]/);
    if(regex.test(user)){
        var message = 'Usuario solo puede llevar _';
        return message;
    }*/

    if(/[^A-Za-z0-9-_]/.test(username)){
        var message = 'Usuario solo puede llevar letras y guión bajo';
        return message;
    }

    if(username.startsWith("-") || username.startsWith("_")){
        var message = 'Usuario no puede empezar con guión';
        return message;
    }

    if(username.endsWith("-") || username.endsWith("_")){
        var message = 'Usuario no puede acabar con guión';
        return message;
    }
    
    if(username.match(/^\d/)){
        var message = 'Usuario no puede empezar con número';
        return message;
    }

    if(username.length < 5){
        var message = 'Usuario no puede ser menor a 5 caracteres';
        return message;
    }

    var userCount = await this.existUser(username);
    if(userCount>0){
        var message = 'Este usuario ya existe'; 
        return message;
    }
    return message;
};

exports.validateEmailFunction = async function (email){
    var message = '1';

    var userCount = await this.existEmail(email);
    if(userCount>0){
        var message = 'Este correo ya existe'; 
        console.log(message)
        return message;
    }
    return message;
};

exports.existUser = async function (username){
    var user = await User.count({ attributes: ['id_user','Secret','Email','TokenPublic'], where: {id_user:username} })
    return user;
}

exports.existEmail = async function (email){
    var user = await User.count({ attributes: ['id_user','Secret','Email','TokenPublic'], where: {email:email} })
    return user;
}
