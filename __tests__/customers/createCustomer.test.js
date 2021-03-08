const request = require('request')
const baseUrl = `http://localhost:7000`

test('create customer', (done) => {
    request.post(`${baseUrl}/api/mobile/customer/signup`, {
        form:{
            full_name:"Jazeb Munir", 
            email: 'jazeb0071@gmail.com',
            service: 'Developer', 
            phone_number:123123,
            password:'password123',
            confirm_password:'password123',
        }
    }, (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/)
    });
    done();
});