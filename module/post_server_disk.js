var sakura_client = require('./sakura_client.js');

var client;
var initClient = function (zone) {
    client = sakura_client({
        zone: zone
    });
}

var createServer = function (param) {
    return new Promise(function (resolve, reject) {
        
        client.createRequest({
            method: 'post',
            path  : 'server',
            body  : {
                Server: param
            }

        }).send(function (err, res) {
            if (err) return reject(err);
            
            var serverId = res.response.server.id;
            var message = '`サーバ(' + serverId + ')` できたよ';
            eventEmitter.emit('post_server:progress', message);
            resolve(serverId);
        });
    });
};

var createDisk = function (param) {
    return new Promise(function (resolve, reject) {
        client.createRequest({
            method: 'post',
            path  : 'disk',
            body  : {
                Disk: param
            }

        }).send(function (err, res) {
            if (err) return reject(err);
            
            var diskId = res.response.disk.id;
            var message = '`ディスク(' + diskId + ')` できたよ';
            eventEmitter.emit('post_server:progress', message);
            resolve(diskId);
        });
    });
}; 

var checkDisk = function (param) {
    return new Promise(function (resolve, reject) {
        var checkParam = {
            Include: [
                'Availability',
                'SizeMB',
                'MigratedMB'
            ]
        };
        
        var checker = function () {
            client.createRequest({
                method: 'get',
                path  : 'disk/' + param.result.diskId,
                body  : checkParam

            }).send(function (err, res) {
                if (err) return reject(err);
                
                var disk = res.response.disk;
                
                if (disk.availability === 'available') {
                    eventEmitter.emit('post_server:progress', 'コピー完了！');
                    resolve();
                }
                else if (disk.availability === 'failed') {
                    eventEmitter.emit('post_server:failure');
                    throw new Error(err);
                }
                else {
                    var message = [
                        'ディスクコピー中です！( `',
                        disk.migratedMB,
                        '/',
                        disk.sizeMB,
                        '` )'
                    ].join(' ');
                    eventEmitter.emit('post_server:progress', message);
                    setTimeout(function () {
                        checker();
                    }, 7000);
                }
            });
        };
        
        checker();
    });
};

var modifyDisk = function (param) {
    return new Promise(function (resolve, reject) {
        param.diskConfig = {
            Password: '',
            Count   : 0
        };
        
       client.createRequest({
            method: 'put',
            path  : 'disk/' + param.result.diskId + '/config',
            body  : param

        }).send(function (err, res) {
            if (err) return reject(err);
            
            var message = 'サーバのディスクを修正したよ'; 
            eventEmitter.emit('post_server:progress', message);

            resolve();
        });
    });
};

var bootServer = function (param) {
    return new Promise(function (resolve, reject) {
        client.createRequest({
            method: 'put',
            path  : 'server/' + param.result.serverId + '/power'

        }).send(function (err, res) {
            if (err) return reject(err);
            
            var message = 'サーバ起動したよ';
            eventEmitter.emit('post_server:progress', message);
            
            resolve();
        });
    });
};

module.exports.start = function (param) {
    // clientの初期化
    initClient(param.zone);
    param.result = {};

    Promise.resolve()
        // サーバ作成(post /server)
        .then(function () {
            return createServer(param.server);
        })

        // ディスク作成(post /disk)
        .then(function (serverId) {
            param.disk.Server     = { ID: serverId };
            param.result.serverId = serverId;

            return createDisk(param.disk);
        })

        // コピー確認(get /disk/:diskid)
        .then(function (diskId) {
            param.result.diskId = diskId;
            return checkDisk(param);
        })

        // ディスク修正(put /disk/:diskid/config)
        .then(function () {
            return modifyDisk(param);
        })

        // サーバ起動(put /server/:serverid/power)
        .then(function () {
            return bootServer(param);
        })

        .then(function () {
            eventEmitter.emit('post_server:success');
        })

        .catch(function (err) {
            console.log(err);
            eventEmitter.emit('post_server:failure');
        });
};