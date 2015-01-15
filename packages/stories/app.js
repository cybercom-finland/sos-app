'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Stories = new Module('stories');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Stories.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Stories.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
   
    Stories.menus.add({
        title: 'Stories',
        link: 'stories',
        roles: ['authenticated'],
        menu: 'main'
    });
    Stories.menus.add({
        title: 'New Story',
        link: 'new story',
        roles: ['authenticated'],
        menu: 'main'
    });

    /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Stories.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Stories.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Stories.settings(function(err, settings) {
        //you now have the settings object
    });
    */

    return Stories;
});
