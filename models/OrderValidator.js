const Joi = require("joi");

class OrderValidator {
    // Schema for a single order
    static orderSchema = Joi.object({
        date: Joi.string().required(),
        dateTime: Joi.string().isoDate().required(),
        paymentMethod: Joi.string().required(),
        orderId: Joi.string().required(),
        orderRetailerNumber: Joi.string().required(),
        discount: Joi.number().default(0),
        totalAmountPKR: Joi.number().required(),
        shippingMethod: Joi.string().required(),
        conversionRate: Joi.number().required(),
        customerRetailerNumber: Joi.string().required(),
        couponCode: Joi.string().allow(""),
        discountPKR: Joi.number().default(0),
        totalAmount: Joi.number().required(),
        shippingPrice: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
        locationId: Joi.string().required(),
        shippingPricePKR: Joi.number().required(),
        currency: Joi.string().required(),
        currencySign: Joi.string().required(),
        region: Joi.string().required(),
        locationCode: Joi.string().required(),
        status: Joi.string().required(),
        taxAmount: Joi.number().default(0),
        brandId: Joi.string().required(),
        brandShortKey: Joi.string().required(),
        originCity: Joi.string().required(),
        codAmount: Joi.number().default(0),

        // Products
        Products: Joi.array().items(
            Joi.object({
                quantity: Joi.number().required(),
                sku: Joi.string().required(),
                name: Joi.string().required(),
                itemTotalPKR: Joi.number().required(),
                taxAmount: Joi.number().default(0),
                itemTotal: Joi.number().required(),
                originalPrice: Joi.number().required(),
                price: Joi.number().required(),
                specialPrice: Joi.number().required(),
                properties: Joi.array().items(
                    Joi.object({
                        name: Joi.string().required(),
                        attribute: Joi.string().optional(),
                        value: Joi.alternatives().try(Joi.string(), Joi.number()).allow(""),
                    })
                ).optional(),
                productPrices: Joi.array().items(
                    Joi.object({
                        price: Joi.string().required(),
                        currency: Joi.string().required(),
                        specialPrice: Joi.string().required()
                    })
                ).optional()
            })
        ),

        // Removed Products
        removedProducts: Joi.array().items(
            Joi.object({
                quantity: Joi.number().required(),
                sku: Joi.string().required(),
                name: Joi.string().required(),
                itemTotalPKR: Joi.number().required(),
                taxAmount: Joi.number().default(0),
                itemTotal: Joi.number().required(),
                originalPrice: Joi.number().required(),
                price: Joi.number().required(),
                specialPrice: Joi.number().required(),
                properties: Joi.array().items(
                    Joi.object({
                        name: Joi.string().required(),
                        value: Joi.alternatives().try(Joi.string(), Joi.number()).allow(""),
                    })
                )
            })
        ).optional(),

        // Booking
        booking: Joi.object({
            trackingNumber: Joi.string().required(),
            courierCode: Joi.string().required(),
            activeCourierTrackingsStatus: Joi.string().optional(),
            brandCourierName: Joi.string().optional(),
            trackingUrl: Joi.string().uri().optional(),
        }).optional(),

        // Customer
        Customer: Joi.object({
            phone: Joi.string().required(),
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            shipping: Joi.object({
                country: Joi.string().required(),
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                address: Joi.string().required(),
                city: Joi.string().required(),
                state: Joi.string().allow(""),
                postalCode: Joi.string().required(),
                phone: Joi.string().required(),
                email: Joi.string().email().required()
            }).required(),
            billing: Joi.object({
                country: Joi.string().required(),
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                address: Joi.string().required(),
                city: Joi.string().required(),
                state: Joi.string().allow(""),
                postalCode: Joi.string().required(),
                phone: Joi.string().required(),
                email: Joi.string().email().required()
            }).required()
        }),

        // Order History
        orderHistory: Joi.array().items(
            Joi.object({
                updateTime: Joi.string().isoDate().required(),
                status: Joi.string().required()
            })
        ).optional(),

        // Orders brand details
        ordersBrandDetails: Joi.array().items(
            Joi.object({
                attribute: Joi.string().required(),
                value: Joi.string().required()
            })
        ).optional(),

        // Other details
        channelOrderId: Joi.string().optional(),
        parentOrderId: Joi.string().allow(""),
        isRMAOrder: Joi.boolean().default(false),
        tags: Joi.array().items(Joi.string()).optional(),
        deviceName: Joi.string().optional(),
        saleChannelRefference: Joi.string().optional(),
        deliveryDate: Joi.string().allow(""),
        updatedDate: Joi.string().required(),
        updatedDateUtc: Joi.string().optional(),

        // Location
        location: Joi.object({
            brand_id: Joi.number().optional(),
            city: Joi.string().required(),
            email: Joi.string().email().optional(),
            address: Joi.string().required(),
            name: Joi.string().required(),
            phone: Joi.string().required()
        }).required(),

        // Brand
        brand: Joi.object({
            brandChannelId: Joi.string().required(),
            taxRate: Joi.number().required(),
            brandChannelName: Joi.string().required(),
            zone: Joi.string().optional(),
            name: Joi.string().required(),
            brandShortKey: Joi.string().required()
        }).required(),
    });

    // ✅ Updated to support array of orders
    static ordersSchema = Joi.array().items(this.orderSchema);

    static validateOrder(payload) {
        const { error, value } = this.ordersSchema.validate(payload, {
            abortEarly: false,
            allowUnknown: true
        });

        if (error) {
            throw new Error(
                `Validation error: ${error.details.map(d => d.message).join(", ")}`
            );
        }
        else{
            console.log(" 🚀 Validating order successfully done.");
        }

        return value;
    }
}

module.exports = OrderValidator;
