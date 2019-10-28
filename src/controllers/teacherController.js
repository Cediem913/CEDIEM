const Teacher = require('../models/Teacher');
const db = require('../database');

module.exports = {

    teachers: function (req, res, next) {
        var title = 'Profesores';

        var attributes = [
            'id_teacher', 'Name', 'Image', 'Specialties', 'Description', 'Twitter', 'WhatsApp', 'Cordination', 'AcademicRate'
        ];

        var where = {};

        if (req.params.id_especialidad) {
            title = 'Especialistas en ' + req.params.id_especialidad;
            where.Specialties = '%' + req.params.id_especialidad + '%';
        }

        selectTeacherss(attributes, where).then(teachers => {
            res.render('website/profesores', { title, teachers });
        }).catch(err => {
            res.send(err);
        });
    }
}

function selectTeacherss(fields, filter) {
    return Teacher.findAll({
        attributes: fields,
        where: filter
    });
}