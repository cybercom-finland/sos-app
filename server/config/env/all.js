'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
	root: rootPath,
	port: process.env.PORT || 3000,
	hostname: process.env.HOST || process.env.HOSTNAME,
	db: process.env.MONGOHQ_URL,
	templateEngine: 'swig',

    // The secret should be set to a non-guessable string that
    // is used to compute a session hash
    sessionSecret: 'VVW0F-4hN7F-IGTIH-8B7VA-5Go33-50SWY-LN25A-KQZHY-805IH-QdLFY-VAC9N-PFI0Z',
    // The name of the MongoDB collection to store sessions in
    sessionCollection: 'sessions'
};
