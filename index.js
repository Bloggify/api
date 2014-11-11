var Api = require("./api");

module.exports = function (api) {

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

    Bloggify.server.page.add("/api/pages", function (lien) {
        Api.articles.list.call(lien, lien.data, responseHandler(lien));
    });

    Bloggify.server.page.add("/api/posts", function (lien) {
        Api.articles.list.call(lien, lien.data, responseHandler(lien));
    });

    Bloggify.server.page.add(/\/api\/post\/[0-9]+$/, function (lien) {
        var id = (lien.pathName.match(/\/api\/post\/([0-9]+)$/) || [])[1];
        Api.articles.get.call(lien, id, lien.data, responseHandler(lien));
    });

    Bloggify.server.page.add(/\/api\/page\/.*/, function (lien) {
        // TODO Regex
        var slug = (lien.pathName.match(/\/api\/page\/(.*)/) || [])[1] || "";
        Api.pages.get(slug, lien.data, responseHandler(lien));
    });

    Bloggify.server.page.add("/api/delete/page", "post", function (lien) {
        Api.pages.delete.call(lien, lien.data, responseHandler(lien));
    });

    Bloggify.server.page.add("/api/delete/article", "post", function (lien) {
        if (sessionCheck(lien)) { return; }
        Api.articles.delete.call(lien, lien.data, responseHandler(lien));
    });

    Bloggify.server.page.add("/api/save/page", "post", function (lien) {
        if (sessionCheck(lien)) { return; }
        Api.pages.save.call(lien, lien.data, responseHandler(lien));
    });

    Bloggify.server.page.add("/api/save/article", "post", function (lien) {
        if (sessionCheck(lien)) { return; }
        Api.articles.save.call(lien, lien.data, responseHandler(lien));
    });

    Bloggify.server.page.add("/api/sync", function (lien) {
        if (sessionCheck(lien)) { return; }
        Api.util.sync.call(lien, responseHandler(lien));
    });
};
