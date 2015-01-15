'use strict';

var mongoose = require('mongoose');
var	Picture = mongoose.model('Picture');
var Q = require('q');

exports.byName = function(req, res, next, name)
{
	var fetch = Q.when(Picture.findOne({'name': name}).exec());

	fetch.then( function(picture)
	{
		req.picture = picture;
		next();
	})
	.fail( function(error)
	{
		res.send(error);
	})
	.done();
};

exports.image = function(req, res) {
	var imageData = req.picture.data.toJSON();

    res.contentType(req.picture.imageType);
    res.end(imageData.buffer, 'binary');
};