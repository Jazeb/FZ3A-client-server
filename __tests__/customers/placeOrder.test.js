const request = require('request')
const baseUrl = `http://localhost:7000`

test('create customer', (done) => {
    request.post(`${baseUrl}/api/mobile/customer/placeOrder`, {
        form:{
            service_type:'app dev', 
            todo:'develop ios app', 
            notes:'develop nice app', 
            datetime: '2020:11:30', 
            images:'test images'
        }
    }, (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/)
    });
    done();
});