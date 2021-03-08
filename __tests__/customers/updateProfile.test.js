const request = require('request')
const baseUrl = `http://localhost:7000`

test('create customer', (done) => {
    request.put(`${baseUrl}/api/mobile/customer/updateProfile`, {
        form:{
            full_name:"Jazeb Munir", 
            phone_number:123123,
            gender:'M',
            dob:'06:06:1995',
            image:'/image.jpeg'
        }
    }, (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/)
    });
    done();
});