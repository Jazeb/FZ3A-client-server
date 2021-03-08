const request = require('request')
test('Test server', (done) => {
    request.get('http://localhost:7000/', (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.status).toBe(true)
    });
    done();
})