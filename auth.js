const jwt = require('jsonwebtoken');
const JWTSECRET = "thisisasecretkeyforjwttokens";

function auth(req, res, next) {
    const token = req.headers.token;
    const decoded_data = jwt.verify(token, JWTSECRET);
    if (decoded_data) {
        req.id = decoded_data.id;
        next();
    } else {
        res.status(403).json({
            message: "User is not signed in !",
        });
    }
};

module.exports = {
    auth,
    JWTSECRET
}