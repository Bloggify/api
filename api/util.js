var GitHandlers = require("./git_handlers");

var Util = module.exports = {};
Util.sync = function (callback) {
    GitHandlers.remote(function (err) {
        if (err) { return callback(err); }
        callback(null, {
            success: "Data synced with remote."
        });
    });
};
