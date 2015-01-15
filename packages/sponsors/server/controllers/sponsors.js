'use strict';

var Q = require('q');
var fs = require('fs');
var mongoose = require('mongoose');
var	Sponsor = mongoose.model('Sponsor');
var SponsorKey = mongoose.model('SponsorKey');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodemailer.createTransport(smtpTransport({
	host: 'mc.i.ware.fi',
	ignoreTLS: true,
	port: 25
}));

function sendEmailToNewUser(userName, emailAddress) {
	var htmlMailPart1 = '';
	var htmlMailPart2 = '';
	fs.readFile(__dirname +'/mailtemplatePart1.txt', function(err, data) {
	 	if(err) {
			throw err;
		}
		htmlMailPart1 = data.toString();
		fs.readFile(__dirname +'/mailtemplatePart2.txt', function(err, data) {
		if(err) {
			throw err;
		}
		htmlMailPart2 = data.toString();
		var messageToUser = {
			from: 'SoS-verkosto <sos@sos.ware.fi>',
			to:  emailAddress,
			subject: 'Tervetuloa SOS-verkostoon!',
			text: 'Tervetuloa SoS-verkoston jäseneksi. Oma linkkisi: http://www.sos.ware.fi/#!/sponsors/' + userName,
			html: htmlMailPart1 + userName + htmlMailPart2
		};

		transporter.sendMail(messageToUser, function(error, info) {
			if(error) {
				console.log('Error while sending mail.');
				console.log(error.message);
			}else {
				console.log('Viesti lähti: ' + info.response);
			}
		});
	});
	});
}

function buildArrows(network, founder, build)
{
	for( var child in network )
	{
		var current = {};
		current.visible = true;
		current.idKey = child;
		current.path = [];
		current.stroke = {
			color: '#ee7203',
			opacity: 1,
			weight: 3
		};

		current.path.push(network[child].coords);
		current.path.push(founder.coords);
		build.push(current);

	}
	return build;
}

function buildAncestorArrows(ancestors, founder, build)
{
	var previous = {};
	for( var aIndex in ancestors )
	{
		var current = {};
		current.visible = true;
		current.idKey = aIndex;
		current.path = [];
		current.stroke = {
			color: '#B0B0B0',
			opacity: 0.7,
			weight: 3
		};
	
		if(previous.name !== undefined) {
			current.path.push(ancestors[aIndex].coords);
			current.path.push(previous.coords);
		}
		if(Number(aIndex) + 1 === ancestors.length ) {
			current.path.push(ancestors[aIndex].coords);
			current.path.push(founder.coords);
		}

		build.push(current);
		
		previous = ancestors[aIndex];
	}
	return build;
}

exports.byName = function(req,res, next,sponsorname)
{
	var fetch = Q.when(Sponsor.findOne({name: sponsorname}).exec());

	fetch.then( function(founder)
	{
		req.sponsor = founder;
		next();
	})
	.fail( function(error)
	{
		res.send(error);
	})
	.done();
};

exports.byId = function(req,res, next, sponsorid)
{
	var fetch = Q.when(Sponsor.findOne({_id: sponsorid}).exec());

	fetch.then( function(founder)
	{
		req.sponsor = founder;
		next();
	})
	.fail( function(error)
	{
		res.send(error);
	})
	.done();
};

exports.byEmail = function(req, res, next, email)
{
	var shasum = crypto.createHash('sha256');
	shasum.update(email);
	var hashedEmail = shasum.digest('hex');

	var fetch = Q.when(Sponsor.findOne({hashedEmail: hashedEmail}).exec());

	fetch.then( function(founder)
	{
		req.sponsor = founder;
		next();
	})
	.fail( function(error)
	{
		res.send(error);
	})
	.done();
};
exports.mailExists = function(req, res) 
{
	var mailFound = false;
	if(req.sponsor !== null) {
		mailFound = true;
		res.jsonp({mailFound: mailFound, sponsorName: req.sponsor.name});
	}
	else {
		res.jsonp({mailFound: mailFound});
	}
};

exports.saveFormData = function(req, res) 
{
	var sponsorName = req.body.data.oldNickname;
	var email = req.body.data.email;
	var isOldUser = req.body.data.isOldUser;

	if(isOldUser && sponsorName !== undefined && sponsorName !== '' && 
		email !== undefined && email !== '') {
		var fetch = Q.when(Sponsor.findOne({name: sponsorName}).exec());
		fetch.then( function(sponsor)
		{
			sponsor.upgrade(function (err, uppedSponsor) {
				if (err) {
					res.send(err);
				}
				else {
					res.send(202);
				}
			});
		})
		.fail( function(error)
		{
			res.send(error);
		})
		.done();
	}
	else {
		req.session.sponsorFormSubmitted = true;
		res.send(201);
	}
};

exports.create = function(req, res)
{	//need some check for empty posts-requests

	if(req.body.length === 0)
	{
		console.log('empty sponsor');
		res.send(400);
		return;
	}
	console.log(req.body);
	var name = req.body.name;
	var coords = req.body.coords;
	var code = req.body.code;
	var parentId = req.body.parentId;
	var imgUrl = req.body.imgUrl;
	var email = req.body.hashedEmail;

	if(name === undefined || coords === undefined || email === undefined || isNaN(coords.latitude) || isNaN(coords.longitude)) {
		res.send(400);
		return;
	}
	var emailShasum = crypto.createHash('sha256');
	emailShasum.update(email);
	var hashedEmail = emailShasum.digest('hex');

	if (code !== undefined && code !== '') {
		// validate key
		var shasum = crypto.createHash('sha256');
		shasum.update(code);
		var hashedCode = shasum.digest('hex');
		var keyIsValid = false;
		var foundKey;

		var findKey = Q.when( SponsorKey.find().where('hash').equals(hashedCode).exec() );
		findKey.then( function(keys)
		{
			if(keys.length === 1) {
				foundKey = keys[0];
				if(!foundKey.used) {
					keyIsValid = true;
				}
				else {
					res.send({error: 'code-used'});	
				}
			}
			else{
				res.send({error: 'code-invalid'});
			}
		})
		.then( function() {
			if(keyIsValid) {
				var sponsor = new Sponsor({
					name: name,
					hashedEmail: hashedEmail,
					coords: coords,
					parentId: parentId,
					messenger: false
				});
				if(imgUrl !== undefined && imgUrl !== '') {
					sponsor.imgUrl = imgUrl;
				}
				var save = Q.when( sponsor.save() );

				save.then(function()
				{
					foundKey.used = true;
					foundKey.save();
					sendEmailToNewUser(sponsor.name, email);
					res.jsonp(sponsor);
				})
				.fail(function(err)
				{
					res.send(err);
					console.log(err);
				})
				.done();
			}
		})
		.fail( function(err)
		{
			res.send(err);
		})
		.done();
	}
	else {
		var sponsor = new Sponsor({
			name: name,
			hashedEmail: hashedEmail,
			coords: coords,
			parentId: parentId
		});

		if(req.session.sponsorFormSubmitted) {
			sponsor.messenger = false;
		}
		if(imgUrl !== undefined && imgUrl !== '') {
			sponsor.imgUrl = imgUrl;
		}

		var save = Q.when( sponsor.save() );

		save.then(function()
		{
			req.session.sponsorFormSubmitted = false;
			res.jsonp(sponsor);
			sendEmailToNewUser(sponsor.name, email);
		})
		.fail(function(err)
		{
			res.send(err);
			console.log(err);
		})
		.done();
	}
};

exports.upgrade = function(req, res)
{
	var sponsor = req.sponsor;

	if(req.session.sponsorFormSubmitted) {
		sponsor.upgrade(function (err, uppedSponsor) {
			if (err) {
				res.send(err);
			}
			else {
				req.session.destroy();
				res.send(202);
			}
		});
	}
	else {
		res.send(400);
	}
};

exports.createKeys = function(req, res)
{
	console.log('creating keys');
	res.send(202);
};

exports.show = function(req, res) 
{
	res.jsonp(req.sponsor);
};

exports.all = function(req, res)
{
	var getAllSponsors = Q.when( Sponsor.find().exec() );

	getAllSponsors.then( function(allSponsors)
	{
		res.jsonp(allSponsors);
	})
	.fail( function(err)
	{
		res.send(err);
	})
	.done();
};

exports.findNetwork = function(req, res)
{

	var build = {};
	build.arrows = [];
	build.ancestors = [];

	var afounder = Q.when( Sponsor.findById( req.sponsor._id).exec() );
	afounder.then( function (founder)
	{ 
		var promise = Q.when( founder.children() );
		promise.then( function(children)
		{
			build.children = children;
			children.arrows = buildArrows(children, founder, build.arrows);
		})
		.then(function()
		{
			return founder.myAncestors();
		})
		.then(function(ancestors)
		{
			var navDepth = req.query.navDepth;

			if(navDepth > 0 && ancestors.length >= navDepth) 
			{
				build.ancestors = ancestors.slice(-navDepth);

				build.arrows = buildAncestorArrows(build.ancestors, founder, build.arrows); 
			}
			else 
			{
				build.ancestors = [];	
			}
		})
		.then(function()
		{
			res.jsonp(build);
		})
		.fail(function(err)
		{
			console.log(err);
			res.send(err);
		})
		.done();

		return promise;		
	})
	.fail(function(err)
	{
		console.log(err);
		res.send(err);
	})
	.done();
};


exports.topTen = function(req, res)
{
	var promise = Q.when(
		Sponsor.find()
		.where('parentId').exists(false)
		.where('nSize').gt(0)
		.sort('-nSize')
		.limit(10)
		.exec()
		);
		
	promise.then(function (topTen)
	{
		res.send(topTen);
	})
	.fail(function(err)
	{
		res.send(err);
	});
		
};