var Cache = require(Bloggify.ROOT + "/lib/common/cache")
  , Utils = require(Bloggify.ROOT + "/utils")
  , Fs = require("fs")
  , GitHandlers = require("./git-handlers")
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

    Bloggify.server.page.add("/api/save/page", "post", function (lien) {

        var sessionData = lien.session.getData();
        if (!sessionData) {
            return lien.end({
                error: "You're not authorized."
            }, 403);
        }

        var pageData = lien.data
          , invalidFields = []
          ;

        if (typeof pageData.title !== "string" || !pageData.title.length) {
            invalidFields.push("title");
        }

        if (typeof pageData.content !== "string" || !pageData.content.length) {
            invalidFields.push("content");
        }

        pageData.order = parseInt(pageData.order);
        if (isNaN(pageData.order)) {
            invalidFields.push("order");
        }

        if (invalidFields.length) {
            return lien.end({
                error: "validate_error"
              , fields: invalidFields
            }, 400);
        }

        pageData.slug = pageData.slug || Utils.slug(pageData.title);
        pageData.path = pageData.path || "/" + pageData.slug;

        var page = Utils.cloneObject(pageData, true);
        delete page.content;

        function savePage() {
            Bloggify.pages.update({ slug: page.slug }, page, { upsert: true}, function (err) {

                if (err) {
                    Bloggify.log(err, "error");
                    return lien.end({
                        error: "Internal server error."
                    }, 500);
                }

                var fileName = Bloggify.config.pathContent + Bloggify.config.pages + "/" + pageData.slug + ".md";
                Fs.writeFile(fileName, pageData.content, function (err) {

                    if (err) {
                        Bloggify.log(err, "error");
                        return lien.end({
                            error: "Internal server error."
                        }, 500);
                    }

                    GitHandlers.update("Page saved: " + pageData.title, function (err, data) {
                        if (err) {
                            Bloggify.log(err, "error");
                            return lien.end({
                                error: "Internal server error."
                            }, 500);
                        }

                        lien.end(page);
                    });
                });
            });
        }

        if (!Bloggify._events["page:save"]) {
            savePage();
        } else {
            Bloggify.emit("page:save", lien, pageData, savePage);
        }
    });

    Bloggify.server.page.add("/api/save/article", "post", function (lien) {

        var sessionData = lien.session.getData();
        if (!sessionData) {
            return lien.end({
                error: "You're not authorized."
            }, 403);
        }

        var articleData = lien.data || {}
          , invalidFields = []
          ;

        if (typeof articleData.title !== "string" || !articleData.title.length) {
            invalidFields.push("title");
        }

        if (typeof articleData.content !== "string" || !articleData.content.length) {
            invalidFields.push("content");
        }

        Bloggify.posts.count(function (err, count) {

            if (err) {
                Bloggify.log(err, "error");
                return lien.end({
                    error: "Internal server error."
                }, 500);
            }

            articleData.id = parseInt(articleData.id) || count + 1;
            if (isNaN(articleData.id)) {
                invalidFields.push("id");
            }

            if (invalidFields.length) {
                return lien.end({
                    error: "validate_error"
                  , fields: invalidFields
                }, 400);
            }

            articleData.slug = articleData.slug || Utils.slug(articleData.title);
            if (articleData.date) {
                articleData.date = new Date(articleData.date)
            } else {
                articleData.date = new Date();
            }

            articleData.by = sessionData.displayName || sessionData.username || "Ghost";


            function saveArticle() {

                var article = Utils.cloneObject(articleData, true);
                delete article.content;

                Bloggify.posts.update({ id: article.id }, article, { upsert: true}, function (err) {

                    if (err) {
                        Bloggify.log(err, "error");
                        return lien.end({
                            error: "Internal server error."
                        }, 500);
                    }

                    var fileName = Bloggify.config.pathContent + Bloggify.config.posts + "/" + articleData.id + ".md";
                    Fs.writeFile(fileName, articleData.content, function (err) {

                        if (err) {
                            Bloggify.log(err, "error");
                            return lien.end({
                                error: "Internal server error."
                            }, 500);
                        }

                        GitHandlers.update("Article saved: " + articleData.title, function (err, data) {
                            if (err) {
                                Bloggify.log(err, "error");
                                return lien.end({
                                    error: "Internal server error."
                                }, 500);
                            }
                            lien.end({
                                success: "Article saved."
                            });
                        });
                    });
                });
            }

            if (!Bloggify._events["article:save"]) {
                saveArticle();
            } else {
                Bloggify.emit("article:save", lien, articleData, saveArticle);
            }
        });
    });

    Bloggify.server.page.add("/api/sync", function (lien) {
        var sessionData = lien.session.getData();
        if (!sessionData) {
            return lien.end({
                error: "You're not authorized."
            }, 403);
        }

        GitHandlers.remote(function (err) {

            if (err) {
                Bloggify.log(err, "error");
                return lien.end({
                    error: "Internal server error."
                }, 500);
            }

            lien.end({
                success: "Data synced with remote."
            });
        });
    });
};
