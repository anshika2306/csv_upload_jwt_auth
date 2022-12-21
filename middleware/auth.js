var jwt = require("jsonwebtoken");
const user = require('../models/User');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.token;
        if (token == null || token == undefined) {
            return res.status(401).send({
                error: "User not found"
            })
        } else {
            var result = jwt.verify(token, 'jwtsecret')
            req.user = user.findOne({
                email: result.email
            })
        }
        next();
    } catch (error) { }
};
