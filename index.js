var Cache = require(Bloggify.ROOT + "/lib/common/cache")
  , Utils = require(Bloggify.ROOT + "/utils")
  ;

module.exports = function (api) {

    Bloggify.server.page.add("/api/pages", function (lien) {

        var def = {
            query: {}
          , m_options: {}
          , options: {
                noContent: true
              , noBlog: true
            }
        };

        lien.data = Utils.mergeRecursive(
            def
          , lien.data
        );

        Cache.page(lien.data.query, lien.data.m_options, lien.data.options, function (err, pages) {
            if (err) { return lien.end(err, 500); }
            lien.end(pages);
        });
    });

    Bloggify.server.page.add("/api/posts", function (lien) {

        var def = {
            query: {}
          , m_options: {}
          , options: {
                noContent: true
            }
        };

        lien.data = Utils.mergeRecursive(
            def
          , lien.data
        );

        Cache.post(lien.data.query, lien.data.m_options, lien.data.options, function (err, data) {
            if (err) { return lien.end(err, 500); }
            lien.end(data);
        });
    });

    Bloggify.server.page.add(/\/api\/post\/[0-9]+$/, function (lien) {

        var id = parseInt((lien.pathName.match(/\/api\/post\/([0-9]+)$/) || [])[1]);
        if (isNaN(id)) {
            return lien.end({
                error: "Invalid post id."
            }, 404);
        }

        var def = {
            m_options: {}
          , options: {
                noContent: true
            }
        };

        lien.data = Utils.mergeRecursive(
            def
          , lien.data
        );

        Cache.post({id: id}, lien.data.m_options, lien.data.options, function (err, data) {
            if (err) { return lien.end(err, 500); }
            if (!data.length) {
                return lien.end({
                    error: "Post not found"
                }, 404);
            }
            lien.end(data[0]);
        });
    });

    // TODO Regex
    Bloggify.server.page.add(/\/api\/page\/.*/, function (lien) {
        var slug = (lien.pathName.match(/\/api\/page\/(.*)/) || [])[1] || "";

        var def = {
            m_options: {}
          , options: {
                noContent: true
              , noBlog: true
            }
        };

        lien.data = Utils.mergeRecursive(
            def
          , lien.data
        );

        Cache.page({slug: slug}, lien.data.m_options, lien.data.options, function (err, page) {
            if (err) { return lien.end(err, 500); }
            if (!page.length) {
                return lien.end({
                    error: "Page not found"
                }, 404)
            }
            lien.end(page[0]);
        });
    });
};
