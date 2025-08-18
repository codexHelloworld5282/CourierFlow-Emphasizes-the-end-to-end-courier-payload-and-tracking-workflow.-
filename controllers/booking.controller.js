// controllers/booking.service.js
const bookingService = require("../service/booking.service");

exports.createShipment = async (req, res) => {
    try {
        await bookingService.queueBooking(req.body);
        res.status(200).json({ message: "Booking request queued" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.cancelShipment = async (req, res) => {
    try {
        await bookingService.queueCancel(req.body);
        res.status(200).json({ message: "Cancel request queued" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.trackShipment = async (req, res) => {
    try {
        await bookingService.queueTracking(req.body);
        res.status(200).json({ message: "Tracking request queued" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStatus = async (req, res) => {
    try {
        await bookingService.queueStatus(req.body);
        res.status(200).json({ message: "Status request queued" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
