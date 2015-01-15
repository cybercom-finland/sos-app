'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StorySchema = new Schema(
{
	content: { type: String, required: true },
	header: { type: String, required: true },
	image: { mime: String, bin: Buffer },
	imageType: { type: String }
});

mongoose.model('Story', StorySchema);