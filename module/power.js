var client = require('./sakura_client.js');

module.exports.up = function (server) {
    return new Promise(function (resolve, reject) {
        client({
            zone: server.zone
        }).createRequest({
            method: 'put',
            path  : 'server/' + server.id + '/power',
            
        }).send(function (err, result) {
            resolve(result.response.success || !err);
        });
    });
};


module.exports.down = function (server) { 
    return new Promise(function (resolve, reject) {
        client({
            zone: server.zone
        }).createRequest({
            method: 'delete',
            path  : 'server/' + server.id + '/power',
            
        }).send(function (err, result) {
            resolve(result.response.success || !err);
        });
    });
};