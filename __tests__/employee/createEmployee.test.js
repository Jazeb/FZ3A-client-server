const request = require('request')
const baseUrl = `http://localhost:7000`

test('create employee', (done) => {
    request.post(`${baseUrl}/api/employees/signup`, {
        form:{
            full_name:"Alex Simon", 
            email: 'alex@gmail.com',
            national_id: 123456, 
            service: 'Developer', 
            password:'passwords',
            role:'SUPERVISOR',
            areas:'mareee',
            ssn:123
        }
    }, (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/)
    });
    done();
});

test('update employee', (done) => {
    request.put(`${baseUrl}/api/employees/update`, {
        form:{
            full_name:"Alex Simon2",
            national_id: 123456, 
            service: 'Developer', 
            role:'SUPERVISOR',
            areas:'mareee2',
            ssn:123
        }
    }, (err, response) => {
        expect(err).toBe(null)
        body = JSON.parse(response.body);
        expect(body.message).toMatch(/success/)
    });
    done();
});