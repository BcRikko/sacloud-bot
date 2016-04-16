// sacloudのラッパー
var sacloud = require('sacloud'),
    settings = require('../env/settings');

var ROOT = 'https://secure.sakura.ad.jp/cloud/';

function SakuraClient (opts) {
    opts = opts || {};

    var zone = opts.zone || '';
    // var zone = opts.zone || 'is1a';

    if (opts.apiRoot) {
        sacloud.API_ROOT = ROOT + opts.apiRoot;
    }
    else {
        sacloud.API_ROOT = ROOT + 'zone/' + zone + '/api/cloud/1.1/';
    }

    return sacloud.createClient({
        accessToken      : settings.sacloud_access_token,
        accessTokenSecret: settings.sacloud_secret_token,
        debug            : false
    }); 
}


module.exports = SakuraClient;