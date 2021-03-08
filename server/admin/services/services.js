const { Services } = require('../../model/index');

module.exports = {
    addService
};

// move it to /services/employees.js
function addService(data) {
    return new Promise((resolve, reject) => {
        Services.create({
            title_ar: data.title_ar,
            title_en: data.title_en,
            sub_services: data.sub_services,
            image: data.image,
        })
            .then(() => resolve(true))
            .catch((err) => err && reject(err));
    });
}
