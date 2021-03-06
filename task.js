#!/usr/bin/env node
console.log("Starting app");
var dotenv  = require('dotenv');
var parse = require("github-calendar-parser");
var request   = require('request');
var sendgrid  = require('sendgrid')(SENDGRID_USERNAME, SENDGRID_PASSWORD);

dotenv.load();

var GITHUB_USERNAME   = process.env.GITHUB_USERNAME;
var SENDGRID_USERNAME = process.env.SENDGRID_USERNAME;
var SENDGRID_PASSWORD = process.env.SENDGRID_PASSWORD;
var TO                = process.env.TO;
var FROM              = process.env.FROM || TO;
console.log(SENDGRID_USERNAME, SENDGRID_PASSWORD);
var request_options = {
  url: 'https://github.com/users/' + GITHUB_USERNAME + '/contributions',
  headers: {
    'User-Agent': 'request'
  }
};

function warnOfImpendingStreakDoom(m) {
  console.log("Attempting to send email...");
  sendgrid.send({
    to:       TO,
    from:     FROM,
    subject:  "[github-streaker] Don't break the streak.",
    text:     `${m}\nYour GitHub streak is about to break. Go and make a commit quick!`
  }, function(err, json) {
    if (err) { return console.error(err); }
  });
}

request(request_options, function (error, response, body) {
  console.log(`Options: ${request_options.url} Status: ${response.statusCode}`);
  if (!error && response.statusCode == 200) {
    var contributions = parse(body);
    var today = new Date().toISOString().split('T')[0];
    var today_obj = contributions.days.find(o => o.date.toISOString().split('T')[0] === today) || 0;
    console.log(today_obj.count);
    var message = `Your current streak is ${contributions.current_streak} days. Your longest streak is ${contributions.longest_streak} days.`;
    
    if (today_obj.count <= 0) {
      warnOfImpendingStreakDoom(message);
    }
  } else {
    console.log("Status from url " + url + " is: " + response.statusCode + ". Body: " + body);
  }
});