# GOV.UK Pay Webhook Setup Guide

## Overview

GOV.UK Pay webhooks use **HMAC SHA-256 signature verification**, not bearer tokens. Each webhook message includes a `Pay-Signature` header that must be validated against your webhook signing secret.

## Environment Variables

Set this in your Azure Function App configuration:

```
GOV_PAY_WEBHOOK_SIGNING_SECRET=your_signing_secret_from_govpay
```

**Where to find it:**
1. Log in to GOV.UK Pay admin portal
2. Go to Settings → Webhooks
3. Find your webhook signing secret

## Azure Function Configuration

### 1. Function Structure

```
webhooks/
├── govpay/
│   ├── function.json
│   └── index.js
```

### 2. function.json Configuration

**CRITICAL:** Set `authLevel` to `anonymous` - GOV.UK Pay uses signature verification, not function keys.

```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"],
      "route": "webhooks/govpay"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

### 3. host.json - Preserve Raw Body

To verify signatures, you need access to the raw request body. Configure this in `host.json`:

```json
{
  "version": "2.0",
  "extensions": {
    "http": {
      "routePrefix": "api",
      "maxOutstandingRequests": 200,
      "maxConcurrentRequests": 100,
      "dynamicThrottlesEnabled": true
    }
  },
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "maxTelemetryItemsPerSecond": 20
      }
    }
  }
}
```

## GOV.UK Pay Webhook Configuration

### 1. Create Webhook in GOV.UK Pay Admin

1. Log in to [GOV.UK Pay admin portal](https://selfservice.payments.service.gov.uk/)
2. Navigate to: **Settings → API keys → Webhooks**
3. Click **Create a webhook**
4. Configure:
   - **Callback URL**: `https://your-api.azurewebsites.net/api/webhooks/govpay`
   - **Description**: "Payment notifications for Gloucester City Council"
   - **Events to subscribe to**:
     - ✅ `card_payment_captured` (REQUIRED - triggers service fulfillment)
     - ✅ `card_payment_succeeded` (optional - for early notification)
     - ✅ `card_payment_settled` (optional - for accounting)
     - ✅ `card_payment_refunded` (optional - for refund handling)

5. Save and note the **Webhook signing secret**

### 2. Test Your Webhook

GOV.UK Pay provides a test webhook feature:
1. Go to your webhook in the admin portal
2. Click "Send test webhook"
3. Check Azure Function logs to verify receipt

## Webhook Event Types

| Event Type | When It Fires | Action Required |
|------------|---------------|-----------------|
| `card_payment_succeeded` | Payment provider authorised payment | Log only, don't fulfill yet |
| `card_payment_captured` | **GOV.UK Pay captured payment** | **✅ FULFILL SERVICE NOW** |
| `card_payment_settled` | Payment sent to your bank | Update accounting |
| `card_payment_refunded` | Refund sent to customer | Cancel service, notify customer |

### Key Event: card_payment_captured

**This is the critical event** - when you receive this:
1. ✅ Update payment status to 'success'
2. ✅ Activate the garden waste subscription
3. ✅ Send confirmation email
4. ✅ Schedule brown bin delivery
5. ✅ Update any relevant systems

## Security Verification Process

```javascript
// 1. Extract components
const paySignatureHeader = req.headers['pay-signature'];
const webhookMessageBody = req.rawBody; // Raw UTF-8 string
const webhookSigningSecret = process.env.GOV_PAY_WEBHOOK_SIGNING_SECRET;

// 2. Generate HMAC
const hmac = crypto.createHmac('sha256', webhookSigningSecret)
    .update(webhookMessageBody, 'utf8')
    .digest('hex');

// 3. Compare (constant-time comparison)
const isValid = crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(paySignatureHeader)
);

// 4. Reject if invalid
if (!isValid) {
    return { status: 401, body: { error: 'Invalid signature' } };
}
```

## Webhook Message Structure

```json
{
  "webhook_message_id": "123abc",
  "api_version": 1,
  "created_date": "2019-07-11T10:36:26.988Z",
  "resource_id": "hu20sqlact5260q2nanm0q8u93",
  "resource_type": "payment",
  "event_type": "card_payment_captured",
  "resource": {
    "amount": 6000,
    "description": "Garden waste collection subscription",
    "reference": "pay_81be8d0b",
    "email": "customer@example.com",
    "state": {
      "status": "success",
      "finished": true
    },
    "payment_id": "hu20sqlact5260q2nanm0q8u93",
    "payment_provider": "stripe",
    "created_date": "2021-10-19T10:05:45.454Z",
    "card_details": {
      "last_digits_card_number": "1234",
      "first_digits_card_number": "123456",
      "cardholder_name": "John Smith",
      "expiry_date": "04/24",
      "card_brand": "Visa",
      "card_type": "debit"
    },
    "return_url": "https://gloucester.gov.uk/bins/garden-waste.html?payment=complete"
  }
}
```

## Response Requirements

### Success Response (200 OK)

Return this to prevent retries:

```javascript
context.res = {
    status: 200,
    body: {
        message: 'Webhook processed successfully',
        webhook_message_id: webhookData.webhook_message_id
    }
};
```

### Error Responses

- **401 Unauthorized**: Invalid signature (GOV.UK Pay will NOT retry)
- **400 Bad Request**: Invalid payload (GOV.UK Pay will NOT retry)
- **500 Server Error**: Processing failed (GOV.UK Pay WILL retry)

## Retry Mechanism

GOV.UK Pay sends each webhook **at least once**:
- If you return **2xx**: No retry
- If you return **5xx** or timeout: Retries with exponential backoff
- Make your handler **idempotent** (safe to process same event multiple times)

## Implementation Checklist

- [ ] Set `GOV_PAY_WEBHOOK_SIGNING_SECRET` environment variable
- [ ] Deploy webhook handler to Azure Functions
- [ ] Configure `authLevel: "anonymous"` in function.json
- [ ] Ensure raw body is preserved for signature verification
- [ ] Create webhook in GOV.UK Pay admin portal
- [ ] Configure callback URL: `https://your-api.azurewebsites.net/api/webhooks/govpay`
- [ ] Subscribe to `card_payment_captured` event (minimum)
- [ ] Test webhook using GOV.UK Pay's test feature
- [ ] Verify signature validation works (check logs)
- [ ] Implement payment status updates in database
- [ ] Implement service fulfillment (garden waste subscription)
- [ ] Add idempotency checks to prevent duplicate processing
- [ ] Set up monitoring/alerting for webhook failures

## Database Updates on card_payment_captured

```javascript
// Pseudo-code for what to do when payment is captured
async function handlePaymentCaptured(payment) {
    // 1. Update payment record
    await db.payments.update({
        where: { paymentId: payment.payment_id },
        data: {
            status: 'success',
            capturedAt: new Date(),
            cardBrand: payment.card_details.card_brand,
            cardLastFour: payment.card_details.last_digits_card_number,
            cardholderName: payment.card_details.cardholder_name,
            email: payment.email
        }
    });

    // 2. Create garden waste subscription
    const subscription = await db.gardenWasteSubscriptions.create({
        data: {
            paymentId: payment.payment_id,
            email: payment.email,
            amount: payment.amount,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 year
            status: 'active',
            addressId: payment.metadata?.addressId // If stored in metadata
        }
    });

    // 3. Send confirmation email
    await emailService.send({
        to: payment.email,
        template: 'garden-waste-confirmation',
        data: {
            reference: payment.reference,
            amount: `£${(payment.amount / 100).toFixed(2)}`,
            subscriptionId: subscription.id,
            startDate: subscription.startDate,
            endDate: subscription.endDate
        }
    });

    // 4. Log success
    logger.info('Garden waste subscription activated', {
        paymentId: payment.payment_id,
        subscriptionId: subscription.id,
        email: payment.email
    });
}
```

## Troubleshooting

### "Invalid signature" errors

1. Check environment variable is set correctly
2. Verify you're using the raw request body (not parsed JSON)
3. Ensure no BOM (byte order mark) in body
4. Check signing secret matches GOV.UK Pay admin portal

### Webhook not receiving messages

1. Verify callback URL is correct and accessible
2. Check Azure Function is not requiring authentication
3. Look for 401/403 errors in GOV.UK Pay webhook logs
4. Test with "Send test webhook" in GOV.UK Pay admin

### Duplicate processing

1. Store `webhook_message_id` in database
2. Check if already processed before handling
3. Use database transactions for atomicity

## References

- [GOV.UK Pay Webhooks Documentation](https://docs.payments.service.gov.uk/webhooks/)
- [GOV.UK Pay API Reference](https://docs.payments.service.gov.uk/api_reference/)
- [Azure Functions HTTP Trigger](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook-trigger)
