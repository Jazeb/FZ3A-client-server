exports.apiSuccess = (res, result, message = "success") => {
    res.status(200).json({
        error: false,
        message: message,
        data: result,
        errors: [],
    });
};

exports.apiError = (res, message = "Unable to process request", result = null, err, errorCode = 400) => {
    res.status(errorCode).json({
        error: true,
        message: message,
        data: result,
        errors: [err && err.parent && err.parent.code ? err.parent.code : err || null],
    });
};
