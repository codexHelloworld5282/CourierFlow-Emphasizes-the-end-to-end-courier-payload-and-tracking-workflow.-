# 🚚📦 TrackAndShip

[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0-green)](https://www.mongodb.com/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.11-orange)](https://www.rabbitmq.com/)

**TrackAndShip** is a modular Node.js application for handling courier orders. It validates API payloads, maps them to courier formats, processes them via RabbitMQ, stores tracking info in MongoDB, and provides order tracking and cancellation. Built-in Basic Auth secures your endpoints.

---

## 🌟 Features

- ✅ Payload validation using **Joi**  
- ✅ Mapping to **Courier API format**  
- ✅ Publish/Consume messages via **RabbitMQ** queues  
- ✅ Store **Order ID** and **Courier CN** in MongoDB  
- ✅ Track and cancel orders through the courier API  
- ✅ Modular **job handlers** for clean architecture  
- ✅ **Basic Auth** for secure API access  

---

## 🏗 Architecture / Flow

1. Client sends an order payload via **Postman**  
2. **Joi Validator** checks payload for correctness  
3. Payload mapped to **Courier API format**  
4. **RabbitMQ** handles messaging:  
   - Publisher sends payload to queue  
   - Consumer fetches payload and calls courier API  
5. Courier response returns **CN (Courier Number)**  
6. CN + Order ID stored in **MongoDB**  
7. **Job handlers** manage tracking and cancellation requests  

---

## 📁 Project Structure

TrackAndShip/
│
├── src/
│ ├── controllers/ # API controllers
│ ├── routes/ # Route definitions
│ ├── services/ # RabbitMQ connections, publisher, consumer
│ ├── jobHandlers/ # Tracking / cancellation logic
│ ├── validators/ # Joi schemas
│ └── models/ # MongoDB models
│
├── app.js # Express setup
├── server.js # Entry point
├── package.json
└── README.md

yaml
Copy
Edit

---

## ⚡ Installation

1. Clone the repo:

git clone https://github.com/<your-username>/TrackAndShip.git
cd TrackAndShip
2. Install dependencies:


npm install
3. Create a .env file with:

MONGO_URI=<your-mongodb-uri>
RABBITMQ_URI=<your-rabbitmq-uri>
BASIC_AUTH_USER=<username>
BASIC_AUTH_PASS=<password>
COURIER_API_URL=<courier-api-endpoint>
PORT=3000
4. 🚀 Run the Application

npm start
Default: http://localhost:3000

5. Test endpoints with Postman

#📬 API Usage Examples
1. Create Order

POST /api/orders
Authorization: Basic <base64(username:password)>
Content-Type: application/json

{
  "orderId": "12345",
  "date": "2025-08-18",
  "dateTime": "2025-08-18T12:00:00Z",
  "paymentMethod": "Cash",
  "orderRetailerNumber": "RET-9876",
  "totalAmountPKR": 1500
}
Response:

json
Copy
Edit
{
  "orderId": "12345",
  "cn": "5036553858",
  "status": "success"
}
2. Track Order
http
Copy
Edit
GET /api/orders/track/:orderId
Authorization: Basic <base64(username:password)>
Response:
{
  "orderId": "12345",
  "cn": "5036553858",
  "status": "In Transit"
}
#🤝 Contributing
Fork the repository

Create a branch: git checkout -b feature-name

Commit changes: git commit -m "Add feature"

Push branch: git push origin feature-name

Open a pull request
