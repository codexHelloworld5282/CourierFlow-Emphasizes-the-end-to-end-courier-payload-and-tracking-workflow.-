const OrderValidator = require("../models/OrderValidator");

function validateOrderMiddleware(req, res, next) {
    try {
        req.body = OrderValidator.validateOrder(req.body);
        next();
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
}

module.exports = validateOrderMiddleware;

