module.exports = {
    InitRes: function (res, code, data) {
        if (code === 200) {
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
