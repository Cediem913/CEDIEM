const Service = require('../models/Service');
const Pagination = require('../utils/pagination');
const sequelize = require('sequelize');
const db = require('../database');
const Op = sequelize.Op;


module.exports = {

    findServices: async function (req, res, next) {
        var title = req.params.query;
        var {page,method} = req.params;
        var sizePage = 4;
        var query = title;
        
        var attributes = [
            'id_service', 'Name', 'Price','Type','id_root','Owner','Info','File', 'Description', 'Duration'
        ];
        var where = {
            IsActive: 1
        };

        if(title){
            title = 'Bucar por...' + query;
            where = {
                IsActive: 1,
                [Op.or]:{
                    Name: {
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
        }else{
            title = "Todos los Servicios";
            query = "";
        }
        const isNumber = await Pagination.validateNumber(page);
        var pageParsed = 1;
        if(isNumber){
            pageParsed = Number.parseInt(page);
        }
        const pageSize = await countServicesPages(where,sizePage);
        const services = await selectServices(attributes, where, pageParsed, sizePage);
        const footer = await Pagination.paginate(pageParsed,2,pageSize);

        //res.send({title, query, services, footer});
        if(method){
            res.render('partials/components/services', { title, query , services, footer, layout:false});
        }else{
            res.render('website/servicios', { title, query , services, footer});
        }
    },

    service: async function (req, res, next) {
        var attributes = [
            'id_service', 'Name', 'Price','Type','id_root','Owner',
            'Info','File', 'Description', 'Duration','Image'
        ];
        var where = {
            id_service: req.params.id_service,
            IsActive: 1
        };
        const service = await selectService(attributes, where);
        if(service[0]){
            var title = service[0].Name;
            rooms = await selectRooms([service[0].Name]);
        }if(rooms[0])
            rooms[0].isIndex = 1;

        //res.send({ title, service, rooms , events});
        res.render('website/servicio', { title, service, rooms });
    },

    listEvents:async function (req, res, next) {
        const id_service = req.params.id_service;
        const id_room = req.params.id_room;
        const dateStart = req.params.date;
        var events = [];
        var errors = [];
        if(await Pagination.validateDate(dateStart)){
            var dateFormat = new Date(dateStart);
            var year = dateFormat.getFullYear() + '-' + ((dateFormat.getMonth()+1)>9?(dateFormat.getMonth()+1):('0' + (dateFormat.getMonth()+1))) + '-' + dateFormat.getDate() + '%';
            const eventsQuery = await selectEvents(id_room,year,id_service,'2');
            console.log(id_room,year,id_service,'2',errors);
            events = getAvailableEvents(eventsQuery);
        }else{
            errors.push({Text:"Error de fecha"})
        }
        
        res.render('partials/components/serviceBar',{ events,errors, layout:false});
    },

    validateServiceBeforeBuy:async function (value) {
        var objs = value.split('|')
        const id_service = objs[0];
        const id_room = objs[1];
        const datetime = objs[2];
        const hourtime = objs[3];
        const name = objs[4];
        console.log(id_service,id_room,hourtime,datetime,name)

        var services = await validateServices(id_service);
        var rooms = await validateRooms(name,id_room);
        var events = await validateEvents(id_service,datetime+" "+hourtime+"%",id_room);

        console.log(events)
        //return utils validation messages funcion que se alimenta de 3 querys
        return {available:false,message:"Error de campos"};
    }
}

function getAvailableEvents(events){
    const period = 2;
    const hourInitial = 7;
    const hourFinal = 22;
    const result = [];
    const available = [];
    //db.query("UPDATE events SET DateStart = '2009-12-19 08:00:00' WHERE id_event = 'eventotal'",{ type: sequelize.QueryTypes.UPDATE});
    events.forEach(
        function(entry){
           var date = new Date (entry.DateStart);
           var hour = (date.getHours() - 1);
           result.push(hour); 
           for(var i = 1; i <= period; i++){
                hour = hour + 1;
                result.push(hour);
           }
        }
    );

    for(var i = hourInitial; i<=hourFinal; i++){
        if(!result.includes(i)){
            var posible = true;
            
            for(var j = 1; j <= period; j++){
                var nextHour = i + 1;
                if(result.includes(nextHour)){
                    posible = false;
                }
            }
        }else{
            continue;
        }
        if(posible){
            available.push({Hour:i});
            i = i + (period-1);
        }
    }
    return available;
}

async function selectService(fields, filter) {
    return await Service.findAll({
        attributes: fields,
        where: filter
    });
}

async function selectServices(fields, filter, page, sizePage) {
    return await Service.findAll({
        attributes: fields,
        where: filter,
        limit: sizePage, 
        offset: ((page-1)*sizePage)
    });
}
async function countServicesPages(filter,page){
    const sizePages = page;
    const result = await Service.count({ where: filter });
    return Math.ceil((result/sizePages));
}
async function selectRooms(values) {
    var result = await db.query("SELECT * FROM rooms r, campus c WHERE r.id_campus = c.id_campus and json_contains(r.Courses->'$[*]',json_array(?)) and r.IsActive = 1",{ replacements: values, type: sequelize.QueryTypes.SELECT});
    return result;
}
async function selectEvents(id_room,date,id_service,type){
    var result = await db.query("SELECT * FROM events WHERE id_room = :id_room and DateStart LIKE :date and id_type = :id_service and Type = :type and IsActive = 1",{ replacements: {id_room: id_room, date:date, id_service:id_service, type:type}, type: sequelize.QueryTypes.SELECT});
    return result;
}


async function validateServices(id_service){
    var result = await db.query("SELECT * FROM services WHERE id_service = :id_service and IsActive = 1",{ replacements: {id_service: id_service}, type: sequelize.QueryTypes.SELECT});
    return result;
}
async function validateRooms(name,id_room) {
    var result = await db.query("SELECT * FROM rooms r, campus c WHERE r.id_campus = c.id_campus and id_room = :id_room and json_contains(r.Courses->'$[*]',json_array(:values)) and r.IsActive = 1",{ replacements: {id_room:id_room,values:name}, type: sequelize.QueryTypes.SELECT});
    return result;
}
async function validateEvents(id_service,date,id_room){
    var result = await db.query("SELECT count(*) FROM events WHERE id_type = :id_service and DateStart LIKE :date and id_room = :id_room and IsActive = 1",{ replacements: {id_service: id_service,date:date, id_room:id_room}, type: sequelize.QueryTypes.SELECT});
    return result;
}