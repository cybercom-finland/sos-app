'use strict';

var pictures = require('../controllers/pictures');

module.exports = function(app, passport) {
    app.route('/pictures/:pictureId')
        .get(pictures.image);

    app.param('pictureId', pictures.byName);
};