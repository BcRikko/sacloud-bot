sacloud-bot
====

slack上から[さくらのクラウド](http://cloud.sakura.ad.jp/)のサーバなどを操作するbotです。

<iframe style="width:100%;height:155px;max-width:100%;margin:0 0 1.7rem;display:block;"title="Slack上からさくらのクラウドを操作できるbotをつくった | Black Everyday Company"src="http://hatenablog.com/embed?url=http://kuroeveryday.blogspot.jp/2016/04/slack-sacloud-bot.html"width="300"height="150"frameborder="0"scrolling="no"></iframe>


Installation
----

```bash
$ git clone git@github.com:BcRikko/sacloud-bot.git
$ npm install
```

`./env/settings_exampje.json` を `./env/settings.json` に変更し、APIのtokenを設定してください。


Usage
----

```
$ node bot.js
```

![create_server](https://cloud.githubusercontent.com/assets/5305599/14581038/7699fc7c-041c-11e6-90d6-51ba032d8577.gif)
![create_server2](https://cloud.githubusercontent.com/assets/5305599/14581064/fcea2356-041c-11e6-9a3e-7929660e1353.png)
![list_server](https://cloud.githubusercontent.com/assets/5305599/14581065/fced5e68-041c-11e6-91a8-4abfd771baea.png)
![power](https://cloud.githubusercontent.com/assets/5305599/14581066/fcf16ae4-041c-11e6-8fa2-2febfa198d69.png)



※ `Sandbox`以外でリソースを作成すると課金されますのでご注意ください。  
※ このbotを使って何らかのトラブルや損害などが発生しても責任を一切負いません