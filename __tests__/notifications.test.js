const request = require('request')
const baseUrl = `http://localhost:7000/api/employees`

test('Get notifications', (done) => {
    request.get(`${baseUrl}/notifications`, (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/)
    });
    done();
});

test('Get profile', (done) => {
    request.get(`${baseUrl}/profile`, (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/)
    });
    done();
});

// test('Signup', (done) => {
//     request.post(`${baseUrl}/signup`, (err, response) => {
//         expect(err).toBe(null)
//         body = JSON.parse(response.body);
//         expect(body.message).toMatch(/success/)
//     });
//     done();
// });

test('Get orders', (done) => {
    request.get(`${baseUrl}/getOrders`, (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/)
    });
    done();
});
