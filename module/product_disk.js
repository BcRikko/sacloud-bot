var client = require('./sakura_client.js');

module.exports.getList = function(zone) {
    return new Promise(function (resolve, reject) {
        client({
            zone: zone
        }).createRequest({
            method: 'GET',
            path  : 'product/disk',
            body  : {
                Availability: 'available'
            }

        }).send(function (err, result) {
            if (err) reject(err);
            
            var diskPlan = result.response.diskPlans.filter(function (plan){
                // 暫定的に SSDプランのみ
                return plan.name.indexOf('SSD') > -1
            });
            
            var plans = diskPlan[0].size.filter(function (disk) {
                // 暫定的に 100GB以下のい
                return disk.sizeMB <= 102400;
            }).map(function (disk) {
                return {
                    id    : diskPlan[0].id,
                    sizeMB: disk.sizeMB,
                    name  : disk.displaySize + disk.displaySuffix
                };
            });
            
            resolve(plans);
        });
    });
};