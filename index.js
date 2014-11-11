var Api = require("./api");

module.exports = function (api) {

    /**
     * responseHandler
     * Generates a response handler function.
     *
     * @name responseHandler
     * @function
     * @param {Object} lien The lien object.
     * @return {Function} The response handler.
     */
    function responseHandler(lien) {
        return function (err, data) {
            if (err) {
                if (typeof err.statusCode !== "number") {
                    Bloggify.log(err, "error");
                    lien.end({
                        error: "Internal server error."
                    }, 500);
                } else {
                    lien.end(err, err.statusCode);
                }
                return;
            }
            lien.end(data);
        }
    }

    /**
     * sessionCheck
     * Checks if the session exists.
     *
     * @name sessionCheck
     * @function
     * @param {Object} lien The lien object.
     * @return {Boolean} `true` if session exists, otherwise `false`.
     */
    function sessionCheck(lien) {
        var sessionData = lien.session.getData();
        if (!sessionData) {
            return lien.end({
                error: "autorize_error"
              , message: "You're not authorized."
            }, 403);
            return true;
        }
        return false;
    }


    // List articles
    Bloggify.server.page.add("/api/articles", function (lien) {
        Api.articles.list.call(lien, lien.data, responseHandler(lien));
    });

    // Get Article
    Bloggify.server.page.add(/\/api\/post\/[0-9]+$/, function (lien) {
        var id = (lien.pathName.match(/\/api\/post\/([0-9]+)$/) || [])[1];
        Api.articles.get.call(lien, id, lien.data, responseHandler(lien));
    });

    // Save article
    Bloggify.server.page.add("/api/save/article", "post", function (lien) {
        if (sessionCheck(lien)) { return; }
        Api.articles.save.call(lien, lien.data, responseHandler(lien));
    });

    // Delete article
    Bloggify.server.page.add("/api/delete/article", "post", function (lien) {
        if (sessionCheck(lien)) { return; }
        Api.articles.delete.call(lien, lien.data, responseHandler(lien));
    });

    // List pages
    Bloggify.server.page.add("/api/pages", function (lien) {
        Api.pages.list.call(lien, lien.data, responseHandler(lien));
    });

    // Get Page
    Bloggify.server.page.add(/\/api\/page\/.*/, function (lien) {
        // TODO Regex
        var slug = (lien.pathName.match(/\/api\/page\/(.*)/) || [])[1] || "";
        Api.pages.get(slug, lien.data, responseHandler(lien));
    });

    // Save page
    Bloggify.server.page.add("/api/save/page", "post", function (lien) {
        if (sessionCheck(lien)) { return; }
        Api.pages.save.call(lien, lien.data, responseHandler(lien));
    });

    // Delete page
    Bloggify.server.page.add("/api/delete/page", "post", function (lien) {
        Api.pages.delete.call(lien, lien.data, responseHandler(lien));
    });

    // Sync with remote
    Bloggify.server.page.add("/api/sync", function (lien) {
        if (sessionCheck(lien)) { return; }
        Api.util.sync.call(lien, responseHandler(lien));
    });
};
