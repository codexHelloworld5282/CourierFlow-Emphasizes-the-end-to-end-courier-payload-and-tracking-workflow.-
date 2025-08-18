// rabbitMq/rabbitService.js
const amqp = require("amqplib");
const jobHandlers = require("../jobHandler");

class RabbitService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queues = ["get-status", "track-shipment", "cancel-shipment", "create-shipment"];
    }

    // Connect to RabbitMQ (global connection)
    async connect() {
        try {
            if (this.channel) return this.channel; // Reuse existing connection

            this.connection = await amqp.connect(process.env.RABBITMQ_URL);
            this.channel = await this.connection.createChannel();
            console.log("✅ RabbitMQ connected");

            // Setup queues immediately after connection
            await this.setupQueues();

            // Handle close events
            this.connection.on("close", () => {
                console.error("❌ RabbitMQ connection closed");
                process.exit(1);
            });

            this.connection.on("error", (err) => {
                console.error("❌ RabbitMQ connection error", err);
                process.exit(1);
            });

            return this.channel;
        } catch (err) {
            console.error("❌ RabbitMQ connection failed", err);
            process.exit(1);
        }
    }

    // Setup all required queues
    async setupQueues() {
        if (!this.channel) return;
        for (const q of this.queues) {
            await this.channel.assertQueue(q, { durable: true });
            console.log(`📦 Queue ready: ${q}`);
        }
    }

    // Publish message to queue
    async publish(queue, message) {
        if (!this.channel) await this.connect();
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
        console.log(`📤 Published message to ${queue}:`, message);
    }

    // Consume messages from queue
    async consume(queue) {
        if (!this.channel) await this.connect();

        this.channel.consume(
            queue,
            async (msg) => {
                if (!msg) return;
                const job = JSON.parse(msg.content.toString());
                console.log(`📥 Received job from ${queue}:`, job);

                try {
                    switch (job.jobType) {
                        case "create":
                            await jobHandlers.handleCreate(job.data);
                            break;
                        case "cancel":
                            await jobHandlers.handleCancel(job.data);
                            break;
                        case "track":
                            await jobHandlers.handleTrack(job.data);
                            break;
                        case "status":
                            await jobHandlers.handleStatus(job.data);
                            break;
                        default:
                            console.log("❓ Unknown job type:", job.jobType);
                    }
                    this.channel.ack(msg);
                } catch (err) {
                    console.error(`❌ Error processing job from ${queue}:`, err);
                    this.channel.nack(msg, false, false); // Dead-letter
                }
            },
            { noAck: false }
        );
    }
}

module.exports = new RabbitService();
