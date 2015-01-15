// run with "node createUser.js"
var mongoose = require('mongoose');
require('../server/models/user.js');

var User = mongoose.model('User');

var db = mongoose.connect('mongodb://localhost/mean-dev');

user1 = new User({
	name: 'Full Name',
	email: 'a@a.a',
	username: 'user1',
	password: 'password'
});

user1.save(function (err) {
	if (err) throw err;

	console.log('User:');
	console.log(user1);
	console.log('Created successfully.');
});

