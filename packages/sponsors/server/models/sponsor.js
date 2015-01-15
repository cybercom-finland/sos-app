'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

	var SponsorSchema = new Schema(
		{
			name: { type: String, required: true, unique: true, match: /^[a-zA-Z0-9_-]{1,30}$/ },
			hashedEmail: { type: String, required: true, unique: true},
			coords: {
				longitude: { type: Number, required: true },
				latitude: { type: Number, required: true },
			},
			imgUrl: { type: String, default: 'public/system/assets/img/default-user-image-whitebackground.png' },
			show: { type: Boolean, default: true },
			messenger: {  type: Boolean, default: true },
			nSize: { type: Number, default: 0 },
			messengers: { type: Number, default: 0 },
			sponsors: { type: Number, default: 0 }, 
			parentId: { type: Schema.ObjectId },
			ancestors: [{ type: Schema.ObjectId }]
		});

SponsorSchema.path('name').validate(function(name) {
    return name.length;
}, 'Name cannot be blank');

SponsorSchema.pre('save', function(next) {
	var self = this;
	if (self.parentId) {
		self.parent(function(err, parent) {
			if(err) {
				throw err;
			}
			self.ancestors = parent.ancestors;
			self.ancestors.push(self.parentId);

			self.constructor.find({_id: { $in: self.ancestors }}, function(err, ancestors) {
				for(var ancestor in ancestors) {
					var current = ancestors[ancestor];

					current.update( { $inc: { nSize: 1 } } ).exec();
					if(self.messenger) {
						current.update( { $inc: { messengers: 1 } } ).exec();
					}
					else {
						current.update( { $inc: { sponsors: 1 } } ).exec();	
					}
				}
			});

			next();
		});
	}
	else {
		next();
	}
});

SponsorSchema.method('upgrade', function(next) {
	var self = this;
	if( self.messenger ) {
		self.constructor.update({_id: self._id}, {messenger: false}, {}, function(err, affected) {
			if(err) {
				throw err;
			}
			self.constructor.find({_id: { $in: self.ancestors }}, function(err, ancestors) {
				if(err) {
					throw err;
				}
				for(var ancestor in ancestors) {
					var current = ancestors[ancestor];

					current.update( { $inc: { sponsors: 1 } } ).exec();
					current.update( { $inc: { messengers: -1 } } ).exec();
				}
				next();
			});	
		});	
	}
	
});

// returns the parent node
SponsorSchema.method('parent', function(callback) 
{
	var self = this;
	return self.constructor.findOne({_id: self.parentId}, callback).exec();
});

// Returns the list of children
SponsorSchema.method('children', function(callback) 
{
	var self = this;
	return self.constructor.find({parentId: self._id}, callback).exec();
});


SponsorSchema.method('myAncestors', function(callback)
{
	var self = this;
	return self.constructor.find( {_id: { $in: self.ancestors } }).exec();
});

mongoose.model('Sponsor', SponsorSchema);

