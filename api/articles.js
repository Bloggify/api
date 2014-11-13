// Dependencies
var Cache = require(Bloggify.PATH_LIB + "/common/cache")
  , Utils = require(Bloggify.PATH_UTIL)
  , GitHandlers = require("./git_handlers")
  , Fs = require("fs")
  ;

/*!
 *  Article APIs
 *  ============
 *   - list
 *   - get
 *   - save
 *   - delete
 */
var Articles = module.exports = {};

/**
 * list
 * Lists summary details about articles.
 *
 * @name list
 * @function
 * @param {Object} data An object containing the following fields:
 *
 *  - `Object` *query* The query applied to find request (Default: `{}`).
 *  - `Object` *m_options* The options applied to find request (Default: `{}`).
 *  - `Object` *options* An object containing the following fields:
 *    - `Boolean` *noContent* If `false`, the content of articles will be fetched (Default: true).
 *    - `Boolean` *markdown* If `true`, the content will be parsed as Markdown (Default: true).
 *
 * @param {Function} callback The callback function (err, responseObj).
 * @return {undefined}
 */
Articles.list = function (data, callback) {
    var def = {
        query: {}
      , m_options: {}
      , options: {
            noContent: true
        }
    };

    data = Utils.mergeRecursive(
        def
      , data
    );

    Cache.post(data.query, data.m_options, data.options, callback);
};

/**
 * get
 * Gets summary details of an article.
 *
 * @name get
 * @function
 * @param {Integer|String} id The article id.
 * @param {Object} data An object containing the following fields:
 *
 *  - `Object` *m_options* The options applied to find request (Default: `{}`).
 *  - `Object` *options* An object containing the following fields:
 *    - `Boolean` *noContent* If `false`, the content of articles will be fetched (Default: true).
 *    - `Boolean` *markdown* If `true`, the content will be parsed as Markdown (Default: true).
 *
 * @param {Function} callback The callback function (err, responseObj).
 * @return {undefined}
 */
Articles.get = function (id, data, callback) {

    var def = {
        m_options: {}
      , options: {
            noContent: true
        }
    };

    data = Utils.mergeRecursive(
        def
      , data
    );

    id = parseInt(id);
    if (isNaN(id)) {
        return callback({
            error: "Invalid post id."
          , statusCode: 404
        });
    }

    data.query = { id: id };

    Articles.list.call(this, data, function (err, data) {
        if (err) { return callback(err); }
        if (!data.length) {
            return callback({
                error: "Post not found"
              , statusCode: 404
            });
        }
        callback(null, data[0]);
    });
};

/**
 * save
 * Creates or updates an article.
 *
 * @name save
 * @function
 * @param {Object} data An object that must containin valid fields, following article schema.
 * @param {Function} callback The callback function (err, responseObj).
 * @return {undefined}
 */
Articles.save = function (data, callback) {

    var self = this
      , articleData = Object(data)
      , invalidFields = []
      , sessionData = Object(self.session && self.session.getData())
      ;

    if (typeof articleData.title !== "string" || !articleData.title.length) {
        invalidFields.push("title");
    }

    if (typeof articleData.content !== "string" || !articleData.content.length) {
        invalidFields.push("content");
    }

    Bloggify.articles.count(function (err, count) {
        if (err) { return callback(err); }

        articleData.id = parseInt(articleData.id) || count + 1;
        if (isNaN(articleData.id)) {
            invalidFields.push("id");
        }

        if (invalidFields.length) {
            return callback({
                error: "validate_error"
              , fields: invalidFields
              , statusCode: 400
            });
        }

        articleData.slug = articleData.slug || Utils.slug(articleData.title);
        if (articleData.date) {
            articleData.date = new Date(articleData.date)
        } else {
            articleData.date = new Date();
        }

        articleData.by = sessionData.displayName || sessionData.username || data.author || "Ghost";

        function saveArticle() {

            var article = Utils.cloneObject(articleData, true);
            delete article.content;

            Bloggify.articles.update({ id: article.id }, article, { upsert: true}, function (err) {
                if (err) { return callback(err); }

                var fileName = Bloggify.config.pathContent + Bloggify.config.articles + "/" + articleData.id + ".md";
                Fs.writeFile(fileName, articleData.content, function (err) {
                    if (err) { return callback(err); }

                    GitHandlers.update("Article saved: " + articleData.title, function (err, data) {
                        if (err) { return callback(err); }
                        callback(null, {
                            success: "Article saved."
                        });
                    });
                });
            });
        }

        if (!Bloggify._events["article:save"]) {
            saveArticle();
        } else {
            Bloggify.emit("article:save", self, articleData, saveArticle);
        }
    });
};

/**
 * delete
 * Deletes an article.
 *
 * @name delete
 * @function
 * @param {Object} data An object containing the following fields:
 *
 *  - `String|Integer` id: The article id that should be deleted.
 *
 * @param {Function} callback The callback function (err, responseObj).
 * @return {undefined}
 */
Articles.delete = function (data, callback) {
    var data = Object(data);
    data.id = parseInt(data.id);
    if (isNaN(data.id)) {
        return callback({
            error: "validate_error"
          , fields: ["id"]
          , statusCode: 400
        });
    }

    Bloggify.articles.findOne({
        id: data.id
    }, function (err, article) {
        if (err) { return callback(err); }
        if (!article) {
            return callback({
                error: "Article not found."
              , statusCode: 404
            });
        }

        var articlePath = Bloggify.config.pathContent + Bloggify.config.articles + "/" + article.id + ".md";
        Fs.unlink(articlePath, function (err) {
            Bloggify.articles.remove({
                id: article.id
            }, function (err, count) {
                if (err) { return callback(err); }

                GitHandlers.update("Article deleted: " + article.title, function (err, data) {
                    if (err) { return callback(err); }
                    callback(null, {
                        success: "Article was deleted."
                    });
                });
            });
        });
    });
}
