const Course = require('../models/Course');
const queryer = require('../models/queryer');
const db = require('../database');

module.exports = {

    courses: function (req, res, next) {
        var title = req.params.id_ramo;

        var fields = queryer.getCourseBasicFields();
        var filter = queryer.getCourseBasicFilter();
        var orderBy = [['StartDate', 'ASC']];

        if (title) {
            filter.id_root = title;
        } else {
            title = 'Todos los cursos'
        }

        const courses = Course.findAll({ attributes: fields, where: filter, limit: 10, order: orderBy }).then(courses => {
            res.render('website/cursos', { title, courses });
        }).catch(err => {
            res.send(err)
            //res.render('website/error', { title });
        });
    },

    findCourses: function (req, res, next) {
        var title = req.params.query;
        var query = title;

        var fields = queryer.getCourseBasicFields();
        var filter = queryer.getCourseBasicFilter();
        var orderBy = [['StartDate', 'ASC']];
        var currentPage = parseInt(req.params.page);
        var sizePages = 4;
        var sizePagesLength = 2;
        var offsetPages = 0;
        var totalPages = 0;
        var Op = require("sequelize").Op;

        if (title) {
            title = 'Bucar por...' + query;

            filter = {
                IsActive: 1,
                [Op.or]:{
                    id_course: {
                        [Op.like]: '%' + query + '%'
                    },
                    id_root: {
                        [Op.like]: '%' + query + '%'
                    },
                    Description: {
                        [Op.like]: '%' + query + '%'
                    }
                }
            };

        } else {
            title = 'Todos los cursos';
            query = "";
        }

        //console.log({ attributes: fields, where: filter, order: orderBy, limit: 2, offset: currentPage });
        Course.count({ where: filter }).then(courses => {
            //res.render('website/cursos', { title, courses, query });
            totalPages = Math.round((courses / sizePages)+0.25);
            console.log(totalPages);
        }).catch(err => {
            res.send(err)
            //res.render('website/error', { title });
        });

        if (currentPage >= 1 || currentPage <= totalPages) {
            offsetPages = ((currentPage * sizePages) - sizePages);
            //console.log("offset: " + offsetPages);
        } else {
            offsetPages = 0;
        }

        Course.findAll({ attributes: fields, where: filter, order: orderBy, limit: sizePages, offset: offsetPages }).then(courses => {
            var pages = {
                currentPage: currentPage,
                totalPages: totalPages,
                array: {}
            };

            if (totalPages >= 1) {
                pages.show = true;
            }

            //

            if (currentPage > sizePagesLength) {
                pages.firstDummy = { active: true }
            } else {
                pages.firstDummy = { active: false }
            }
            const array = [];
            for (var i = (currentPage - sizePagesLength); i <= currentPage; i++) {//resta
                if (i > sizePagesLength/*-1*/) {
                    array.push({ field: (i - 1), active: false });
                }
            }

            if(currentPage > 1 && currentPage < totalPages){
                array.push({ field: currentPage, active: true });
            }

            for (var j = currentPage; j < (currentPage + sizePagesLength); j++) {//suma
                if (j < (totalPages-(1))) {
                    array.push({ field: (j + 1), active: false });
                }
            }

            if (currentPage > (totalPages - sizePagesLength)) {
                pages.lastDummy = { active: false }//false
            } else {
                pages.lastDummy = { active: true }
            }

       /* */if (currentPage == 1) {
                pages.firstItem = { active: true };//true
            } else {
                pages.firstItem = { active: false }
            }
            console.log(array);
            pages.array = array;

            if (currentPage == totalPages) {
                pages.lastItem = { active: true }
            } else {
                pages.lastItem = { active: false }
            }

            //console.log({ title, query, pages });

            res.render('website/cursos', { title, courses, query, pages });
            //res.send({ title, courses, query, currentPage, totalPages });
        }).catch(err => {
            res.send(err)
            //res.render('website/error', { title });
        });
    },

    course: function (req, res, next) {
        var title = req.params.id_curso;

        var attributes = [
            'id_course', 'id_root', 'Description', 'Price', 'StartDate', 'EndDate',
            'Schedule', 'Duration', 'Image', 'Map', 'Video', 'Syllabus', 'Benefits', 'Documents','Modal'
        ];

        var where = {
            id_course: title,
            IsActive: 1
        };

        selectCourses(attributes, where).then(course => {
            res.render('website/curso', { title, course });
        }).catch(err => {
            res.render('website/error', { title });
        });
    }
}

function selectCourses(fields, filter) {
    return Course.findAll({
        attributes: fields,
        where: filter
    });
}