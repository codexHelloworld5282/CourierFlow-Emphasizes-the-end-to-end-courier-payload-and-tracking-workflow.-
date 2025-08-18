const express = require('express');
const router = express.Router();
const validate =require("../service/OrderValidator.middleware") ;
const bookingController = require('../controllers/booking.controller');


// Create booking route
// router.post('/', bookingController.createBooking);
const axios = require("axios");

// Create booking route
// Use the controller method for creating shipment
router.post(
    "/create-shipment",
    validate,                     // ⬅️ runs first
    bookingController.createShipment   // ⬅️ runs only if payload is valid
);
router.post('/create-shipment', bookingController.createShipment);
router.post('/cancel-shipment', bookingController.cancelShipment);
router.post('/track-shipment', bookingController.trackShipment); // or create a new controller file
router.post('/get-status', bookingController.getStatus);
module.exports = router;
