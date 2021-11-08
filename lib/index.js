// Dependencies
const ResponseHandler = require("./util/response")
    , SessionCheck = require("./util/session_check")

// Bloggify APIs
module.exports = () => {

    /*!
     *  Rest API
     * */

    // List articles
    Bloggify.server.addPage("/api/articles", ctx => {
        Bloggify.getArticles(ctx.query, ResponseHandler(ctx))
    })

    // Get Article
    Bloggify.server.addPage(/\/api\/article\/[0-9]+$/, ctx => {
        const id = (ctx.pathname.match(/\/api\/article\/([0-9]+)$/) || [])[1]
        Bloggify.getArticleById(id, ResponseHandler(ctx))
    })

    // Save article
    Bloggify.server.addPage("/api/save/article", "post", ctx => {
        if (SessionCheck(ctx)) { return }
        Bloggify.saveArticle(ctx.query, ResponseHandler(ctx))
    })

    // Delete article
    Bloggify.server.addPage("/api/delete/article", "post", ctx => {
        if (SessionCheck(ctx)) { return }
        Bloggify.deleteArticle(ctx.query, ResponseHandler(ctx))
    })

    // List pages
    Bloggify.server.addPage("/api/pages", ctx => {
        Bloggify.getPages(ctx.query, ResponseHandler(ctx))
    })

    // Get Page
    Bloggify.server.addPage(/\/api\/page\/.*/, ctx => {
        const slug = (ctx.pathname.match(/\/api\/page\/(.*)/) || [])[1] || ""
        Bloggify.getPageBySlug(slug, ResponseHandler(ctx))
    })

    // Save page
    Bloggify.server.addPage("/api/save/page", "post", ctx => {
        if (SessionCheck(ctx)) { return }
        if (ctx.data.slug) {
            Bloggify.savePage(
                ctx.data.slug
              , ctx.data.title
              , ctx.data.content
              , ctx.data.custom
              , ResponseHandler(ctx)
            )
        } else {
            Bloggify.createPage(
                ctx.data.title
              , ctx.data.content
              , ctx.data.custom
              , ResponseHandler(ctx)
            )
        }
    })

    // Delete page
    Bloggify.server.addPage("/api/delete/page", "post", ctx => {
        Bloggify.createPage(
            ctx.data.slug
          , ResponseHandler(ctx)
        )
    })

//    // Sync with remote
//    Bloggify.server.addPage("/api/sync", ctx => {
//        if (SessionCheck(ctx)) { return }
//        Api.util.sync.call(ctx, ResponseHandler(ctx))
//    })

//    this.on("request", (api, data, callback, scope) => {
//        api = Utils.findFunction(Api, api)
//        if (!api) {
//            return callback(new Error("No such an API."))
//        }
//        scope = scope || {}
//        api.call(scope, data, callback)
//    })
}
