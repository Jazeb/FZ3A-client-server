const _ = require('lodash');

const productService = require('../services/product');
const response = require('../../config/response');
const view = require('../../shared/queries/view');
const update = require('../../shared/queries/update')

module.exports = {
    updateCtrl,
    getProducts,
    getProduct,
    addProduct,
    getProductOrders,
    deleteOrder,
    updateStatus,
    updateProduct
}

async function updateCtrl(req, res) {
    try {
        const body = req.body;
        if (!['PRODUCT_ORDER', 'PRODUCT'].includes(body.table_name))
            return response.apiError(res, 'invalid table type');

        let updated = await update.update(body);
        return updated && response.apiSuccess(res, 'Updated successfully');
    } catch (err) {
        console.error(err);
        return response.apiError(res, 'error updating user, must be server error :)')
    }
}

async function getProducts(req, res) {

    try {
        let body = req.query,
            limit = body.limit ? body.limit : 10,
            offset = body.offset ? body.offset * limit : 0,
            table_name = 'PRODUCTS';

        let result = await view.getAllData({ table_name, limit, offset, query: body });
        response.apiSuccess(res, result);
    } catch (err) {
        console.error(err);
        return response.apiError(res, 'unable to get products', err);
    }
}

async function getProduct(req, res) {
    try {
        let product_id = req.query.id;
        if (!product_id)
            return response.apiError(res, 'Provide product id');

        let product = await view.getByKey({ table_name: 'PRODUCTS', key: 'id', value: product_id });
        return product && response.apiSuccess(res, product)
    } catch (err) {
        console.error(err)
        return response.apiError(res, 'Error in server getting product data')
    }
}
async function addProduct(req, res) {

    try {
        let { title, description, price, inventory, tax_rate } = req.body;
        if (_.isEmpty(title || _.isEmpty(description)) || !price || _.isEmpty(inventory) || !tax_rate)
            return resp.apiError(res, 'Provide required data');

        if (!req.files || !req.files.image)
            return response.apiError(res, "Image not found");


        let file = req.files.image;
        let fileName = file.name;
        fileName = fileName.replace(" ", "_");
        fileName = fileName.split(".");
        fileName = "/image_" + Date.now() + "." + fileName.reverse()[0];
        file.mv(process.cwd() + "/server/assets/product/images" + fileName, err => {
            return err && response.apiError(res, err);
        }
        );

        // check if product already exist
        let found = await view.getByKey({ table_name: 'PRODUCTS', key: 'title', value: title });
        if (_.isEmpty(found)) {
            let data = { title, description, price, inventory, tax_rate, fileName };
            let added = await productService.addProduct(data);
            return added && response.apiSuccess(res, 'Product added successfully');
        }
        else {
            let updated = await productService.updateProduct({ id: found.id, value: 1 });
            return updated && response.apiSuccess(res, 'Product added successfully');
        }
    } catch (err) {
        console.error(err)
        return response.apiError(res, 'error adin produc', err);
    }
}

async function getProductOrders(req, res) {

    try {
        let body = req.query,
            limit = body.limit ? body.limit : 10,
            offset = body.offset ? body.offset * limit : 0;

        if (!['PENDING', 'COMPLETED'].includes(body.status))
            return response.apiError(res, 'invlaid status provided');
        let result = await productService.getProductOrders(body.status, limit, offset);
        return response.apiSuccess(res, { count: result.length, rows: result });
    } catch (err) {
        console.error(err)
        return response.apiError(res, 'unable to retrieve product orders', null, err)
    }
}

async function deleteOrder(req, res) {

    try {
        let order_id = req.body.order_id;

        let result = await productService.deleteOrder(order_id);
        result && response.apiSuccess(res, 'Order deleted successfully');
        return
    } catch (err) {
        console.log(err)
        return response.apiError(res, 'unable to delete product orders', null, err)
    }
}

async function updateStatus(req, res) {

    try {
        let { order_id, status } = req.body;
        if (!order_id || _.isEmpty(status))
            return resp.apiError(res, 'provide required data')

        let table_name = req.route.path == '/updateStatus' ? 'PRODUCTS' : 'PRODUCT_ORDERS';
        let updated = await update.updateStatus({ table_name, id: order_id, status })
        return updated && response.apiSuccess(res, 'ProductOrder status updated successfully');
    } catch (err) {
        console.error(err)
        return response.apiError(res, 'unable to update order status', null, err)
    }
}

async function updateProduct(req, res) {
    try {
        let data = req.body;
        data.table_name = 'PRODUCT';

        let file = req.files && req.files.image;
        let fileName = file.name.replace(' ', '_').split('.').reverse()[0];
        fileName = '/image_' + Date.now() + '.' + fileName;

        let dest_url = process.cwd() + '/server/assets/products' + fileName;
        file.mv(dest_url);

        data.image = fileName
        let updated = await update.update(data);
        return updated && response.apiSuccess(res, 'Product updated')
    } catch (err) {
        console.error(err);
        return response.apiError(res, 'Error in server updating product')
    }
}