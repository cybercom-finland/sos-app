// run with "node createKeys.js"
var fs = require('fs');
var mongoose = require('mongoose');
var Chance = require('chance');
var chance = new Chance();
var date = new Date();
var path = require('path');
var crypto = require('crypto');

require('../packages/sponsors/server/models/sponsorkey.js');
var SponsorKey = mongoose.model('SponsorKey');

var db = mongoose.connect('mongodb://localhost/mean-dev');

var keyAmount = process.argv[2];

function createKey() {
	var key = '';
	
	for(var i = 0; i < 4; ++i) {
		key += chance.string({length: 5, pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'}) + '-'; 
	}
	key = key.slice(0, -1);

	return key;
}

if(keyAmount !== undefined) {
	var keys = '';
	console.log(date.toUTCString());
	console.log('Creating ' + keyAmount + ' keys.');
	for(var i = 0; i < keyAmount; ++i) {
		var cleanKey = createKey();
		console.log(cleanKey);
		keys += cleanKey + '\n';
		var shasum = crypto.createHash('sha256');
		shasum.update(cleanKey);
		var hashedKey = shasum.digest('hex');

		var newKey = new SponsorKey({
			hash: hashedKey
		});
		newKey.save(function (err, savedKey) {
			if(err) {
				throw err;
			}
			else {
				console.log('saved key: ' + savedKey.hash);
			}
		})
	}

	var filepath = path.join(__dirname, '');
	fs.writeFile('keys/' + date.toUTCString(), keys, function (err) {
		if(err) {
			console.log(err);
		}
		else {
			console.log('keys written down');
		}
	})
}
else {
	console.log('Give amount of keys to create');
	process.exit(1);
}