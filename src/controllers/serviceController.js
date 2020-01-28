const Service = require('../models/Service');
const Sell = require('../models/Sell');
//const Product = require('../models/Product');

const Pagination = require('../utils/pagination');
const sequelize = require('sequelize');
const db = require('../database');
const Op = sequelize.Op;

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {

    findServices: async function (req, res, next) {
        var title = req.params.query;
        var {page,method} = req.params;
        var sizePage = 4;
        var query = title;
        
        var attributes = [
            'id_service', 'Name', 'Price','Type','id_root','Owner','Info','Image', 'Description', 'Duration'
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
            service[0].Price = await Pagination.convertQuantityFromDB(service[0].Price);
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
            var today = new Date();
            console.log(today < dateFormat)
            console.log(today , dateFormat)
            
            if(true/*today < dateFormat*/){
                var year = dateFormat.getFullYear() + '-' + ((dateFormat.getMonth()+1)>9?(dateFormat.getMonth()+1):('0' + (dateFormat.getMonth()+1))) + '-' + dateFormat.getDate() + '%';
                const eventsQuery = await selectEvents(id_room,year,id_service,'2');
                //console.log(eventsQuery)
                //console.log(id_room,year,id_service,'2',errors);
                events = getAvailableEvents(eventsQuery);
                if(events.length<1){
                    errors.push({Text:"Sin horarios disponibles este día"});
                }
            }else{
                errors.push({Text:"Solo fechas después de mañana"});
            }
        }else{
            errors.push({Text:"Error de formato de fechas"})
        }
        
        res.render('partials/components/serviceBar',{ events,errors, layout:false});
    },

    validateServiceBeforeBuy:async function (value) {
        var result = {};
        var objs = value.split('|')
        const id_service = objs[0];
        const id_room = objs[1];
        const datetime = objs[2];
        const hourtime = objs[3];
        const name = objs[4];
        console.log(id_service,id_room,datetime,hourtime,name)

        var service = await validateServices(id_service);
        if(service.length>0 && service != undefined){
            //service[0].Price = await Pagination.convertQuantityFromDB(service[0].Price);
            var rooms = await validateRooms(name,id_room);
            if(rooms.length>0 && rooms != undefined){
                var time = {};
                time.from = await Pagination.convertToDateTime(datetime,hourtime,01);
                time.to = await Pagination.convertToDateTime(datetime, parseInt(hourtime,10) + parseInt(service[0].Duration,10),-01);
                var events = await validateEvents(id_service,time,id_room);
                //var events = await validateEvents(id_service,time.from,time.to,id_room);
                if(events.length >0 && events != undefined && events[0]['count(*)']==0){
                    if(await Pagination.validateDate(datetime) && await Pagination.validateNumber(hourtime)){
                        result.available=true;
                        result.product = service[0];
                        result.dateStart = time.from;
                        result.dateEnd = time.to;
                        result.id_room = id_room;
                    }else{
                        result.available=false;
                        result.message="Los parámetros de fecha y hora son erróneos";
                    }
                }else{
                    result.available=false;
                    result.message="El horario solicitado no está disponible";
                }   
            }else{
                result.available=false;
                result.message="El aula solicitada no está disponible";
            }
        }else{
            result.available=false;
            result.message="El producto solicitado no está disponible";
        }
        result.isService = true;
        //return utils validation messages funcion que se alimenta de 3 querys
        console.log(result)
        return result;
    },

    buyProduct:async function (value,body) {
        /*const customer = await stripe.customers.create({
            email: body.stripeEmail,
            source: body.stripeToken
        });

        const charge = await stripe.charges.create({
            amount: value.Price,
            currency: 'MXN',
            description: "req.param('id_user') + '_' + req.param('product')",
            customer: customer.id,
        });*/

        const toInsertSell = {
            id_sell: 1,
            charge: "charge.id",
            PayMethod:1,
            FinalPrice: value.product.Price,
            id_super: null,
            IsActive:1,
            DateUp: Date.now(),
            IsCheck:1
        }
        const toInsertEvent = {
            id_event: 1,
            DateStart: value.dateStart,
            DateEnd: value.dateEnd,
            Duration:value.product.Duration,
            id_type: value.product.id_service,
            Type: 2,
            IsActive:1,
            id_room: value.id_room
        }
        const toInsertProduct = {
            id_sell: 1,
            id_service: value.product.id_service,
            id_course:null,
            info: {price:value.product.Price,date:value.dateStart},
            Offer: {}
        }
        console.log("XXXXXXXXXXXXXXXXXXXXXXXX")
        console.log(toInsertSell, toInsertEvent, toInsertProduct)
        //const sell = await Sell.create(toinsert);
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
    // entre and y type id_type = :id_service and , y antes del active Type = :type and 
    var result = await db.query("SELECT * FROM events WHERE id_room = :id_room and DateStart LIKE :date and IsActive = 1",{ replacements: {id_room: id_room, date:date, id_service:id_service, type:type}, type: sequelize.QueryTypes.SELECT});
    return result;
}
/*
UPDATE `byvggyopbxu1zivnwlt4`.`events` SET `id_event`='1' WHERE `id_event`='eventotal';
UPDATE `byvggyopbxu1zivnwlt4`.`events` SET `id_event`='2' WHERE `id_event`='id de tabla events1';
*/

async function validateServices(id_service){
    var result = await db.query("SELECT id_service,Name,Duration,Info,Price,id_root,Image FROM services WHERE id_service = :id_service and IsActive = 1",{ replacements: {id_service: id_service}, type: sequelize.QueryTypes.SELECT});
    return result;
}
async function validateRooms(name,id_room) {
    var result = await db.query("SELECT r.id_room,c.id_campus,r.name FROM rooms r, campus c WHERE r.id_campus = c.id_campus and id_room = :id_room and json_contains(r.Courses->'$[*]',json_array(:values)) and r.IsActive = 1",{ replacements: {id_room:id_room,values:name}, type: sequelize.QueryTypes.SELECT});
    return result;
}
async function validateEvents(id_service,date,id_room){
    //entre el where y el date id_type = :id_service and
    var result = await db.query("SELECT count(*) FROM events WHERE DateStart BETWEEN :dateStart and :dateEnd and id_room = :id_room and IsActive = 1",{ replacements: {id_service: id_service,dateStart:date.from, dateEnd:date.to, id_room:id_room}, type: sequelize.QueryTypes.SELECT});
    console.log(result)
    return result;
}
