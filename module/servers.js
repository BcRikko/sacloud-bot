var client = require('./sakura_client.js');

module.exports.getList = function (zones) {
    return new Promise(function (resolve, reject) {
        var servers = [];
        
        zones.forEach(function (zone, i) {
            client({
                zone: zone.name
            }).createRequest({
                method: 'GET',
                path  : 'server',
                body  : {
                    Filter: {
                        Scope: 'user'
                    }
                }

            }).send(function (err, result) {
                if (err) return reject(err);
                
                Array.prototype.push.apply(servers, result.response.servers.map(function (server) {
                    return {
                        id  : server.id,
                        name: server.name,
                        plan: server.serverPlan.name,
                        zone: server.zone.name
                    };
                }));

                if (zones.length === i + 1) {
                    resolve(servers);
                }
            });
            
        });
    });
};