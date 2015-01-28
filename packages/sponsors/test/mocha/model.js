'use strict';
// disable unused expressions warnings
/*jshint -W030 */

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose');

// for some reason the mongoose model is not found withour requiring it
require('../../server/models/sponsor.js');
var Sponsor = mongoose.model('Sponsor');

//Globals
var sponsor1, sponsor2, sponsorId;

describe('<Unit Test:>', function() {
    describe('Model Sponsor:', function() {

        before(function(done) {
            sponsor1 = new Sponsor({
                name: 'TestSponsor1',
                hashedEmail: 'emaili',
                coords: {
                  longitude: 1,
                  latitude: 2,
                },
            });

            sponsor2 = new Sponsor({
                name: 'TestSponsor2',
                hashedEmail: 'emaili2',
                coords: {
                  longitude: 11,
                  latitude: 22,
                },
            });

            done();
        });

        describe('Method Save', function() {
            it('should be able to save without problems', function(done) {
                sponsor1.save(done);
            });

            it('should find test sponsor', function(done) {
                Sponsor.findOne({ name: 'TestSponsor1' }, function(err, testSponsor) {
                    testSponsor.should.not.be.empty;
                    sponsorId = testSponsor._id;
                    done();
                });
            });

            it('should show an error when trying to save with the same name', function(done) {
                sponsor2.name = sponsor1.name;
                return sponsor2.save(function(err) {
                    should.exist(err);
                    done();
                });
            });

            it('should be able to save with parentId', function(done) {
                sponsor2.name = 'TestSponsor2';
                sponsor2.parentId = sponsorId;
                sponsor2.save(done);
            });

            it('a child should have a parent', function(done) {
                Sponsor.findOne({ name: 'TestSponsor2' }, function(err, testSponsor) {
                  testSponsor.parent(function(err, parent) {
                    parent.should.not.be.empty;
                    done();
                  });
                });
            });
        });

        after(function(done) {
            sponsor1.remove();
            sponsor2.remove();
            done();
        });
    });
});
