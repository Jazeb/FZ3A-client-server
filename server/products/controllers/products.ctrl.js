const _ = require('lodash');

const { addProduct } = require('../services/products');
const resp = require('../../config/response');

module.exports = {
    addProducts
};

function addProducts(req, res) {
    const {title, description, price, inventory, tax_rate} = req.body;
    if(_.isEmpty(title || _.isEmpty(description)) || _.isEmpty(inventory) || !price || !tax_rate)
        return resp.apiError(res, 'Provide required data');

    let product_data = {
        title, description, price, inventory, tax_rate
    }
    addProduct(product_data)
        .then((added) => added && resp.apiSuccess(res, 'product added successfully'))
        .catch((err) => {
            resp.apiError(res, 'error adding product');
            console.error(err)
        })
}