var Git = require("git-tools");

var GitHandlers = module.exports = {};

var Repo = new Git(Bloggify.config.pathContent);
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
