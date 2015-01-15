'use strict';

var story = require('../controllers/story');

// The Package is past automatically as first parameter
module.exports = function(Stories, app, auth, database) {

    app.get('/stories/example/anyone', function(req, res, next) {
        res.send('Anyone can access this');
    });

    app.get('/stories/example/auth', auth.requiresLogin, function(req, res, next) {
        res.send('Only authenticated users can access this');
    });

    app.get('/stories/example/admin', auth.requiresAdmin, function(req, res, next) {
        res.send('Only users with Admin role can access this');
    });

    app.get('/stories/example/render', function(req, res, next) {
        Stories.render('index', {
            package: 'stories'
        }, function(err, html) {
            //Rendering a view from the Package server/views
            res.send(html);
        });
    });
    app.route('/stories')
        .get(story.all)
        .post(auth.requiresLogin, story.create);

    app.route('/stories/:storyId/img')
        .get(story.image);

    app.param('storyId', story.byName);

};
