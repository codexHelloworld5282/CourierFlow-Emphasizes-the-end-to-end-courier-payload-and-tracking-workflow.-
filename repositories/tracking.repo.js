// repositories/tracking.repo.js
const Tracking = require("../models/tracking");

exports.createTracking = async (orderId, trackingId) => {
    return await Tracking.create({ orderId, trackingId });
};

exports.updateTrackingStatus = async (orderId, status) => {
    return await Tracking.updateOne({ orderId }, { status });
};


exports.getTrackingByOrderId = async (orderId) => {
    try {
        const tracking = await Tracking.findOne({ orderId: orderId });
        console.log("🔍 DB Query - Looking for orderId:", orderId);
        console.log("🔍 DB Result:", tracking);
        return tracking;
    } catch (error) {
        console.error("❌ Database error:", error);
        throw error;
    }
};
