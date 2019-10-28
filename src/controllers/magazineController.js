const Magazine = require('../models/Magazine');
const db = require('../database');

module.exports = {

    magazines: function (req, res, next) {
        var title = 'Revistas';

        var attributes = [
            'id_magazine', 'Title', 'Image', 'Author','DateRelease', 'Content', 'File'
        ];

        var where = {
            IsActive: 1
        };

        if (req.params.id_especialidad) {
            title = 'Revistas de ' + req.params.id_especialidad;
            //where.Specialties = '%' + req.params.id_especialidad + '%';
        }

        selectMagazines(attributes, where).then(magazines => {
            res.render('website/revistas', { title, magazines });
        }).catch(err => {
            res.send(err);
        });
    }
}

function selectMagazines(fields, filter) {
    return Magazine.findAll({
        attributes: fields,
        where: filter
    });
}