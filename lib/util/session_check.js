/**
 * sessionCheck
 * Checks if the session exists.
 *
 * @name sessionCheck
 * @function
 * @param {Object} lien The lien object.
 * @return {Boolean} `true` if session exists, otherwise `false`.
 */
module.exports = function (lien) {
    var sessionData = lien.session.getData();
    if (!sessionData) {
        return lien.end({
            error: "autorize_error"
          , message: "You're not authorized."
        }, 403);
        return true;
    }
    return false;
};
