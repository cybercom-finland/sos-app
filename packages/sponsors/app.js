'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Sponsors = new Module('sponsors');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Sponsors.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Sponsors.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
    Sponsors.menus.add({
        'title': 'sponsors',
        'link': 'sponsors',
        'roles': ['authenticated'],
        'menu': 'main'
    });

    Sponsors.menus.add(
    {
        'title': 'add new sponsor',
        'link': 'create_sponsor',
        'roles' : ['authenticated']
    });

    /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Sponsors.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Sponsors.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Sponsors.settings(function(err, settings) {
        //you now have the settings object
    });
    */

    return Sponsors;
});
