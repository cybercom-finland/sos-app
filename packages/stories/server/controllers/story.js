'use strict';

var mongoose = require('mongoose');
var	Story = mongoose.model('Story');
var Q = require('q');

exports.byName = function(req, res, next, id)
{
	var fetch = Q.when(Story.findById(id).exec());

	fetch.then( function(story)
	{
		req.story = story;
		next();
	})
	.fail( function(error)
	{
		res.send(error);
	})
	.done();
};

exports.create = function(req, res)
{
	var story = new Story(req.body);

	var save = Q.when( story.save() );
	save.then(function(story)
	{
		res.jsonp(story);
	})
	.fail(function(err)
	{
		res.send(err);
	})
	.done();
};

exports.show = function(req, res) {
    res.jsonp(req.story);
};

exports.all = function(req, res)
{
	var getAllStorys = Q.when( Story.find().exec() );

	getAllStorys.then( function(allStorys)
	{
		res.jsonp(allStorys);
	})
	.fail( function(err)
	{
		res.send(err);
	})
	.done();
};

exports.image = function(req, res) {
	var imageData = req.story.image.toJSON();

    res.contentType(req.story.imageType);
    res.end(imageData.buffer, 'binary');
};

