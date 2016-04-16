var client = require('./sakura_client.js');


module.exports.getList = function() {
    return new Promise(function (resolve, reject) {
        client({
            apiRoot: 'api/cloud/1.1/'
        }).createRequest({
            method: 'GET',
            path  : 'zone',
            body  : {
                Sort: 'DisplayOrder'
            }
        }).send(function (err, result) {
            if (err) reject(err);
            
            var zones = result.response.zones.map(function (zone) {
                return {
                    id         : zone.id,
                    name       : zone.name,
                    description: zone.description
                };
            });
            
            resolve(zones);
        });
    });
    
};