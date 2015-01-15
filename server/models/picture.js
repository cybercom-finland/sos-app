
'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

	var PictureSchema = new Schema(
	{
		name: { type: String, required: true },
		imageType: { type: String, required: true },
		data: { mime: String, bin: Buffer }
	});

mongoose.model('Picture', PictureSchema);
