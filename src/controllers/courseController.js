const Course = require('../models/Course');
const queryer = require('../models/queryer');
const Pagination = require('../utils/pagination');
const Op = require("sequelize").Op;

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

    findCourses: async function (req, res, next) {
        var title = req.params.query;
        var {page,method} = req.params;
        var sizePage = 4;
        var query = title;

        var attributes = queryer.getCourseBasicFields();
        var where = queryer.getCourseBasicFilter();

        if (title) {
            title = 'Bucar por...' + query;
            where = {
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
        const isNumber = await Pagination.validateNumber(page);
        var pageParsed = 1;
        if(isNumber){
            pageParsed = Number.parseInt(page);
        }
        const pageSize = await countCoursesPages(where,sizePage);
        const courses = await selectCourses(attributes, where, pageParsed, sizePage);
        const footer = await Pagination.paginate(pageParsed,2,pageSize);

        console.log({ title, courses, query, footer });
        if(method){
            res.render('partials/components/courses', { title, query , courses, footer, layout:false});
        }else{
            res.render('website/cursos', { title, query, courses, footer });
        }
    },

    course: function (req, res, next) {
        var title = req.params.id_course;

        var attributes = [
            'id_course', 'id_root', 'Description', 'Price', 'StartDate', 'EndDate',
            'Schedule', 'Duration', 'Image', 'Map', 'Video', 'Syllabus', 'Benefits', 'Documents','Modal'
        ];
        var where = {
            id_course: title,
            IsActive: 1
        };

        selectCourse(attributes, where).then(course => {
            res.render('website/curso', { title, course });
        }).catch(err => {
            res.render('website/error', { title });
        });
    }
}

function selectCourses(fields, filter, page, sizePage) {
    return Course.findAll({
        attributes: fields,
        where: filter,
        limit: sizePage, 
        offset: ((page-1)*sizePage)
    });
}

function selectCourse(fields, filter) {
    return Course.findAll({
        attributes: fields,
        where: filter
    });
}

async function countCoursesPages(filter,page){
    const sizePages = page;
    const result = await Course.count({ where: filter });
    return Math.ceil((result/sizePages));
}