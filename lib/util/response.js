/**
 * responseHandler
 * Generates a response handler function.
 *
 * @name responseHandler
 * @function
 * @param {Object} lien The lien object.
 * @return {Function} The response handler.
 */
module.exports = function (lien) {
    return function (err, data) {
        if (err) {
            if (typeof err.statusCode !== "number") {
                Bloggify.log(err, "error");
                lien.end({
                    error: "Internal server error."
                }, 500);
            } else {
                lien.end(err, err.statusCode);
            }
            return;
        }
        lien.end(data);
    }
};
