const Root = require('../models/Root');
const db = require('../database');

module.exports = {

    roots: function (req, res, next) {
        var title = 'Ramos';
        
        var attributes = [
            'id_root', 'Description', 'Image'
        ]

        var where = {}

        selectRoots(attributes,where).then(roots => {
            res.render('website/ramos', { title, roots });
        }).catch(err => {
            res.send(err)
            //res.render('website/error', { title });
        });
    },

    root: function (req, res, next) {
        var title = req.params.id_ramo;

        var attributes = [
            'id_root', 'Description', 'Image'
        ];

        var where = {
            id_root : title,
            IsActive : 1
        }

        selectRoots(attributes,where).then(roots => {
            res.render('website/ramos', { title, roots });
        }).catch(err => {
            res.send(err)
            //res.render('website/error', { title });
        });
    }
}

function selectRoots(fields,filter){
    return Root.findAll({
        attributes: fields,
        where: filter
    });
}