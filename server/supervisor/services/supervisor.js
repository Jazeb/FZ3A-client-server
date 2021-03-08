"use strict"
const { Supervisor, Users } = require('../../model/index');
const { encryptPassword } = require('../../shared/shared');

module.exports = {
    supervisorSignup,
    updateProfile
}

function supervisorSignup(supervisor) {
    return new Promise(async (resolve, reject) => {
        let fields = {
            full_name: supervisor.full_name,
            email: supervisor.email,
            ssn: supervisor.ssn,
            national_id: supervisor.national_id,
            image: supervisor.image,
        };
        try {
            let sup = await Supervisor.create(fields);
            sup && console.log('supervisor created');
            let hashed_password = encryptPassword(supervisor.password);
            let user = await Users.create({
                full_name: supervisor.full_name,
                email: supervisor.email,
                user_id: sup.id,
                password: hashed_password,
                email: supervisor.email,
                user_type:'employee',
                role:'SUPERVISOR'
            });
            user && console.log('user added')
            resolve(user)
        } catch (err) {
            return reject(err)
        }
    });
}

function updateProfile(data) {
    return new Promise((resolve, reject) => {
        let attr = {
            full_name: data.full_name,
            national_id: data.national_id,
            ssn: data.ssn,
            phone_number: data.phone_number,
        };
        Supervisor.update(attr, { where: { id: data.user.user_id } })
            .then(updated => updated && resolve(true))
            .catch((err) => reject(err));
    });
}