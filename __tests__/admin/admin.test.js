const request = require('request');

const url = 'http://localhost:7000';

test('Admin get PRODUCTS', async (done) => {
    request.get(url + '/api/admin/getProducts', (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/);
    });
    done();
})

test('Admin get Notifications', async (done) => {
    request.get(url + '/api/admin/getNotifications', (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/);
    });
    done();
})

test('Admin get Services', async (done) => {
    request.get(url + '/api/admin/getServices', (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/);
    });
    done();
})

test('Admin get Employees', async (done) => {
    request.get(url + '/api/admin/getEmployees?role=MANAGER', (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/);
    });
    done();
});

test('Admin get Employees', async (done) => {
    request.get(url + '/api/admin/getEmployees?role=SUPERVISOR', (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/);
    });
    done();
});

test('Admin get Employees', async (done) => {
    request.get(url + '/api/admin/getEmployees?role=LABOUR', (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/);
    });
    done();
});

test('Admin get Offers', async (done) => {
    request.get(url + '/api/admin/getOffers', (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/);
    });
    done();
});

test('Admin get Customers', async (done) => {
    request.get(url + '/api/admin/getCustomers', (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/);
    });
    done();
});

test('Admin get Orders', async (done) => {
    request.get(url + '/api/admin/getOrders?status=COMPLETED', (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/);
    });
    done();
});