var client  = require('../module/sakura_client.js'),
    zones   = require('../module/zones.js'),
    servers = require('../module/servers.js'),
    power   = require('../module/power.js');

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

controller.hears('([0-9]+)を起動', ['direct_message', 'direct_mention', 'mention'], function(bot, msg) {
    load(function (servers) {
        var server = servers.filter(function (server) {
            return server.id === msg.match[1];
        });
        
        if (server.length === 1) {
            Promise.resolve().then(function () {
                return power.up(server[0]);

            }).then(function (success) {
                if (success) {
                    bot.reply(msg, 'サーバを起動しました :tada:');
                }
                else {
                    bot.reply(msg, 'サーバの起動に失敗しました :cry:');
                }
            });
        }
        else {
            bot.reply(msg, '対象のサーバがみつかりませんでした :mag:');
        }
    });
});

controller.hears('([0-9]+)を(停止|シャットダウン)', ['direct_message', 'direct_mention', 'mention'], function(bot, msg) {
    load(function (servers) {
        var server = servers.filter(function (server) {
            return server.id === msg.match[1];
        });
        
        if (server.length === 1) {
            Promise.resolve().then(function () {
                return power.down(server[0]);

            }).then(function (success) {
                if (success) {
                    bot.reply(msg, 'サーバをシャットダウンしました :zzz:');
                }
                else {
                    bot.reply(msg, 'サーバのシャットダウンに失敗しました :cry:');
                }
            });
        }
        else {
            bot.reply(msg, '対象のサーバがみつかりませんでした :mag:');
        }
    });
});