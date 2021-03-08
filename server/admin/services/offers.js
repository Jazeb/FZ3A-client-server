const { Offers } = require('../../model/index');

module.exports = {
    addOffers
};

function addOffers(data) {
    return new Promise((resolve, reject) => {
        Offers.create({
            phone_number: data.phone_number,
            image: data.image,
        })
            .then(() => resolve(true))
            .catch((err) => err && reject(err));
    });
}
