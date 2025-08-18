const courierApi = require("./courier.service");
const trackingRepo = require("../repositories/tracking.repo");

exports.handleCreate = async (data) => {
    console.log("🚚 Creating shipment with:", data);

    try {
        // Step 1: Extract orderId from your OMS payload
        const orderId = data.order_refernce_code;
        if (!orderId) throw new Error("❌ orderId missing in payload");

        // Step 2: Call courier API
        const courierResponse = await courierApi.createShipment(data);

        // Step 3: Extract CN (courier gives back cn)
        const cn = courierResponse.cn;
        if (!cn) throw new Error("❌ CN missing in courier response");

        // Step 4: Save orderId + CN in DB
        await trackingRepo.createTracking(orderId, cn);

        console.log("✅ Shipment created:", { orderId, cn });
        return { orderId, cn };

    } catch (error) {
        console.error("❌ Error in handleCreate:", error.message);
        throw error;
    }
};




exports.handleCancel = async (data) => {
    try {
        const response = await courierApi.cancelShipment(data.orderId);
        await trackingRepo.updateTrackingStatus(data.orderId, "Cancelled");
        console.log("❌ Shipment cancelled:", response);
    } catch (error) {
        console.error("❌ Error in handleCancel:", error.message);
        throw error;
    }
};

exports.handleTrack = async (data) => {
    try {
        const trackingResponse = await courierApi.getTracking(data.orderId);
        console.log("📍 Tracking API response:", trackingResponse);
        return trackingResponse;
    } catch (error) {
        console.error("❌ Error in handleTrack:", error.message);
        throw error;
    }
};

// jobHandler.js
exports.handleStatus = async (data) => {
    try {
        const { orderId } = data;

        // 🔍 Find CN from DB
        const record = await trackingRepo.getTrackingByOrderId(orderId);
        if (!record || !record.trackingId) {
            console.error(`❌ No trackingId found in DB for orderId: ${orderId}`);
            return { error: "No tracking found" };
        }

        const trackingId = record.trackingId;

        // 📡 Call courier API with CN
        const status = await courierApi.getStatus(trackingId);

        console.log("📊 Status response:", status);
        return status;
    } catch (error) {
        console.error("❌ Error in handleStatus:", error.message);
        throw error;
    }
};
