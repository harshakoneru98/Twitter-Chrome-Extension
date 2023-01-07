require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || '8080',
    PYTHON_PATH: process.env.PYTHON_PATH
};
