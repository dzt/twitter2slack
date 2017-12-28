require('console-stamp')(console, {
    colors: {
        stamp: 'yellow',
        label: 'cyan',
        metadata: 'green',
    },
});

var Bot, slackBot;
Bot = require('slackbots');
slackBot = new Bot({
    name: require('./config.json').botName,
    token: require('./config.json').slackToken
});

console.log('Stream Started');


var Stream = require('user-stream');
var stream = new Stream({
    consumer_key: require('./config.json').twitter_consumer_key,
    consumer_secret: require('./config.json').twitter_consumer_secret,
    access_token_key: require('./config.json').twitter_access_token_key,
    access_token_secret: require('./config.json').twitter_access_token_secret
});

// stream.stream({
//     with: 'user'
// });
stream.stream();
stream.on('data', function(data) {
    if (!data.event) {

      for (var i=0; i < require('./config.json').twitters_to_track.length; i++) {
        if (data.user.screen_name == require('./config.json').twitters_to_track[i]) {
            if (data.extended_entities) {
                console.log(`Tweet with image recieved (${data.id})`);
                if (data.extended_entities.media) {
                    slackMsg(data.text, data.extended_entities.media[0].media_url_https, data.user.screen_name);
                }
            } else {
                if (!data.friends) {
                    console.log(`Tweet without image recieved (${data.id})`);
                    slackMsg(data.text, null, data.user.screen_name);
                }
            }
        }
      }

    }
});


function slackMsg(text, img, usr) {

    var params = {
        username: require('./config.json').botName,
        icon_url: require('./config.json').icon,
        attachments: [{
            "image_url": img,
            "fallback": `New Update from @${usr}`,
            "title": `New Update from @${usr}`,
            "color": require('./config.json').color,
            "fields": [{
                "value": text,
                "short": "false"
            }],
            "ts": Math.floor(Date.now() / 1000),
            "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png"
        }]
    }

    if (require('./config.json').sendToChannel) {
      slackBot.postMessage(require('./config.json').slackChannel, null, params);
    }

    if (require('./config.json').direct_messages_slack.active) {
      for (var i=0; i < require('./config.json').direct_messages_slack.users.length; i++) {

        var username = require('./config.json').direct_messages_slack.users[i];
        slackBot.postMessageToUser(username, null, params);

      }
    }

};