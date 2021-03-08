const { Products } = require('../../model/index')

module.exports = {
    addProduct
};

function addProduct(product) {
    console.log('adding product');
    let { title, description, price, inventory, tax_rate } = product;
    return new Promise((resolve, reject) => {
        Products.create({
            title, description, price, inventory, tax_rate
        })
        .then((added) => resolve(true))
        .catch((err) => reject(err));
    });
}
