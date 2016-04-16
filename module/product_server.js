var client = require('./sakura_client.js');

module.exports.getList = function(zone) {
    return new Promise(function (resolve, reject) {
        client({
            zone: zone
        }).createRequest({
            method: 'GET',
            path  : 'product/server',

        }).send(function (err, result) {
            if (err) reject(err);
            
            var plans = result.response.serverPlans.filter(function (plan){
                // 暫定的に 2コア、2GBまで
                return plan.availability !== 'disabled' && plan.cpu <= 2 && plan.memoryMB <= 2048;
    
            }).map(function (plan) {
                return {
                    id  : plan.id,
                    name: plan.name,
                };
            });
            
            resolve(plans);
        });
    });
};