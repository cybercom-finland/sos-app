'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

	var SponsorKeySchema = new Schema(
	{
		hash: { type: String, required: true, unique: true },
		used: { type: Boolean, default: false }
	});

mongoose.model('SponsorKey', SponsorKeySchema);
