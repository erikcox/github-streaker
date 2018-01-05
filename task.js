#!/usr/bin/env node

console.log("Starting Github Streaker!");

var dotenv  = require('dotenv');
dotenv.load();

var GITHUB_USERNAME   = process.env.GITHUB_USERNAME;
var SENDGRID_USERNAME = process.env.SENDGRID_USERNAME;
var SENDGRID_PASSWORD = process.env.SENDGRID_PASSWORD;
var TO                = process.env.TO;
var FROM              = process.env.FROM || TO;

var request   = require('request');
var sendgrid  = require('sendgrid')(SENDGRID_USERNAME, SENDGRID_PASSWORD);

var request_options = {
  url: 'https://api.github.com/users/' + GITHUB_USERNAME + '/events/public',
  headers: {
    'User-Agent': 'request'
  }
};

function warnOfImpendingStreakDoom() {
  console.log("Attempting to send email...");
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

request(request_options, function (error, response, body) {
  console.log("Starting request with status: ", response.statusCode);
  if (!error && response.statusCode == 200) {
    console.log("Status 200");
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

    console.log("Count: ", count);
    if (count <= 0) {
      warnOfImpendingStreakDoom();
    } else {
      console.log(count + " commit(s) today");
    } 
  } else {
    console.log("Status isn't 200. ", body, url);
  }
});