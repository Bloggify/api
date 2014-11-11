// Dependencies
var GitHandlers = require("./git_handlers");

// Util APIs
// =========
//  - sync
var Util = module.exports = {};

/**
 * sync
 * Syncs the remote data with the local data.
 *
 * @name sync
 * @function
 * @param {Function} callback The callback function (err, data).
 * @return {undefined}
 */
Util.sync = function (callback) {
    GitHandlers.remote(function (err) {
        if (err) { return callback(err); }
        callback(null, {
            success: "Data synced with remote."
        });
    });
};
