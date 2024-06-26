module.exports = {
    InitRes: function (res, code, data) {
        if (code.toString().startsWith('2')) {
            res.status(code).json({
                success: true,
                data: data,
            });
        } else {
            res.status(code).json({
                success: false,
                message: data,
            });
        }
    },
};
