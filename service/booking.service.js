const { mapToCourierPayload } = require("./courier.service");
const rabbitService = require("./rabbitMq/rabbitMQ.service"); // single class

exports.queueBooking = async (bookingData) => {
    const payload = mapToCourierPayload(bookingData);
    await rabbitService.publish("booking_exchange", { jobType: "create", data: payload });
};

exports.queueCancel = async (cancelData) => {
    if (!cancelData.orderId) throw new Error("Order ID is required");
    await rabbitService.publish("cancel_exchange", { jobType: "cancel", data: cancelData });
};

exports.queueTracking = async (trackData) => {
    if (!trackData.orderId) throw new Error("Order ID is required");
    await rabbitService.publish("track_exchange", { jobType: "track", data: trackData });
};

exports.queueStatus = async (statusData) => {
    if (!statusData.orderId) throw new Error("Order ID is required");
    await rabbitService.publish("status_exchange", { jobType: "status", data: statusData });
};
