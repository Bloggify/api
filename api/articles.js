var Cache = require(Bloggify.ROOT + "/lib/common/cache")
  , Utils = require(Bloggify.ROOT + "/utils")
  , GitHandlers = require("./git_handlers")
  , Fs = require("fs")
  ;

var Articles = module.exports = {};
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

    Bloggify.posts.count(function (err, count) {
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

            Bloggify.posts.update({ id: article.id }, article, { upsert: true}, function (err) {
                if (err) { return callback(err); }

                var fileName = Bloggify.config.pathContent + Bloggify.config.posts + "/" + articleData.id + ".md";
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

    Bloggify.posts.findOne({
        id: data.id
    }, function (err, article) {
        if (err) { return callback(err); }
        if (!article) {
            return callback({
                error: "Article not found."
              , statusCode: 404
            });
        }

        var articlePath = Bloggify.config.pathContent + Bloggify.config.posts + "/" + article.id + ".md";
        Fs.unlink(articlePath, function (err) {
            Bloggify.posts.remove({
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
