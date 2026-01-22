# Council Tax Section - TODO List for Missing Content

This document lists all content on the council tax pages that currently has **NO SOURCE** in the schema or requires additional information.

## Date Created
2025-01-22

## Content Without Schema Source

### 1. Office Hours (CRITICAL - Appears on ALL Pages)
**Location:** All council tax pages (contact sidebar section)
**Current Content:** "Monday to Friday, 8:30am to 5pm"
**Status:** ⚠️ NO SOURCE - This appears in the sidebar contact block on every page
**Action Required:** Verify and confirm official office hours for the Council Tax / Revenues & Benefits team
**Schema Path Needed:** `channels.office_hours` or similar

---

### 2. Related Links Section
**Location:** Homepage `/council-tax/index.html` (sidebar)
**Current Content:** Links to "Bins and recycling", "Housing and homelessness", "My Gloucester account"
**Status:** ⚠️ NO SOURCE - Related services links added for user experience
**Action Required:** Verify these are the correct related services to link to
**Schema Path Needed:** `related_services` or similar

---

## Schema Validation Status - TODO Items from Original Schema

The following items were marked as TODO in the `schema_metadata.validation_status.TODO_SUMMARY`:

### Policy and Governance Items

1. **Cabinet Member for Finance**
   - Current role holder needs confirmation
   - Schema reference: `governance.political_accountability.cabinet_member.role`

2. **Service Manager Role**
   - Current Council Tax Service Manager post holder needs confirmation
   - Schema reference: `governance.operational_delivery.service_manager.role`

3. **Corporate Director Accountability**
   - Current structure needs confirmation
   - Schema reference: `governance.strategic_accountability.corporate_director.role`

### Policy Documents

4. **Council Tax Support Policy 2025/26**
   - Need current policy URL
   - Schema reference: `legal_framework.local_policies[0].policy`

5. **Care Leavers Discount Policy**
   - Need full policy document reference and URL
   - Schema reference: `legal_framework.local_policies[1].policy`

6. **Enforcement Policy**
   - Need current policy document reference
   - Schema reference: `enforcement.enforcement_policy`

7. **Exemption Classes**
   - Need comprehensive list of all exemption class codes (A-W) with descriptions
   - Schema reference: `exemptions.TODO`

### Performance Metrics

8. **Collection Rates**
   - Target collection rate needs validation
   - Actual performance needs validation
   - Schema reference: `service_standards.collection_performance`

9. **Processing Times**
   - Need to define target processing times for:
     - Discount applications
     - Exemption applications
     - Council Tax Support applications
     - Change of address
     - Bill corrections
   - Schema reference: `service_standards.processing_times`

### Data Protection

10. **DPO Sign Off**
    - Data Protection Officer sign-off required before publication
    - Schema reference: `data_privacy.data_protection_officer.sign_off`

11. **Data Retention Periods**
    - Need formal confirmation for all data types and processes
    - Schema reference: `data_privacy.what_we_process.*.retention`

### Payment Systems

12. **GOV.UK Pay Implementation**
    - Need confirmation of GOV.UK Pay implementation status
    - Schema reference: `payment.gov_pay_implementation`

### Legal and Process Information

13. **Appeals Timescales**
    - Valuation Tribunal timescales need confirmation
    - Schema reference: `appeals_and_challenges.valuation_tribunal.timescales`

14. **Response Times**
    - Email response time target needs definition
    - Post response time target needs definition
    - Schema reference: `service_standards.customer_service.response_times`

---

## Priority Classification

### 🔴 HIGH PRIORITY (Must be completed before launch)
- Office hours (appears on all pages)
- DPO sign off
- Council Tax Support Policy URL
- Data retention periods

### 🟡 MEDIUM PRIORITY (Should be completed soon)
- Collection rates and performance metrics
- Processing time targets
- Cabinet Member / Service Manager confirmation
- Care Leavers Policy URL
- Enforcement Policy URL

### 🟢 LOW PRIORITY (Can be completed later)
- Related links verification
- Appeals timescales
- Response time targets
- GOV.UK Pay implementation status
- Comprehensive exemption class list

---

## How to Update

When information becomes available:

1. Update the relevant schema JSON file with the confirmed information
2. Add the appropriate `<!-- SOURCE: schema.path.to.field -->` comment in the HTML
3. Remove or update the `<!-- NO SOURCE -->` comment
4. Update this TODO document to mark the item as complete
5. Test the updated page for accessibility and mobile-friendliness

---

## Notes

- All pages have been created following WCAG 2.2 AA standards
- All pages use plain English at reading age 11
- All pages are mobile-friendly using existing responsive CSS
- All pages include proper semantic HTML and ARIA labels
- Source comments are included throughout to map content to schema

---

## Contact for Content Queries

For questions about missing content, contact:
- Revenues Team: revenues@gloucester.gov.uk
- Benefits Team: benefits@gloucester.gov.uk
- Phone: 01452 396396
