// Dependencies
var Cache = require(Bloggify.ROOT + "/lib/common/cache")
  , Utils = require(Bloggify.ROOT + "/utils")
  , GitHandlers = require("./git_handlers")
  , Fs = require("fs")
  ;

/*!
 *  Page APIs
 *  ============
 *   - list
 *   - get
 *   - save
 *   - delete
 */
var Pages = module.exports = {};

/**
 * list
 * Lists summary details about pages.
 *
 * @name list
 * @function
 * @param {Object} data An object containing the following fields:
 *
 *  - `Object` *query* The query applied to find request (Default: `{}`).
 *  - `Object` *m_options* The options applied to find request (Default: `{}`).
 *  - `Object` *options* An object containing the following fields:
 *    - `Boolean` *noContent* If `false`, the content of pages will be fetched (Default: true).
 *    - `Boolean` *markdown* If `true`, the content will be parsed as Markdown (Default: true).
 *    - `Boolean` *noBlog* If `true`, the Blog page (that is special) will not be fetched.
 *
 * @param {Function} callback The callback function (err, responseObj).
 * @return {undefined}
 */
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

/**
 * get
 * Gets summary details of a page.
 *
 * @name get
 * @function
 * @param {Integer|String} slug The page slug.
 * @param {Object} data An object containing the following fields:
 *
 *  - `Object` *m_options* The options applied to find request (Default: `{}`).
 *  - `Object` *options* An object containing the following fields:
 *    - `Boolean` *noContent* If `false`, the content of pages  will be fetched (Default: true).
 *    - `Boolean` *markdown* If `true`, the content will be parsed as Markdown (Default: true).
 *
 * @param {Function} callback The callback function (err, responseObj).
 * @return {undefined}
 */
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

    data.query = { slug: slug };

    Pages.list.call(this, data, function (err, page) {
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

/**
 * save
 * Creates or updates a page.
 *
 * @name save
 * @function
 * @param {Object} data An object that must containin valid fields, following page schema.
 * @param {Function} callback The callback function (err, responseObj).
 * @return {undefined}
 */
Pages.save = function (data, callback) {

    var self = this
      , pageData = data
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

/**
 * delete
 * Deletes a page.
 *
 * @name delete
 * @function
 * @param {Object} data An object containing the following fields:
 *
 *  - `String|Integer` id: The page slug that should be deleted.
 *
 * @param {Function} callback The callback function (err, responseObj).
 * @return {undefined}
 */
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
