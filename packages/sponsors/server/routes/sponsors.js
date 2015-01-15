'use strict';

var sponsors = require('../controllers/sponsors');

// The Package is past automatically as first parameter
module.exports = function(Sponsors, app, auth, database) {

    app.route('/sponsors')
        .get(sponsors.all)
        .post(sponsors.create);

    app.route('/keys')
        .post(auth.requiresLogin, sponsors.createKeys);

    app.route('/formdata')
        .post(sponsors.saveFormData);

    app.route('/sponsors/:sponsorName')
        .get(sponsors.show)
        .put(sponsors.upgrade);

    app.route('/sponsors/id/:sponsorId')
        .get(sponsors.show);
    
    app.route('/sponsors/email/:email')
        .get(sponsors.mailExists);
    
    app.route('/network/:networkFounder')
        .get(sponsors.findNetwork, function(req,res)
        {
        });
        
    app.route('/topten')
        .get(sponsors.topTen);

    app.param('email', sponsors.byEmail);
    app.param('sponsorName', sponsors.byName);
    app.param('sponsorId', sponsors.byId);
    app.param('networkFounder', sponsors.byName);
};

