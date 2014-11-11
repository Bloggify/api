// Dependencies
var Git = require("git-tools");

// Constants
const Repo = new Git(Bloggify.config.pathContent);

/*!
 *  GitHandler APIs
 *  ===============
 *   - update
 *   - remote
 * */
var GitHandlers = module.exports = {};

/**
 * update
 * Adds all the files and makes the commit.
 *
 * @name update
 * @function
 * @param {String} message The commit message.
 * @param {Function} callback The callback function (err, data).
 * @return {undefined}
 */
GitHandlers.update = function (message, callback) {
    Repo.exec("diff", function (err, data) {
        if (err) { return callback(err); }
        if (!data) {
            return callback(null, null);
        }
        Repo.exec("add", ".", "-A", function (err, data) {
            if (err) { return callback(err); }
            Repo.exec("commit", "-m", message, callback);
        });
    });
};

/**
 * remote
 * Pulls data from remote and then pushes.
 *
 * @name remote
 * @function
 * @param {Function} callback The callback function (err, data).
 * @return {undefined}
 */
GitHandlers.remote = function (callback) {
    Repo.currentBranch(function (err, branch) {
        if (err) { return callback(err); }
        branch = branch || "master";
        Repo.exec("pull", "origin", branch, function (err, data) {
            if (err) { return callback(err); }
            Repo.exec("push", "origin", branch, function (err, data) {
                if (err) { return callback(err); }
                callback(null, data);
            });
        });
    });
};
