# Bin Collection Subscriptions API - Redesign Recommendation

**Date**: 2026-01-04
**Status**: 🚨 Critical - API redesign required before frontend implementation
**Priority**: High

---

## Executive Summary

The current bin collection subscriptions API design allows **only one subscription per address**, which is fundamentally incompatible with real-world use cases where multiple people need reminders for the same property.

**Impact**: Without changes, the service will:
- ❌ Block flatmates/family members from subscribing individually
- ❌ Allow users to accidentally overwrite others' subscriptions
- ❌ Create privacy issues (anyone can see/modify any address's subscription)
- ❌ Generate support complaints and user frustration

**Recommendation**: Redesign the API to support multiple subscriptions per address with privacy-preserving lookups.

---

## Problem Statement

### Real-World Scenarios

The current API design fails in these common scenarios:

#### Scenario 1: House in Multiple Occupation (HMO)
- **Situation**: 4 tenants share a house
- **Current behavior**:
  1. Tenant A subscribes with alice@example.com
  2. Tenant B tries to subscribe with bob@example.com
  3. ❌ API returns **409 Conflict** - subscription already exists
  4. Tenant B cannot subscribe

#### Scenario 2: Family Household
- **Situation**: Parents and adult children at same address
- **Current behavior**:
  1. Parent subscribes with parent@example.com
  2. Adult child looks up bins, sees subscription exists
  3. Child updates email to child@example.com (thinking they're adding themselves)
  4. ❌ Parent stops receiving reminders without notification

#### Scenario 3: Elderly Care Support
- **Situation**: Adult child helps elderly parent with bin reminders
- **Current behavior**:
  1. Parent subscribes with parent@example.com
  2. Adult child (living elsewhere) wants reminders to help parent
  3. ❌ Cannot subscribe - only one subscription per address

#### Scenario 4: Landlord + Tenants
- **Situation**: Landlord wants reminders for rental property maintenance
- **Current behavior**:
  1. Tenant subscribes
  2. Landlord cannot also subscribe
  3. When tenant moves out and cancels, landlord loses service

#### Scenario 5: Privacy Violation
- **Situation**: Curious neighbor or malicious user
- **Current behavior**:
  1. User looks up any address
  2. `GET /api/subscriptions/bins?addressId=XYZ` returns subscription with:
     - Email address
     - Mobile number
     - Preferences
  3. ❌ Privacy violation - anyone can see anyone's contact details

---

## Current API Issues

### Issue 1: Single Subscription Per Address

**Current constraint** (implied by 409 responses):
```
UNIQUE(addressId)
```

**Problem**: Only one subscription allowed per physical address.

**Why it's broken**:
- Multiple people live at the same address
- Each person has their own email/mobile
- They want individual control over their subscriptions

---

### Issue 2: Insecure Lookup

**Current endpoint**:
```http
GET /api/subscriptions/bins?addressId={addressId}
```

**Problem**: Anyone who knows an addressId can:
- See if it's subscribed
- View the subscriber's email and mobile number
- Update or cancel the subscription (if using the same endpoint)

**Privacy risk**: Address IDs are not secret - they're in URLs, browser history, etc.

---

### Issue 3: Ambiguous Ownership

**Current endpoints**:
```http
POST   /api/subscriptions/bins        # Who owns this?
GET    /api/subscriptions/bins?addressId=X  # Returns anyone's subscription
DELETE /api/subscriptions/bins        # Who can delete?
```

**Problem**: No concept of "my subscription" vs "someone else's subscription"

---

## Recommended API Changes

### 1. Data Model Changes

#### Current (Broken)
```sql
CREATE TABLE subscriptions (
  id VARCHAR(47) PRIMARY KEY,
  addressId VARCHAR(47) UNIQUE,  -- ❌ PROBLEM: Only one per address
  email VARCHAR(255),
  mobile VARCHAR(20),
  -- other fields...
);
```

#### Recommended (Fixed)
```sql
CREATE TABLE subscriptions (
  id VARCHAR(47) PRIMARY KEY,
  addressId VARCHAR(47) NOT NULL,  -- ✅ Allow multiple per address
  email VARCHAR(255),
  mobile VARCHAR(20),
  emailNotifications BOOLEAN DEFAULT true,
  smsNotifications BOOLEAN DEFAULT true,
  reminderHours INT DEFAULT 13,
  status VARCHAR(20) DEFAULT 'active',
  createdAt DATETIME,
  updatedAt DATETIME,

  -- Prevent same person subscribing twice
  UNIQUE(addressId, email),   -- ✅ Alice can't subscribe twice with same email
  UNIQUE(addressId, mobile),  -- ✅ Alice can't subscribe twice with same mobile

  -- Indexes for lookups
  INDEX idx_addressId (addressId),
  INDEX idx_addressId_email (addressId, email),
  INDEX idx_addressId_mobile (addressId, mobile)
);
```

**Key changes**:
- ✅ Multiple subscriptions per addressId allowed
- ✅ Same person can't subscribe twice (prevents duplicates)
- ✅ Efficient lookups by address + contact method

---

### 2. Endpoint Changes

#### A. GET - Retrieve Subscription (Privacy-Preserving)

**❌ CURRENT (Insecure)**:
```http
GET /api/subscriptions/bins?addressId={addressId}
```
Returns: The subscription for that address (exposes other people's data)

**✅ RECOMMENDED (Secure)**:
```http
GET /api/subscriptions/bins?addressId={addressId}&email={email}
```
**OR**
```http
GET /api/subscriptions/bins?addressId={addressId}&mobile={mobile}
```

**Request**:
```http
GET /api/subscriptions/bins?addressId=addr_v1_ABC123&email=john@example.com
x-api-token: {token}
```

**Response - Found (200)**:
```json
{
  "success": true,
  "subscription": {
    "id": "sub_v1_XYZ789",
    "addressId": "addr_v1_ABC123",
    "uprn": "100120012345",
    "email": "john@example.com",
    "mobile": "+447700123456",
    "emailNotifications": true,
    "smsNotifications": true,
    "reminderHours": 13,
    "status": "active",
    "createdAt": "2026-01-03T10:30:00.000Z",
    "updatedAt": "2026-01-03T10:30:00.000Z"
  }
}
```

**Response - Not Found (200)**:
```json
{
  "success": true,
  "subscription": null
}
```

**Response - Missing Parameters (400)**:
```json
{
  "success": false,
  "error": "Missing required parameters",
  "details": "Must provide addressId and either email or mobile"
}
```

**Why this is better**:
- ✅ Users can only retrieve THEIR subscription
- ✅ Privacy protected - can't see others' data
- ✅ Clear ownership model

---

#### B. POST - Create Subscription (Multi-User Safe)

**❌ CURRENT (Broken)**:
```http
POST /api/subscriptions/bins
```
Returns: 409 Conflict if addressId already has a subscription

**✅ RECOMMENDED (Fixed)**:
```http
POST /api/subscriptions/bins
```

**Request**:
```json
{
  "addressId": "addr_v1_ABC123",
  "email": "john@example.com",
  "mobile": "+447700123456",
  "emailNotifications": true,
  "smsNotifications": true,
  "reminderHours": 13
}
```

**Validation Rules**:
1. ✅ `addressId` required and valid (checksum validation)
2. ✅ At least one of `email` or `mobile` required
3. ✅ Email format validation if provided
4. ✅ UK mobile format validation if provided
5. ✅ Check for duplicate: `(addressId, email)` must be unique
6. ✅ Check for duplicate: `(addressId, mobile)` must be unique

**Response - Created (201)**:
```json
{
  "success": true,
  "message": "You've been subscribed to bin collection reminders",
  "subscription": {
    "id": "sub_v1_XYZ789",
    "addressId": "addr_v1_ABC123",
    "email": "john@example.com",
    "mobile": "+447700123456",
    "emailNotifications": true,
    "smsNotifications": true,
    "reminderHours": 13,
    "status": "active",
    "createdAt": "2026-01-03T10:30:00.000Z"
  }
}
```

**Response - Duplicate Email (409)**:
```json
{
  "success": false,
  "error": "Subscription already exists",
  "details": "john@example.com is already subscribed to this address"
}
```

**Response - Duplicate Mobile (409)**:
```json
{
  "success": false,
  "error": "Subscription already exists",
  "details": "+447700123456 is already subscribed to this address"
}
```

**Why this is better**:
- ✅ Multiple people can subscribe to same address
- ✅ Same person can't accidentally create duplicates
- ✅ Clear error messages
- ❌ 409 only means "YOU are already subscribed", not "someone else is"

---

#### C. PUT/PATCH - Update Subscription

**✅ RECOMMENDED (New)**:
```http
PUT /api/subscriptions/bins
```

**Request**:
```json
{
  "addressId": "addr_v1_ABC123",
  "email": "john@example.com",  // Used to identify which subscription to update
  "mobile": "+447700999999",     // New mobile number
  "emailNotifications": false,   // Updated preference
  "smsNotifications": true,
  "reminderHours": 24            // Updated to 24 hours
}
```

**Validation**:
- Find subscription by `(addressId, email)` or `(addressId, mobile)`
- Update allowed fields
- Cannot change to email/mobile already used by another subscription at same address

**Response - Updated (200)**:
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "subscription": { /* updated subscription */ }
}
```

**Response - Not Found (404)**:
```json
{
  "success": false,
  "error": "Subscription not found",
  "details": "No subscription found for john@example.com at this address"
}
```

---

#### D. DELETE - Cancel Subscription (User-Specific)

**❌ CURRENT (Broken)**:
```http
DELETE /api/subscriptions/bins
Body: { "addressId": "addr_v1_ABC123" }
```
Problem: Which subscription to delete if there are multiple?

**✅ RECOMMENDED Option 1 (By ID - for email unsubscribe links)**:
```http
DELETE /api/subscriptions/bins/{subscriptionId}
```

**✅ RECOMMENDED Option 2 (By Contact - for web forms)**:
```http
DELETE /api/subscriptions/bins
```

**Request**:
```json
{
  "addressId": "addr_v1_ABC123",
  "email": "john@example.com"
}
```
**OR**
```json
{
  "addressId": "addr_v1_ABC123",
  "mobile": "+447700123456"
}
```

**Response - Success (200)**:
```json
{
  "success": true,
  "message": "You've been unsubscribed from bin collection reminders"
}
```

**Response - Not Found (404)**:
```json
{
  "success": false,
  "error": "Subscription not found",
  "details": "No subscription found for john@example.com at this address"
}
```

**Why this is better**:
- ✅ Clear ownership - only delete YOUR subscription
- ✅ Other users' subscriptions unaffected
- ✅ Works for both email unsubscribe links and web forms

---

#### E. GET - Check Subscription Count (Optional)

**✅ NEW ENDPOINT (Nice to Have)**:
```http
GET /api/subscriptions/bins/count?addressId={addressId}
```

**Response**:
```json
{
  "success": true,
  "addressId": "addr_v1_ABC123",
  "count": 3,
  "hasSubscriptions": true
}
```

**Use case**: Show hint like "3 people are subscribed to reminders for this address" without exposing personal data.

---

### 3. Public Unsubscribe Endpoint (No Changes Needed)

**Current**:
```http
GET /api/unsubscribe?token={subscriptionId}
```

This endpoint is fine as-is because:
- ✅ Uses unique `subscriptionId` - unambiguous which subscription to cancel
- ✅ No authentication required (by design)
- ✅ Works with email unsubscribe links

---

## Frontend UX Flow (After API Changes)

### User Journey: Subscribe

1. **User looks up their bin collection dates**
   - Enters postcode, selects address
   - Gets `addressId = "addr_v1_ABC123"`

2. **User clicks "Set up reminders" button**
   - Opens subscription modal

3. **Modal shows subscription form**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📧 Get bin collection reminders

   Your email: [john@example.com      ]
   Your mobile: [+447700123456         ] (optional)

   Notification preferences:
   ✓ Email reminders
   ✓ SMS reminders

   ⏰ Send reminder: [13 hours before ▼]

   [Subscribe]
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

4. **On form load, check if user is already subscribed**
   ```javascript
   // User types their email
   const email = "john@example.com";

   // Auto-check if already subscribed (debounced)
   const response = await fetch(
     `/api/subscriptions/bins?addressId=addr_v1_ABC123&email=${email}`
   );
   ```

5. **If already subscribed**
   - Pre-fill form with existing preferences
   - Change button to "Update preferences"
   - Show "Cancel subscription" button

6. **If not subscribed**
   - Keep form empty
   - Show "Subscribe" button

7. **User clicks Subscribe**
   ```javascript
   POST /api/subscriptions/bins
   {
     addressId: "addr_v1_ABC123",
     email: "john@example.com",
     mobile: "+447700123456",
     emailNotifications: true,
     smsNotifications: true,
     reminderHours: 13
   }
   ```

8. **Success**
   ```
   ✅ Subscribed successfully!

   You'll receive reminders 13 hours before each
   collection at john@example.com and +447700123456

   [Close]
   ```

---

### User Journey: Multiple People at Same Address

**Scenario**: Alice and Bob share a flat

1. **Alice subscribes**
   - Email: alice@example.com
   - ✅ Creates subscription A

2. **Bob looks up the same address**
   - Enters his email: bob@example.com
   - API checks: `GET /api/subscriptions/bins?addressId=X&email=bob@example.com`
   - Returns: `{"subscription": null}`
   - Form shows: "Subscribe" button

3. **Bob subscribes**
   - Email: bob@example.com
   - ✅ Creates subscription B
   - Alice's subscription A is unaffected

4. **Alice updates her preferences**
   - Changes reminder time to 24 hours
   - API: `PUT /api/subscriptions/bins` with alice@example.com
   - ✅ Updates subscription A only
   - Bob's subscription B is unaffected

5. **Bob cancels his subscription**
   - Clicks "Cancel subscription"
   - API: `DELETE /api/subscriptions/bins` with bob@example.com
   - ✅ Deletes subscription B only
   - Alice's subscription A is unaffected

---

## Migration Strategy

### For Existing Production Subscriptions

If the private API already has live subscriptions in production:

#### Phase 1: Database Changes (Non-Breaking)
1. ✅ Remove `UNIQUE(addressId)` constraint
2. ✅ Add `UNIQUE(addressId, email)` constraint
3. ✅ Add `UNIQUE(addressId, mobile)` constraint
4. ✅ Add indexes for lookups
5. ✅ Existing data remains valid (no migration needed)

#### Phase 2: API Updates (Breaking Changes)
1. ✅ Update GET endpoint to require email/mobile parameter
2. ✅ Update POST endpoint to allow multiple per address
3. ✅ Update DELETE endpoint to require contact identifier
4. ✅ Add PUT endpoint for updates

#### Phase 3: Versioning (Recommended)
```
/api/v2/subscriptions/bins  -- New multi-user API
/api/subscriptions/bins     -- Deprecated, maintains v1 behavior temporarily
```

#### Phase 4: Communication
1. Email existing subscribers about the change
2. Provide migration period (e.g., 3 months)
3. Sunset v1 API after migration period

---

## Security Considerations

### Current Security Issues
- ❌ Anyone can view any address's subscription details
- ❌ No verification required to modify subscriptions
- ❌ Contact details exposed via API

### After Changes
- ✅ Users can only access their own subscriptions
- ✅ Requires email/mobile to retrieve subscription (verification)
- ✅ Cannot see other people's subscriptions at same address
- ✅ Clear ownership model

### Additional Recommendations
1. **Rate limiting**: Prevent brute-force email enumeration
   - Limit GET requests to 10/minute per IP
   - Limit POST requests to 5/hour per email/mobile

2. **Email verification** (Optional enhancement):
   - Send confirmation email after subscription
   - Require click to activate
   - Prevents spam subscriptions

3. **GDPR Compliance**:
   - Add consent timestamp to subscriptions
   - Provide data export endpoint
   - Honor deletion requests

---

## Testing Checklist

### Unit Tests
- [ ] Multiple subscriptions for same addressId
- [ ] Prevent duplicate email at same address
- [ ] Prevent duplicate mobile at same address
- [ ] GET returns only matching subscription
- [ ] GET returns null if no match
- [ ] POST creates new subscription when addressId already has others
- [ ] DELETE removes only specified subscription
- [ ] PUT updates only specified subscription

### Integration Tests
- [ ] Alice and Bob subscribe to same address
- [ ] Alice updates preferences, Bob's unchanged
- [ ] Alice cancels, Bob's subscription still active
- [ ] Cannot retrieve Alice's subscription with Bob's email
- [ ] Cannot create duplicate with same email
- [ ] Email unsubscribe link cancels correct subscription

### Edge Cases
- [ ] Same person with two emails at same address
- [ ] Same person with email and mobile (separate subscriptions)
- [ ] Updating email to one already used by another user
- [ ] Concurrent subscription creation
- [ ] Subscription with only email (no mobile)
- [ ] Subscription with only mobile (no email)

---

## Summary: Required Changes

### Backend Team Action Items

#### Critical (Must Have)
1. ✅ **Database**: Remove `UNIQUE(addressId)` constraint
2. ✅ **Database**: Add `UNIQUE(addressId, email)` and `UNIQUE(addressId, mobile)`
3. ✅ **GET endpoint**: Require `email` or `mobile` parameter
4. ✅ **POST endpoint**: Allow multiple subscriptions per address
5. ✅ **DELETE endpoint**: Require contact identifier (email/mobile)

#### Important (Should Have)
6. ✅ **PUT endpoint**: Add update capability
7. ✅ **Validation**: Prevent duplicate email/mobile at same address
8. ✅ **Error messages**: Clear distinction between "you're already subscribed" vs "subscription not found"

#### Nice to Have
9. ✅ **GET /count endpoint**: Return subscription count for address
10. ✅ **Rate limiting**: Prevent abuse
11. ✅ **Email verification**: Confirm subscriptions
12. ✅ **API versioning**: /api/v2/ for new behavior

---

## Impact if Not Fixed

**User Experience**:
- ❌ Flatmates/family blocked from subscribing
- ❌ Users accidentally overwrite others' subscriptions
- ❌ Support complaints and frustration
- ❌ Privacy violations

**Business Impact**:
- ❌ Low adoption rate (service appears broken)
- ❌ Negative reviews and feedback
- ❌ Increased support tickets
- ❌ Potential GDPR complaints

**Technical Debt**:
- ❌ Frontend workarounds won't solve core issue
- ❌ More expensive to fix later
- ❌ Data integrity issues

---

## Recommendation

**Do not proceed with frontend implementation until these API changes are confirmed and deployed.**

The current API design is incompatible with real-world use cases. Implementing the frontend now would result in:
- Poor user experience
- Support issues
- Wasted development time
- Need for complete rework later

**Next Steps**:
1. Share this document with backend/API team
2. Confirm changes can be made
3. Agree on timeline
4. Implement API changes
5. Then implement frontend

---

## Questions?

Contact the frontend team for clarification on UX requirements or API usage patterns.

**Document Version**: 1.0
**Last Updated**: 2026-01-04
**Author**: Frontend Development Team
