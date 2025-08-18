const axios = require("axios");
const { createTracking } = require("../repositories/tracking.repo");
const  db = require("../repositories/tracking.repo");

function mapToCourierPayload(payload) {
    const order = Array.isArray(payload) ? payload[0] : payload;

    // Shipper details → take from order.location instead of hardcoding
    const shipper = {
        shipper_name: order.location?.name || order.brand?.name || "Default Shipper",
        shipper_email: order.location?.email || "noreply@example.com",
        shipper_contact: order.location?.phone || "0000000000",
        shipper_address: order.location?.address || "N/A",
        shipper_city: order.originCity ? order.originCity.substring(0, 3).toUpperCase() : "KHI",
    };

    const shipping = order.Customer?.shipping || {};

    const courierRemarksObj = (order.ordersBrandDetails || []).find(
        (item) => item.attribute === "courier_remarks"
    );
    const customer_comment = courierRemarksObj ? courierRemarksObj.value : "";

    // Sanitize helper
    const sanitize = (str, fallback = "NA") =>
        str ? str.toString().replace(/[^\w\s\-\/.,]/g, "").trim() : fallback;

    // ✅ FIXED: Map products properly
    const products_detail = (order.Products || []).map((product) => {
        let weight = "0.1"; // default
        if (product.properties && Array.isArray(product.properties)) {
            const weightProp = product.properties.find(p => p.name === "weight_per_item");
            if (weightProp && weightProp.value) {
                weight = weightProp.value.toString();
            }
        }

        return {
            product_code: sanitize(product.sku, "NA"),
            product_name: sanitize(product.name, "Product"),
            product_price: product.price != null ? product.price.toString() : "0",
            product_weight: weight,
            product_quantity: product.quantity != null ? product.quantity.toString() : "1",
            product_variations: "",
            sku_code: sanitize(product.sku, "NA"),
        };
    });

    // ✅ Calculate order weight
    let total_order_weight = 0;
    products_detail.forEach((p) => {
        total_order_weight += parseFloat(p.product_weight || "0") * parseInt(p.product_quantity || "1");
    });

    // City code mapping
    const cityCodeMap = {
        Karachi: "KHI",
        Lahore: "LHE",
        Islamabad: "ISB",
        Rawalpindi: "RWP",
        Faisalabad: "FSD",
        Multan: "MLT",
        Quetta: "UET",
        Peshawar: "PEW",
        Sialkot: "SKT",
    };

    const rawCity = (shipping.city || "").trim();
    const customer_city = cityCodeMap[rawCity] || "LHE";

    // Customer country
    let customer_country = "PK";
    if (shipping.country && shipping.country.toUpperCase() !== "PAKISTAN" && shipping.country.toUpperCase() !== "PK") {
        customer_country = shipping.country;
    }

    // ✅ Better customer name
    const customer_name = sanitize(
        `${shipping.firstName || ""} ${shipping.lastName || ""}`.trim() || order.Customer?.name || "Customer",
        "Customer"
    );

    const customer_address = sanitize(shipping.address || "N/A");

    return {
        ...shipper,
        customer_name,
        customer_email: order.Customer?.email || "customer@example.com",
        customer_contact: shipping.phone || order.Customer?.phone || "0000000000",
        customer_address,
        customer_city,
        customer_country,
        customer_comment: customer_comment || "",
        shipping_charges: order.shippingPrice?.toString() || "0",
        payment_type: order.codAmount > 0 ? "COD" : "Prepaid",
        service_code: "BE",
        total_order_amount: order.totalAmount?.toString() || "0",
        total_order_weight: total_order_weight.toString(),
        order_refernce_code: order.orderId || "NA",
        fragile: "N",
        parcel_type: "P",
        insurance_require: "N",
        insurance_value: "0",
        testbit: "Y",
        cn_generate: "Y",
        multi_pickup: "Y",
        products_detail,
    };
}

// Basic Auth config
const axiosAuthConfig = {
    auth: {
        username: process.env.COURIER_API_USERNAME,
        password: process.env.COURIER_API_PASSWORD,
    },
    headers: {
        "Content-Type": "application/json",
    },
};

async function createShipment(order) {
    const response = await axios.post(
        "https://bigazure.com/api/json_v3/shipment/create_shipment.php",
        order,
        axiosAuthConfig
    );

    if (!response.data) throw new Error("Empty response from courier");

    return {
        cn: response.data.cn,
        orderID: response.data.order_refernce_code
    };
}




// Cancel a shipment
async function cancelShipment(trackingId) {
    const payload = { consignment_no: trackingId };

    const response = await axios.post(
        "https://bigazure.com/api/json_v3/cancel/void.php",
        payload,
        axiosAuthConfig
    );
    return response.data;
}

const trackingRepo = require("../repositories/tracking.repo");
// Get tracking info
async function getTracking(orderId) {
    const tracking = await trackingRepo.getTrackingByOrderId(orderId);
    if (!tracking) throw new Error("Tracking not found for orderId: " + orderId);

    const payload = { consignment_no: tracking.trackingId };
    const response = await axios.post(
        "https://bigazure.com/api/json_v3/tracking/get_tracking.php",
        payload,
        axiosAuthConfig
    );
    return response.data;
}

// Get shipment status
async function getStatus(trackingId) {
    const payload = { consignment_no: trackingId };
    const response = await axios.post(
        "https://bigazure.com/api/json_v3/status/get_status.php",
        payload,
        axiosAuthConfig
    );
    return response.data;
}

module.exports = {
    mapToCourierPayload,
    createShipment,
    cancelShipment,
    getTracking,
    getStatus,
};
