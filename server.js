const express = require('express');
const app = express();
require("dotenv").config();
require('./db'); // MongoDB connection

// Routes
const bookingRoutes = require('./routes/booking.routes');

// RabbitMQ single class
const rabbitService = require('./service/rabbitMq/rabbitMQ.service');

app.use(express.json());
app.use('/api/bookings', bookingRoutes);


const PORT = process.env.PORT || 3000;

(async () => {

    try {
        // 1️⃣ Connect to RabbitMQ (global)
        await rabbitService.connect();

        // 2️⃣ Start consumers for each job type
        await rabbitService.consume("booking_exchange"); // will handle create
        await rabbitService.consume("cancel_exchange");  // will handle cancel
        await rabbitService.consume("track_exchange");   // will handle track
        await rabbitService.consume("status_exchange");  // will handle status

        // 3️⃣ Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
})();
