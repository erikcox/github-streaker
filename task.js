#!/usr/bin/env node

var dotenv  = require('dotenv');
dotenv.load();

var GITHUB_USERNAME   = process.env.GITHUB_USERNAME;
var SENDGRID_USERNAME = process.env.SENDGRID_USERNAME;
var SENDGRID_PASSWORD = process.env.SENDGRID_PASSWORD;
var TO                = process.env.TO;
var FROM              = process.env.FROM || TO;

var request   = require('request');
var sendgrid  = require('sendgrid')(SENDGRID_USERNAME, SENDGRID_PASSWORD);

var url = `https://api.github.com/users/${GITHUB_USERNAME}/events/public`;

function warnOfImpendingStreakDoom() {
  sendgrid.send({
    to:       TO,
    from:     FROM,
    subject:  "[github-streaker] Don't break the streak.",
    text:     'Your GitHub streak is about to break. Go and make a commit quick!'
  }, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
  });
}

request(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var json = JSON.parse(body);
    var today = new Date().getUTCDate();
    var count = 0;

    for (key in json) {
        if (json.hasOwnProperty(key)) {
          if (json[key].type === "PushEvent") {
            var date = new Date(json[key].created_at).getUTCDate();
            if (date === today) {
              count++;
            }
          }
        }
    }

    if (count <= 0) {
      warnOfImpendingStreakDoom();
    } else {
      console.log(count + " commit(s) today");
    } 
  }
});

