const { Employees, Users } = require('../../model/index');
const { encryptPassword } = require('../../shared/shared');

module.exports = {
    employeeSignup,
    updateProfile
}

function employeeSignup(employee) {
    return new Promise(async (resolve, reject) => {
        let password = await encryptPassword(employee.password);
        const emp = {
            full_name: employee.full_name,
            email: employee.email,
            phone_number: employee.phone_number,
            national_id: employee.national_id,
            service: employee.service,
            role: employee.role,
            areas: employee.areas,
            ssn: employee.ssn,
        }
        Employees.create(emp)
            .then((data) => {
                Users.create({
                    full_name: data.full_name,
                    email: data.email,
                    password: password,
                    user_type: 'employee', // change it to EMPLOYEE on every place
                    role: employee.role,
                    user_id: data.id,
                })
                    .then((data) => resolve(data))
                    .catch((err) => reject(err));
            })
            .catch((err) => reject(err));
    });
}

function updateProfile(data) {
    delete data.id
    delete data.role
    delete data.email
    delete data.user_type
    return new Promise((resolve, reject) => {
        Employees.update(data, { where: { id: data.user_id, role: data.user_role} })
            .then(() => resolve(true))
            .catch(err => reject(err));
    });
}