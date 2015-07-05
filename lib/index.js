// Dependencies
var Api = require("./api")
  , ResponseHandler = require("./util/response")
  , SessionCheck = require("./util/session_check")
  , Utils = require(Bloggify.PATH_UTIL)
  ;

// Bloggify APIs
module.exports = function () {
    /*!
     *  Rest API
     * */
    // List articles
    Bloggify.server.page.add("/api/articles", function (lien) {
        Api.articles.list.call(lien, lien.data, ResponseHandler(lien));
    });

    // Get Article
    Bloggify.server.page.add(/\/api\/article\/[0-9]+$/, function (lien) {
        var id = (lien.pathName.match(/\/api\/article\/([0-9]+)$/) || [])[1];
        Api.articles.get.call(lien, id, lien.data, ResponseHandler(lien));
    });

    // Save article
    Bloggify.server.page.add("/api/save/article", "post", function (lien) {
        if (SessionCheck(lien)) { return; }
        Api.articles.save.call(lien, lien.data, ResponseHandler(lien));
    });

    // Delete article
    Bloggify.server.page.add("/api/delete/article", "post", function (lien) {
        if (SessionCheck(lien)) { return; }
        Api.articles.delete.call(lien, lien.data, ResponseHandler(lien));
    });

    // List pages
    Bloggify.server.page.add("/api/pages", function (lien) {
        Api.pages.list.call(lien, lien.data, ResponseHandler(lien));
    });

    // Get Page
    Bloggify.server.page.add(/\/api\/page\/.*/, function (lien) {
        // TODO Regex
        var slug = (lien.pathName.match(/\/api\/page\/(.*)/) || [])[1] || "";
        Api.pages.get(slug, lien.data, ResponseHandler(lien));
    });

    // Save page
    Bloggify.server.page.add("/api/save/page", "post", function (lien) {
        if (SessionCheck(lien)) { return; }
        Api.pages.save.call(lien, lien.data, ResponseHandler(lien));
    });

    // Delete page
    Bloggify.server.page.add("/api/delete/page", "post", function (lien) {
        Api.pages.delete.call(lien, lien.data, ResponseHandler(lien));
    });

    // Sync with remote
    Bloggify.server.page.add("/api/sync", function (lien) {
        if (SessionCheck(lien)) { return; }
        Api.util.sync.call(lien, ResponseHandler(lien));
    });

    this.on("request", function (api, data, callback, scope) {
        api = Utils.findFunction(Api, api);
        if (!api) {
            return callback(new Error("No such an API."));
        }
        scope = scope || {};
        api.call(scope, data, callback);
    });
};
