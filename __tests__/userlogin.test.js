const request = require('request')
const baseUrl = `http://localhost:7000/api`

test('User Login', (done) => {
    request.post(`${baseUrl}/auth/login`, {
        form:{
            email:'',
            password:''
        }
    }, (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/)
    });
    done();
});