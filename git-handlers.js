var Git = require("git-tools");

var GitHandlers = module.exports = {};

var Repo = new Git(Bloggify.config.pathContent);
GitHandlers.update = function (message, callback) {
    Repo.exec("diff", function (err, data) {
        if (err) { return callback(err); }
        if (!data) {
            return callback(null, null);
        }
        Repo.exec("add", ".", function (err, data) {
            if (err) { return callback(err); }
            Repo.exec("commit", "-m", message, callback);
        });
    });
};
