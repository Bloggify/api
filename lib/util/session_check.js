/**
 * sessionCheck
 * Checks if the session exists.
 *
 * @name sessionCheck
 * @function
 * @param {Object} ctx The ctx object.
 * @return {Boolean} `true` if session exists, otherwise `false`.
 */
module.exports = function (ctx) {
    const sessionData = ctx.session.getData();
    if (!sessionData) {
        return ctx.end({
            error: "not_authorized"
          , message: "You're not authorized."
        }, 403);
        return true;
    }
    return false;
};
