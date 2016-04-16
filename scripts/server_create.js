var events        = require('events'),
    zone          = require('../module/zones.js'),
    productServer = require('../module/product_server.js'),
    productDisk   = require('../module/product_disk.js'),
    archives      = require('../module/archives.js'),
    createServer  = require('../module/post_server_disk.js');

// とりあえずglobal
eventEmitter = new events.EventEmitter();

var data = {};
    data.zones       = [];
    data.serverPlans = [];
    data.diskPlans   = [];
    data.archives    = [];
    data.confirm     = {};

var param = {};
    param.zone       = {};
    param.server     = {};
    param.disk       = {};
    param.diskConfig = {};

// デフォルト設定
param.server = {
    ConnectedSwitches: [
        {
            Scope        : "shared",
            BandWidthMbps: 100
        }
    ],
    Tags: [
        '@virtio-net-pci'
    ],
    WaitDiskMigration: true
};
param.disk = {
    Connection: 'virtio'
};

// responseに1secかかるとbotkitが会話を終了してしまうため最初に取得
var load = function (callback) {
    Promise.all([
        zone.getList()

    ]).then(function (results) {
        data.zones = results[0];
        
        callback();
    });
};

var loadResoueces = function (zone) {
    Promise.all([        
        productServer.getList(zone),
        productDisk.getList(zone),
        archives.getList(zone)

    ]).then(function (results) {
        data.serverPlans = results[0];
        data.diskPlans = results[1];
        data.archives = results[2];
    });
};

var selectZone = function (res, conv) {
    var list = data.zones.map(function (z, i) {
        return [
            i + '. ',
            '`' + z.description + '`'
        ].join(' ');
    }).join('\r\n');
    
    conv.ask('どこのゾーンにする？\r\n' + list, function (res, conv) {
        if (!res.text || /\D/.test(res.text)) {
            conv.say('ちがうみたい :worried:')
            conv.repeat();
            conv.next();
        }
        else {
            var index = +res.text;
            var selected = data.zones[index];
            if (!selected) {
                conv.say('ないみたい :worried:');
                conv.repeat();
                conv.next();
            }
            else {
                conv.say('`' + selected.description + '`だね！');
                
                data.confirm.Zone = selected.description;
                param.zone = selected.name;
                
                loadResoueces(selected.name);
                
                // レスポンスに1秒以上かかると会話が終了してしまうのでギリギリまで遅延させる
                setTimeout(function () {
                    selectServerPlan(res, conv);
                    conv.next();
                }, 800);
            }
        }
    });
};

var selectServerPlan = function (res, conv) {
    conv.say('どのサーバプランにする？');
    conv.next();

    setTimeout(function () {
        var list = data.serverPlans.map(function (plan, i) {
            return [
                i + ': ',
                '`' + plan.name + '`'
            ].join(' ');
        }).join('\r\n');

        conv.ask(list, function (res, conv) {
            if (!res.text || /\D/.test(res.text)) {
                conv.say('ちがうみたい :worried:')
                conv.repeat();
            }
            else {
                var index = +res.text;
                var selected = data.serverPlans[index];
                
                if (!selected) {
                    conv.say('ないみたい :worried:');
                    conv.repeat();
                }
                else {
                    conv.say('`' + selected.name + '`だね！');
                    
                    data.confirm.Spec = selected.name;
                    
                    param.server.ServerPlan = {};
                    param.server.ServerPlan.ID = selected.id;
                    
                    selectDiskPlan(res, conv);
                }
            }
            
            conv.next();
        });
    }, 800);
};

var selectDiskPlan = function (res, conv) {
    var list = data.diskPlans.map(function (plan, i) {
        return [
            i + ': ',
            '`' + plan.name + '`'
        ].join(' ');
    }).join('\r\n');

    conv.say('どのディスクプランにする？');
    conv.ask(list, function (res, conv) {
        if (!res.text || /\D/.test(res.text)) {
            conv.say('ちがうみたい :worried:')
            conv.repeat();
        }
        else {
            var index = +res.text;
            var selected = data.diskPlans[index];
            
            if (!selected) {
                conv.say('ないみたい :worried:');
                conv.repeat();
            }
            else {
                conv.say('`' + selected.name + '`だね！');
                
                data.confirm.Disk = selected.name;
                
                param.disk.Plan = {};
                param.disk.Plan.ID = selected.id;
                param.disk.SizeMB = selected.sizeMB;
                
                selectOS(res, conv);
            }
        }
        
        conv.next();
    });
};

var selectOS = function (res, conv) {
    var list = data.archives.map(function (archive, i) {
        return [
            i + ': ',
            '`' + archive.name + '`'
        ].join(' ');
    }).join('\r\n');
    
    conv.say('どのOSをインストールする？');
    conv.ask(list, function (res, conv) {
        if (!res.text || /\D/.test(res.text)) {
            conv.say('ちがうみたい :worried:')
            conv.repeat();
        }
        else {
            var index = +res.text;
            var selected = data.archives[index];
            
            if (!selected) {
                conv.say('ないみたい :worried:');
                conv.repeat();
            }
            else {
                conv.say('`' + selected.name + '`だね！');
                
                if (list.length === index) {
                    // 空ディスク
                    data.confirm.OS = '空';
                }
                else {
                    data.confirm.OS = selected.name;
                    
                    param.disk.SourceArchive = {};
                    param.disk.SourceArchive.ID = selected.id;
                }
                
                setName(res, conv);
            }
        }
        
        conv.next();
    });
};

var setName = function (res, conv) {
    conv.ask('サーバの名前はなんにする？', function (res, conv) {
        if (!res.text) {
            conv.say('もういっかい聞くね？');
            conv.repeat();
        }
        else {
            var name = param.server.Name = param.disk.Name = res.text;
             conv.say('`' + name + '`だね！');
             
             data.confirm.ServerName = name;
             data.confirm.DiskName   = name;
             
             setHostname(res, conv);
        }
        
        conv.next();
    });
};

var setHostname = function (res, conv) {
    conv.ask('ホスト名どうする？', function (res, conv) {
        if (!res.text || /[a-z0-9]+/i.test(res.text) === false) {
            conv.say('ダメみたい :worried:');
            conv.repeat();
        }
        else {
            var hostname = param.diskConfig.HostName = res.text;
            conv.say('`' + hostname + '`だね！');
            
            data.confirm.HostName = hostname;
            
            confirm(res, conv);
        }
        
        conv.next();
    });
};

var confirm = function (res, conv) {
    var config = [
        '```',
        JSON.stringify(data.confirm, null , '  '),
        '```'
    ].join('\r\n');
    
    conv.ask('この構成で大丈夫？( `Yes` or `No` )\r\n' + config, [
        {
            pattern : /^(yes|y)/i,
            callback: function (res, conv) {
                conv.say('つくるからちょっと待ってね :hourglass_flowing_sand:');
                conv.next();
                createServer.start(param);
            }
        },
        {
            patterm : /^(no|n)i/,
            callback: function (res, conv) {
                conv.say('そっか... :cry:');
                conv.next();
            }
        },
        {
            default : true,
            callback: function (res, conv) {
                conv.say('もういっかい聞くけど...');
                conv.repeat();
                conv.next();
            } 
        }
    ]);
};

controller.hears('サーバ.*作成', ['direct_message', 'direct_mention', 'mention'], function(bot, msg) {
    eventEmitter.on('post_server:progress', function (message) {        
        bot.reply(msg, message);
    });
    
    eventEmitter.once('post_server:success', function () {
        var message = [
            '`' + data.confirm.ServerName + '`の作成が完了したよ :tada:',
            'いっぱい使ってね！'
        ].join('\r\n');

        bot.reply(msg, message);
    });

    eventEmitter.once('post_server:failure', function () {
        bot.reply(msg, '失敗しちゃった...:cry:');
    });

    bot.reply(msg, 'つくりましょー :laughing:');

    load(function () {
        bot.startConversation(msg, selectZone);
    });

    // 会話がとまるので再スタート
    // bot.startConversation(msg, selectServerPlan);
});