/**
 * GOV.UK Pay Webhook Handler
 *
 * This handler receives webhook notifications from GOV.UK Pay when payment events occur.
 * It uses HMAC SHA-256 signature verification (not bearer tokens) to validate webhook authenticity.
 *
 * Environment Variables Required:
 * - GOV_PAY_WEBHOOK_SIGNING_SECRET: The webhook signing secret from GOV.UK Pay
 *
 * Azure Function Configuration:
 * - HTTP Trigger
 * - POST method only
 * - Route: /api/webhooks/govpay
 */

const crypto = require('crypto');

/**
 * Verify the webhook signature using HMAC SHA-256
 * @param {string} webhookMessageBody - The raw HTTP request body (UTF-8, no BOM)
 * @param {string} webhookSigningSecret - The signing secret from GOV.UK Pay
 * @param {string} paySignatureHeader - The value of the Pay-Signature header
 * @returns {boolean} True if signature is valid, false otherwise
 */
function verifyWebhookSignature(webhookMessageBody, webhookSigningSecret, paySignatureHeader) {
    if (!paySignatureHeader || !webhookSigningSecret || !webhookMessageBody) {
        return false;
    }

    // Generate HMAC SHA-256 hash
    const hmac = crypto.createHmac('sha256', webhookSigningSecret)
        .update(webhookMessageBody, 'utf8')
        .digest('hex');

    // Compare in constant time to prevent timing attacks
    return crypto.timingSafeEqual(
        Buffer.from(hmac, 'utf8'),
        Buffer.from(paySignatureHeader, 'utf8')
    );
}

/**
 * Azure Function HTTP Trigger Handler
 */
module.exports = async function (context, req) {
    context.log('GOV.UK Pay webhook received');

    // Get the signing secret from environment variables
    const webhookSigningSecret = process.env.GOV_PAY_WEBHOOK_SIGNING_SECRET;

    if (!webhookSigningSecret) {
        context.log.error('GOV_PAY_WEBHOOK_SIGNING_SECRET not configured');
        context.res = {
            status: 500,
            body: { error: 'Webhook signing secret not configured' }
        };
        return;
    }

    // Get the Pay-Signature header
    const paySignatureHeader = req.headers['pay-signature'];

    if (!paySignatureHeader) {
        context.log.warn('Missing Pay-Signature header');
        context.res = {
            status: 401,
            body: { error: 'Missing Pay-Signature header' }
        };
        return;
    }

    // Get the raw request body
    // IMPORTANT: Azure Functions must be configured to preserve raw body
    // In function.json, ensure you don't have automatic JSON parsing
    const webhookMessageBody = typeof req.rawBody === 'string'
        ? req.rawBody
        : JSON.stringify(req.body);

    context.log('Verifying webhook signature...');

    // Verify the signature
    const isValid = verifyWebhookSignature(
        webhookMessageBody,
        webhookSigningSecret,
        paySignatureHeader
    );

    if (!isValid) {
        context.log.warn('Invalid webhook signature - request rejected');
        context.res = {
            status: 401,
            body: { error: 'Invalid signature' }
        };
        return;
    }

    context.log('Webhook signature verified successfully');

    // Parse the webhook payload
    let webhookData;
    try {
        webhookData = typeof req.body === 'object' ? req.body : JSON.parse(webhookMessageBody);
    } catch (error) {
        context.log.error('Failed to parse webhook body:', error);
        context.res = {
            status: 400,
            body: { error: 'Invalid JSON payload' }
        };
        return;
    }

    // Log webhook details
    context.log('Webhook details:', {
        webhook_message_id: webhookData.webhook_message_id,
        event_type: webhookData.event_type,
        resource_type: webhookData.resource_type,
        payment_id: webhookData.resource_id
    });

    // Process the webhook based on event type
    try {
        await processWebhookEvent(context, webhookData);

        // Return 200 to acknowledge receipt (prevents retries)
        context.res = {
            status: 200,
            body: {
                message: 'Webhook processed successfully',
                webhook_message_id: webhookData.webhook_message_id
            }
        };
    } catch (error) {
        context.log.error('Error processing webhook:', error);

        // Return 500 so GOV.UK Pay will retry
        context.res = {
            status: 500,
            body: { error: 'Failed to process webhook' }
        };
    }
};

/**
 * Process the webhook event based on event type
 */
async function processWebhookEvent(context, webhookData) {
    const { event_type, resource, resource_id } = webhookData;

    context.log(`Processing event: ${event_type} for payment: ${resource_id}`);

    switch (event_type) {
        case 'card_payment_succeeded':
            await handlePaymentSucceeded(context, resource);
            break;

        case 'card_payment_captured':
            await handlePaymentCaptured(context, resource);
            break;

        case 'card_payment_settled':
            await handlePaymentSettled(context, resource);
            break;

        case 'card_payment_refunded':
            await handlePaymentRefunded(context, resource);
            break;

        default:
            context.log.warn(`Unknown event type: ${event_type}`);
    }
}

/**
 * Handle card_payment_succeeded event
 * Payment provider has authorised the payment
 */
async function handlePaymentSucceeded(context, payment) {
    context.log('Payment succeeded:', {
        payment_id: payment.payment_id,
        amount: payment.amount,
        reference: payment.reference,
        state: payment.state.status
    });

    // TODO: Update your database
    // - Mark payment as authorized
    // - Do NOT fulfill the order yet (wait for captured or settled)
}

/**
 * Handle card_payment_captured event
 * GOV.UK Pay has taken the payment from user's bank account
 * THIS IS THE KEY EVENT - You should fulfill the service at this point
 */
async function handlePaymentCaptured(context, payment) {
    context.log('Payment captured:', {
        payment_id: payment.payment_id,
        amount: payment.amount,
        reference: payment.reference,
        email: payment.email,
        card_details: payment.card_details
    });

    // TODO: Update your database and fulfill the service
    // For garden waste subscription:
    // 1. Update payment record with status = 'success'
    // 2. Create/activate garden waste subscription
    // 3. Send confirmation email to customer
    // 4. Schedule brown bin delivery if needed

    // Example database update (pseudo-code):
    /*
    await database.payments.update({
        paymentId: payment.payment_id,
        status: 'success',
        capturedAt: new Date(),
        amount: payment.amount,
        cardBrand: payment.card_details.card_brand,
        cardLastFour: payment.card_details.last_digits_card_number,
        email: payment.email
    });

    await database.gardenWasteSubscriptions.create({
        paymentId: payment.payment_id,
        email: payment.email,
        subscribedAt: new Date(),
        expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        status: 'active'
    });

    await sendConfirmationEmail(payment.email, payment);
    */
}

/**
 * Handle card_payment_settled event
 * Payment provider has sent the payment to your bank account
 */
async function handlePaymentSettled(context, payment) {
    context.log('Payment settled:', {
        payment_id: payment.payment_id,
        amount: payment.amount
    });

    // TODO: Update accounting records
    // - Mark payment as settled in financial records
    // - Update reconciliation data
}

/**
 * Handle card_payment_refunded event
 * Refund has been sent to user's bank account
 */
async function handlePaymentRefunded(context, payment) {
    context.log('Payment refunded:', {
        payment_id: payment.payment_id,
        refund_summary: payment.refund_summary
    });

    // TODO: Handle refund
    // - Update payment status
    // - Cancel service if fully refunded
    // - Send refund confirmation email
}
