const redis = require("redis");
const client = redis.createClient();

const resp = require('../../config/response');
client.on('error', err => console.error(err));

module.exports = {
    get,
    set,
    del
}

function del(key) {
    client.del(key, (err, response) => {
        if(err) console.error(err);
        else console.log(`${key} deleted from redis`);
    })
}

// function GET(key) {
//     return new Promise((resolve, reject) => {
//         client.get(key, (err, response) => {
//             err && console.error(err);
//             return resolve(response);
//         })
//     });
// }

function get(req, res, next) {
    console.log('Getting from redis');
    let path = req.route.path
    let KEY = path == '/getProducts' ? 'PRODUCT'
        : path == '/getServices' || path == '/services' ? 'SERVICE'
        : path == '/getEmployees' ? req.query.role
        : path == '/getOffers' ? 'OFFER'
        : path == '/getCustomers' ? 'CUSTOMER'  
        : path == '/getOrders' ? 'ORDER_'+req.query.status
        : path == '/getProductOrders' ? 'PRODUCT_ORDER_'+req.query.status
        : path == '/customers' ? 'CUSTOMERS'
        : null;
    
    if(KEY == null)
        return resp.apiError(res, 'Invalid table')

    KEY && client.get(KEY, (err, data) => {
        if (err || data == null) return next()
        else return resp.apiSuccess(res, JSON.parse(data));
    });
}

function set(key, value) {
    value = JSON.stringify(value)
    client.set(key, value);
}