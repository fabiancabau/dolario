var schedule = require('node-schedule');
var mining = require('./helpers/mining');
var pushNotifications = require('./helpers/pushnotifications');

console.log('Started CronJobs Script', new Date().toString());

var hourlyRule = new schedule.RecurrenceRule();
hourlyRule.dayOfWeek = [new schedule.Range(1, 5)];
hourlyRule.minute = 0;

var hourly = schedule.scheduleJob(hourlyRule, function(){
  console.log('Hourly cron function running', new Date().toString());
  pushNotifications.sendHourly();
});

var openingRule = new schedule.RecurrenceRule();
openingRule.dayOfWeek = [new schedule.Range(1, 5)];
openingRule.minute = 0;
openingRule.hour = 9;

var opening = schedule.scheduleJob(openingRule, function(){
  console.log('Opening cron function running', new Date().toString());
});

var closingRule = new schedule.RecurrenceRule();
closingRule.dayOfWeek = [new schedule.Range(1, 5)];
closingRule.minute = 0;
closingRule.hour = 17;

var closing = schedule.scheduleJob(closingRule, function(){
  console.log('Closing cron function running', new Date().toString());
});

var sanity = schedule.scheduleJob('*/1 * * * *', function(){
  console.log('Sanity cron function running', new Date().toString());
});

var cacheCurrency = schedule.scheduleJob('*/10 * * * *', function(){
  console.log('Cache cron function running', new Date().toString());
  mining.cacheCurrencies();
});

