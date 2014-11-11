var Cache = require(Bloggify.ROOT + "/lib/common/cache")
  , Utils = require(Bloggify.ROOT + "/utils")
  , GitHandlers = require("./git_handlers")
  ;

var Pages = module.exports = {};
Pages.list = function (data, callback) {

    var def = {
        query: {}
      , m_options: {}
      , options: {
            noContent: true
          , noBlog: true
        }
    };

    data = Utils.mergeRecursive(
        def
      , data
    );

    Cache.page(data.query, data.m_options, data.options, callback);
};

Pages.get = function (slug, data, callback) {
    var def = {
        m_options: {}
      , options: {
            noContent: true
          , noBlog: true
        }
    };

    data = Utils.mergeRecursive(
        def
      , data
    );

    data.m_query = { slug: slug };

    Pages.list.call(this, data, data.m_options, data.options, function (err, page) {
        if (err) { return callback(err, 500); }
        if (!page.length) {
            return callback({
                error: "Page not found"
              , statusCode: 404
            });
        }

        callback(null, page[0]);
    });
};

Pages.delete = function (data, callback) {
    var data = Object(data);
    if (!data.slug) {
        return callback({
            error: "validate_error"
          , fields: ["slug"]
          , statusCode: 400
        });
    }

    Bloggify.pages.findOne({
        slug: data.slug
    }, function (err, page) {
        if (err) { return callback(err); }
        if (!page) {
            return callback({
                error: "Page not found."
              , statusCode: 404
            });
        }

        var pagePath = Bloggify.config.pathContent + Bloggify.config.pages + "/" + page.slug + ".md";
        Fs.unlink(pagePath, function (err) {
            Bloggify.pages.remove({
                slug: page.slug
            }, function (err, count) {
                if (err) { return callback(err); }
                GitHandlers.update("Page deleted: " + page.title, function (err, data) {
                    if (err) { return callback(err); }
                    callback(null, {
                        success: "Page was deleted."
                    });
                });
            });
        });
    });
};

Pages.save = function (data, callback) {

    var self = this
      , pageData = lien.data
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
        return callback({
            error: "validate_error"
          , fields: invalidFields
          , statusCode: 400
        });
    }

    pageData.slug = pageData.slug || Utils.slug(pageData.title);
    pageData.path = pageData.path || "/" + pageData.slug;

    var page = Utils.cloneObject(pageData, true);
    delete page.content;

    function savePage() {
        Bloggify.pages.update({ slug: page.slug }, page, { upsert: true}, function (err) {
            if (err) { return callback(err); }

            var fileName = Bloggify.config.pathContent + Bloggify.config.pages + "/" + pageData.slug + ".md";
            Fs.writeFile(fileName, pageData.content, function (err) {
                if (err) { return callback(err); }

                GitHandlers.update("Page saved: " + pageData.title, function (err, data) {
                    if (err) { return callback(err); }
                    callback(null, {
                        success: "Page was saved."
                    });
                });
            });
        });
    }

    if (!Bloggify._events["page:save"]) {
        savePage();
    } else {
        Bloggify.emit("page:save", self, pageData, savePage);
    }
};
