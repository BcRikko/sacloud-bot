var client = require('./sakura_client.js');

module.exports.getList = function (zone) {
    return new Promise(function (resolve, reject) {
        client({
            zone: zone
        }).createRequest({
            method: 'GET',
            path  : 'archive',
            body  : {
                Filter: {
                    Availavility: 'available'
                },
                Sort: [
                    'Scope',
                    'DisplayOrder',
                    'SizeMB',
                    'Name'
                ]
            }

        }).send(function (err, result) {
            if (err) reject(err);
            
            var archives = result.response.archives.filter(function (archive) {
                // 暫定的に CentOS系のみ
                return archive.tags.indexOf('distro-centos') > -1;

            }).map(function (archive) {
                return {
                    id  : archive.id,
                    name: archive.name
                };
            });
            
            resolve(archives);
        });
    });
};