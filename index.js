var Cache = require(Bloggify.ROOT + "/lib/common/cache");

module.exports = function (api) {

    Bloggify.server.page.add("/api/pages", function (lien) {
        var options = lien.search
          , pQuery = options.query
          , pOptions = options.options
          ;

        try {
            pQuery = JSON.parse(pQuery);
        } catch (e) {
            pQuery = {};
        }

        try {
            pOptions = JSON.parse(pOptions);
        } catch (e) {
            pOptions = {};
        }

        Bloggify.pages.find(pQuery, pOptions).toArray(function (err, pages) {
            if (err) { return lien.end(err, 500); }
            lien.end(pages);
        });
    });

    Bloggify.server.page.add("/api/posts", function (lien) {
        var options = lien.search
          , pQuery = options.query
          , pOptions = options.options
          ;

        try {
            pQuery = JSON.parse(pQuery);
        } catch (e) {
            pQuery = {};
        }

        try {
            pOptions = JSON.parse(pOptions);
        } catch (e) {
            pOptions = {};
        }

        Cache.post(pQuery, pOptions, function (err, data) {
            if (err) { return lien.end(err, 500); }
            lien.end(data);
        });
    });

    Bloggify.server.page.add(/\/api\/post\/[0-9]+$/, function (lien) {

        var id = parseInt((lien.pathName.match(/\/api\/post\/([0-9]+)$/) || [])[1]);
        if (isNaN(id)) {
            return lien.end({
                error: "Post not found"
            }, 404);
        }

        Cache.post({id: id}, function (err, data) {
            if (err) { return lien.end(err, 500); }
            var post = data[0];
            if (!post) {
                return lien.end({
                    error: "Post not found"
                }, 404);
            }
            lien.end(post);
        });
    });

    // TODO Regex
    Bloggify.server.page.add(/\/api\/page\/.*/, function (lien) {
        var slug = (lien.pathName.match(/\/api\/page\/(.*)/) || [])[1] || "";
        Bloggify.pages.findOne({slug: slug}, function (err, page) {
            if (err) { return lien.end(err, 500); }
            if (lien.search.markdown === "true") {
                lien.search.markdown = true;
            }
            Cache.file(Bloggify.config.pages + "/" + page.slug + ".md", {markdown: lien.search.markdown}, function (err, content) {
                if (err) { return lien.end(404); }
                page.content = content;
                lien.end(page);
            });
        });
    });
};
