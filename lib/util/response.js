/**
 * responseHandler
 * Generates a response handler function.
 *
 * @name responseHandler
 * @function
 * @param {Object} ctx The ctx object.
 * @return {Function} The response handler.
 */
module.exports = ctx => {
    return (err, data) => {
        if (err) {
            if (err.code === "ENOENT") {
                err.statusCode = 404
                err.message = "Not found."
            }
            if (typeof err.statusCode !== "number") {
                Bloggify.log(err, "error");
                ctx.end({
                    error: "Internal server error."
                }, 500);
            } else {
                ctx.end({
                    error: err.message
                }, err.statusCode);
            }
            return;
        }
        ctx.json(data);
    }
};
