const User = require('../models/User');
const Sell = require('../models/Sell');

module.exports = {

    main: async function (req, res, next) {
        console.log(req.body.id_user);
        const sells = await Sell.findAll({
            attributes: ['id_sell', 'Product', 'FinalPrice','DateUp'],
            where: {
                id_user: req.body.id_user
            }
        });
        var title = 'Estatus';
        res.render('website/estatus',{title,sells});
    }
}
