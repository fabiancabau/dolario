
// Load required packages
var Xray = require('x-ray');
var redis = require("redis");
var x = Xray();
var client = redis.createClient({detect_buffers: true});
var mongoose = require('mongoose');

var bluebird = require("bluebird");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var urls = {
	DOLAR: 'http://dolarhoje.com',
	LIBRA: 'http://dolarhoje.com/libra/',
	EURO: 'http://dolarhoje.com/euro/'
}

var targetId = '#nacional@value';


var Mining = function () {};


//On demand currencies ==========================
Mining.prototype.getDolar = function () {
 	return x(urls.DOLAR, targetId);
};

Mining.prototype.getLibra = function () {
 	return x(urls.LIBRA, targetId);
};

Mining.prototype.getEuro = function () {
 	return x(urls.EURO, targetId);
};

// ============================================


//Cached currencies ========================================
Mining.prototype.getCachedDolar = function() {
	return client.getAsync("currency_dolar");
}

Mining.prototype.getCachedLibra = function() {
	return client.getAsync("currency_libra")
}

Mining.prototype.getCachedEuro = function() {
	return client.getAsync("currency_euro")
}

// ================================================================



Mining.prototype.cacheCurrencies = function() {

	Mining.prototype.getDolar()(function(err, val) {

		var dolar = {
			value: val,
			lastUpdated: new Date().toString()
		};

		client.set('currency_dolar', JSON.stringify(dolar));

		console.log('Dolar value set: ' + val);
	});

	Mining.prototype.getLibra()(function(err, val) {

		var libra = {
			value: val,
			lastUpdated: new Date().toString()
		};

		client.set('currency_libra', JSON.stringify(libra));

		console.log('Libra value set: ' + val);
	});

	Mining.prototype.getEuro()(function(err, val) {

		var euro = {
			value: val,
			lastUpdated: new Date().toString()
		};

		client.set('currency_euro', JSON.stringify(euro));

		console.log('Euro value set: ' + val);
	});
	
}

module.exports = new Mining();
 