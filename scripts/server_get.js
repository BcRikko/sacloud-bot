var client  = require('../module/sakura_client.js'),
    zones   = require('../module/zones.js'),
    servers = require('../module/servers.js');

var load = function (callback) {
    Promise.resolve().then(function () {
        return zones.getList()
    })
    .then(function (zones) {
        return servers.getList(zones);
    })
    .then(function (servers) {
        callback(servers);
    });
};

var getServerList = function (bot, msg) {
    
};

controller.hears('サーバ一覧', ['direct_message', 'direct_mention', 'mention'], function(bot, msg) {
    bot.reply(msg, 'サーバ一覧を取得します :clipboard:');

    load(function (servers) {
        var message = servers.map(function (server) {
            return [
                ':desktop_computer:',
                '`' + server.id + ':' + server.name + '`',
                '[' + server.plan + ']',
                'in',
                server.zone
            ].join('  ')
        }).join('\r\n');
        
        bot.reply(msg, message);
    });
});