const request = require('request');
const baseUrl = `http://localhost:7000`

test('get current orders', (done) => {
    request.get(`${baseUrl}/api/mobile/customer/currentOrders`, (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/)
        let orders = body.data.rows;
        let invalidOrders = orders.filter((order) => order.status != 'ONGOING');
        expect(invalidOrders.length).toBe(0)
    });
    done();
});

test('get completed orders', (done) => {
    request.get(`${baseUrl}/api/mobile/customer/ordersHistory`, (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/);
        let orders = body.data.rows;
        let invalidOrders = orders.filter((order) => order.status == 'ONGOING' || order.status == 'PENDING');
        expect(invalidOrders.length).toBe(0)
    });
    done();
});

test('complete order', (done) => {
    request.put(`${baseUrl}/api/mobile/customer/finishOrder`,{
        form:{
            order_id:13, 
            employee_id:24, 
            status:'COMPLETED'
        }
    }, (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/)
    });
    done();
});

test('cancel order', (done) => {
    request.put(`${baseUrl}/api/mobile/customer/cancelOrder`,{
        form:{
            order_id:1, 
            employee_id:3, 
            status:'CANCELLED'
        }
    }, (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/)
    });
    done();
});