module.exports = {
    FORBIDDEN_ERROR: {
        code: 403,
        message: 'You do not have permission to access this resource',
    },
    NOT_FOUND_ERROR: {
        code: 404,
        message: 'The requested resource could not be found',
    },
    INTERNAL_SERVER_ERROR: {
        code: 500,
        message: 'Internal server error',
    },
    INVALID_REQUEST: {
        code: 400,
        message: 'Invalid request',
    },
    UNAUTHORIZED_ERROR: {
        code: 401,
        message: 'Unauthorized access',
    },
    INVALID_TOKEN: {
        code: 401,
        message: 'Invalid token',
    },
    TOKEN_EXPIRED: {
        code: 401,
        message: 'Token expired',
    },
    TOKEN_REQUIRED: {
        code: 401,
        message: 'Token required',
    },
    USER_NOT_FOUND: {
        code: 404,
        message: 'User not found',
    },
    EMAIL_ALREADY_EXISTS: {
        code: 409,
        message: 'Email already exists',
    },
    INVALID_CREDENTIALS: {
        code: 401,
        message: 'Invalid credentials',
    },
    INVALID_VALUE: {
        code: 400,
        message: 'Invalid value',
    },
};
