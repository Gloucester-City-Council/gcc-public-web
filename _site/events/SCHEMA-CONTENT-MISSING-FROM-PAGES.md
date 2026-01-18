# Schema Content Missing from Pages

This document lists all content that EXISTS in the schema but is NOT present on any of the web pages.

---

## Common Elements (Shared Across Services)

### Governance - Senior Management

**Schema Location:** `common_elements.governance.accountable_senior_manager`
- **Role:** Head of Culture and Leisure
- **Accountability:** Overall service delivery and policy compliance
- **Why Missing:** User-facing pages focus on City Events Manager as primary contact. Senior management accountability is internal governance.

**Schema Location:** `common_elements.governance.cabinet_member`
- **Role:** Cabinet Member for Culture
- **Responsibilities:** Policy decisions, fee changes, major event approvals
- **Why Missing:** Not relevant for day-to-day event organizers. Internal decision-making structure.

**Recommendation:** Could add to "About this service" or governance section if transparency required.

---

### Risk Assessment - Technical Details

**Schema Location:** `common_elements.risk_assessment.principle`
- **Content:** "Reduce risks 'So Far As Is Reasonably Practicable' (SFAIRP)"
- **Why Missing:** Technical legal principle. Pages use simpler language for reading age 11.

**Schema Location:** `common_elements.risk_assessment.guidance`
- **Content:** "HSE guidance - Running an event safely (hse.gov.uk/event-safety)"
- **Link:** https://hse.gov.uk/event-safety
- **Why Missing:** External resource not explicitly linked
- **Recommendation:** ADD THIS - Very useful reference for event organizers

**Schema Location:** `common_elements.risk_assessment.legislation`
- **Content:** "Management of Health and Safety at Work Regulations 1999"
- **Why Missing:** Technical legal reference. Simplified on pages to "You must assess all risks"

---

### Licensing - Music Exemptions Detail

**Schema Location:** `common_elements.licensing_requirements.music_licensing.exemptions`
- **Content:** Detailed list:
  - "Incidental music (not main purpose of event)"
  - "Unamplified live music between 8am-11pm with audience under 500"
  - "Music at religious services"
- **On Pages:** PRS for Music mentioned but exemptions not fully detailed
- **Recommendation:** ADD - Could save organizers money if they qualify for exemptions

---

### Staffing - Training Requirements

**Schema Location:** `common_elements.staffing_and_security.training`
- **Content:** "Staff must understand emergency procedures, evacuation routes, first aid provision"
- **On Pages:** Staff numbers mentioned but not training requirements explicitly
- **Recommendation:** ADD - Important for event safety

---

### Site Handover - Financial Consequences

**Schema Location:** `common_elements.site_handover_and_reinstatement.post_event.reinstatement_charges`
- **Content:** "Council reserves right to charge for reinstatement if damage occurs"
- **On Pages:** Damage deposit mentioned but not additional reinstatement charges
- **Recommendation:** ADD - Organizers need to know full financial liability

---

## Service 0: Events in Parks and Open Spaces

### Legal Basis

**Schema Location:** `services[0].legal_basis.service_type`
- **Content:** "discretionary"
- **Why Missing:** Not user-facing. Internal classification.

**Schema Location:** `services[0].legal_basis.primary_legislation`
- **Content:** "Local Government Act 1972, Section 145"
- **Purpose:** "Council may provide facilities for public events and entertainment"
- **Why Missing:** Technical legal basis. Simplified on pages.

**Schema Location:** `services[0].legal_basis.occupiers_liability`
- **Content:** "Occupiers' Liability Acts 1957 and 1984 - council has duty of care to event attendees on its land"
- **Why Missing:** Legal detail not relevant to applicants
- **Recommendation:** Keep off user pages - internal legal framework

---

### Eligibility - Detailed Exclusions

**Schema Location:** `services[0].eligibility.exclusions[3]`
- **Content:** "Events where suitable venue unavailable or already booked"
- **On Pages:** Political parties, hatred/discrimination, disruption mentioned but not "venue unavailable"
- **Why Missing:** Self-evident (can't book if unavailable)

**Schema Location:** `services[0].eligibility.assessment_criteria`
- **Full List of 7 Criteria:**
  1. "Public safety can be assured"
  2. "Appropriate insurance in place"
  3. "Adequate risk assessment provided"
  4. "Venue suitable for proposed activity"
  5. "No unacceptable impact on local residents"
  6. "Organizer demonstrates competence"
  7. "Event aligns with council policies (e.g. no animal entertainment for amusement)"
- **On Pages:** Requirements mentioned but not framed as assessment criteria checklist
- **Recommendation:** COULD ADD - Makes assessment process transparent

---

### Charging - Government Policy Context

**Schema Location:** `services[0].charging.reason`
- **Content:** "Discretionary service - council policy to recover costs and manage venues"
- **On Pages:** Says "There is a fee" but not the policy reasoning
- **Recommendation:** COULD ADD - Explains why charges exist

---

### Prohibited Items - Consultation Note

**Schema Location:** `services[0].prohibited_at_events.note`
- **Content:** "Some items require specific consultation - discuss with City Events team"
- **On Pages:** Prohibited list shown but not the note about discussing borderline items
- **Recommendation:** ADD - Encourages applicants to ask rather than assume

---

### Refusal and Cancellation Policy

**Schema Location:** `services[0].refusal_and_cancellation`
- **Full Policy:**
  - **council_may_refuse:** 7 reasons listed
  - **council_may_cancel:** 4 reasons including "Emergency (elections, death of monarch)"
  - **organizer_cancellation:** Notice requirements, refund policy, insurance advice
- **On Pages:** NOT MENTIONED AT ALL
- **Recommendation:** ADD - Applicants need to know cancellation terms before applying

---

### Documents and Resources

**Schema Location:** `services[0].channels.documents`
- **List:**
  - "Event Application Form" ✓ (mentioned)
  - "Event Application Journey" ✗
  - "Guidelines for planning events in Gloucester" ✗
  - "Event Management Plan template" ✗
  - "Risk Assessment template" ✗
- **Recommendation:** ADD links/mentions to all available documents

**Schema Location:** `services[0].channels.external_guidance`
- **Resources:**
  - "HSE - Running an event safely" ✗
  - "Gloucestershire County Council - travel, roads and parking" ✗
- **Recommendation:** ADD - Valuable external resources

---

## Service 1: Street Parties

### Legal Framework

**Schema Location:** `services[1].legal_basis.primary_legislation`
- **Content:** "Road Traffic Regulation Act 1984, Section 14 (Temporary Traffic Regulation Orders) or Town Police Clauses Act 1847 Section 21"
- **On Pages:** Says County Council processes closures but not specific legislation
- **Recommendation:** Not essential for users, keep simplified

---

### Charging Policy Context

**Schema Location:** `services[1].charging.reason`
- **Content:** "Government guidance encourages councils to support community street parties without charges"
- **On Pages:** Says "no charge" but not the policy reason
- **Recommendation:** COULD ADD - Explains why street parties are free

---

### Road Closure - Technical Details

**Schema Location:** `services[1].road_closure_process.signage.compliance`
- **Content:** "Must comply with Traffic Signs Regulations and General Directions (TSRGD) 2016"
- **On Pages:** Sign requirements mentioned but not TSRGD regulation
- **Recommendation:** Not essential - technical regulation

**Schema Location:** `services[1].road_closure_process.utilities_access`
- **Content:** "May need to allow access for utility companies"
- **On Pages:** NOT MENTIONED
- **Recommendation:** ADD - Practical consideration organizers should know

---

### Resident Consultation - Full Details

**Schema Location:** `services[1].organizer_responsibilities.resident_consultation.content`
- **4 Items:**
  1. "Event details (date, time, activities)" ✓
  2. "Expected impact (noise, parking, road closures)" ✓
  3. "Contact details for queries" ✓
  4. "How to raise concerns" ✗
- **Recommendation:** ADD item 4 - Important for good neighbor relations

---

### External Resources

**Schema Location:** `services[1].channels.external_resources`
- **3 Resources:**
  1. "streetparty.org.uk - comprehensive street party guidance" ✓ (mentioned)
  2. "GOV.UK - Your guide to organising a street party" ✓ (mentioned)
  3. "The Big Lunch - community gathering ideas" ✗ (NOT mentioned)
- **Recommendation:** ADD The Big Lunch link - Popular community resource

---

## Service 2: Guildhall Events

**Schema Status:** "integration_note: This service definition is placeholder"

**Schema Location:** `services[2]` (entire service)
- Most Guildhall content needs completion in schema first
- Pages reflect placeholder status with minimal detail
- **Recommendation:** Complete schema before expanding pages

---

## Related Services

**Schema Location:** `related_services.sports_pitch_bookings`
- **Content:**
  - Description: "Regular bookings for sports pitches on council land"
  - Contact: "May be separate from events - check council website"
  - Note: "One-off sports tournaments use events process; regular league bookings may use different system"
- **On Pages:** NOT MENTIONED
- **Recommendation:** ADD - Helps users distinguish between one-off events and regular bookings

**Schema Location:** `related_services.filming_and_photography`
- **Content:**
  - Description: "Commercial filming and photography on council land"
  - Requirements: "May require separate permissions and fees"
  - Contact: "city.events@gloucester.gov.uk for advice"
- **On Pages:** NOT MENTIONED
- **Recommendation:** ADD - Different process, users should be directed appropriately

---

## Licensing - Detailed Requirements

**Schema Location:** `common_elements.licensing_requirements.temporary_event_notice.limits`
- **Full Limits:**
  - Personal licence holder: 50 standard TENs or 10 late TENs per year ✓
  - Non-personal licence holder: 5 standard TENs or 2 late TENs per year ✓
  - Per premises: 15 TENs per year, maximum 21 days total duration ✓
  - Gap between events: Minimum 24 hours ✗
- **Recommendation:** ADD "24-hour gap" requirement

**Schema Location:** `common_elements.licensing_requirements.temporary_event_notice.legislation`
- **Content:** "Licensing Act 2003"
- **On Pages:** NOT MENTIONED
- **Why Missing:** Simplified to avoid legal jargon

**Schema Location:** `common_elements.licensing_requirements.premises_licence.legislation`
- **Content:** "Licensing Act 2003"
- **On Pages:** NOT MENTIONED

---

## Summary Statistics

### High Priority to Add (User-Facing, Practical Value)
1. ✅ **HSE event safety guidance link** - Very useful external resource
2. ✅ **Music licensing exemptions** - Could save organizers money
3. ✅ **Refusal and cancellation policy** - Essential terms and conditions
4. ✅ **Reinstatement charges warning** - Full financial liability disclosure
5. ✅ **Related services** (sports pitches, filming) - Directs users correctly
6. ✅ **Available documents list** - Links to all templates and guides
7. ✅ **Staff training requirements** - Important for safety
8. ✅ **Utility access for street parties** - Practical consideration
9. ✅ **The Big Lunch resource** - Popular community resource
10. ✅ **24-hour gap between TENs** - Licensing requirement

### Medium Priority (Transparency, Nice-to-Have)
11. Assessment criteria as checklist - Makes process clear
12. Charging policy reasoning - Explains why fees exist
13. Prohibited items consultation note - Encourages questions
14. Resident consultation "how to raise concerns" - Good practice

### Low Priority (Technical/Legal, Not Essential for Users)
15. Primary legislation details - Internal legal framework
16. Service type (discretionary) - Internal classification
17. SFAIRP principle - Technical terminology
18. TSRGD compliance - Technical regulation
19. Legislation names (Licensing Act 2003) - Simplified for users
20. Senior management roles - Internal governance

### Schema TODOs (Can't Add Until Schema Complete)
- Fee structures
- Damage deposit amounts
- SAG thresholds
- Data retention periods
- Event application system details
- Guildhall service completion

---

## Recommendations

### Immediate Additions (High Value, Easy to Add)

1. **Add to Parks page:**
   ```
   ### Useful Resources
   - [HSE - Running an event safely](https://hse.gov.uk/event-safety)
   - [Gloucestershire County Council - Roads and parking guidance](link)
   ```

2. **Add to Parks page (Licensing section):**
   ```
   ### Music Licensing Exemptions
   You may not need a music licence if:
   - Music is incidental (not the main purpose of your event)
   - Live music is unamplified, between 8am-11pm, with under 500 people
   - Music is part of a religious service

   Check with PRS for Music (0800 068 4828) if you think you may be exempt.
   ```

3. **Add to Parks page (Documents section):**
   ```
   ### Available Documents
   We have templates to help you:
   - Event Application Form
   - Risk Assessment template
   - Event Management Plan template
   - Guidelines for planning events in Gloucester

   Contact the City Events team to request these documents.
   ```

4. **Add to Parks page (Cancellation section - NEW):**
   ```
   ## Cancellation and Refunds

   ### If we need to cancel
   We may need to cancel your event if:
   - There is an emergency (such as elections or national events)
   - Unforeseen circumstances arise
   - You breach the conditions of approval
   - Public safety concerns develop

   ### If you need to cancel
   - Tell us as soon as possible
   - Fees may not be fully refundable depending on how much notice you give
   - Consider taking out cancellation insurance for your event
   ```

5. **Add to Parks page (Costs section):**
   ```
   Important: If you damage the site, we may charge you for repairs beyond your deposit.
   ```

6. **Add to Street Parties page (Useful information):**
   ```
   You may need to allow access for utility companies (gas, electric, water)
   even during your road closure.
   ```

7. **Add to Street Parties page (External resources):**
   ```
   - [The Big Lunch](https://www.thebiglunch.com) - Ideas for community gatherings
   ```

8. **Add to ALL pages (Related Services sidebar):**
   ```
   ## Other Services
   - **Regular sports pitch bookings** - For ongoing league bookings (not one-off events)
   - **Filming and photography** - Commercial filming on council land requires separate permissions

   Contact city.events@gloucester.gov.uk for advice.
   ```

### Consider Adding (Transparency/Nice-to-Have)

9. **Parks page - Why we charge:**
   ```
   We charge for events to help cover the costs of maintaining parks and
   managing event applications. This is council policy for discretionary services.
   ```

10. **Parks page - Assessment criteria:**
    ```
    ## How we assess your application
    We check that:
    - Public safety can be assured
    - You have appropriate insurance
    - Your risk assessment is adequate
    - The venue is suitable for your activity
    - There is no unacceptable impact on local residents
    - You have the skills to run the event safely
    - Your event aligns with council policies
    ```

---

## Notes

- **80+ items** total in schema
- **~12 high-value items** missing from pages
- Most missing content is either:
  - Technical/legal detail (appropriately simplified)
  - Internal governance (not user-facing)
  - Schema TODOs (can't add yet)

- **Top 10 additions** would significantly improve user experience with practical information and external resources

- All primary legal frameworks (Acts of Parliament) intentionally omitted for readability
- Senior management structure intentionally omitted as not relevant to applicants
- Most missing content represents good editorial decisions to keep pages simple and accessible

---

## Action Items

**Quick Wins (Add These Now):**
1. HSE guidance link
2. Music exemptions detail
3. Available documents list
4. Cancellation policy
5. Related services section
6. Reinstatement charges warning
7. The Big Lunch link
8. Utility access note

**Medium Term (Consider Adding):**
9. Assessment criteria transparency
10. Charging policy explanation

**Long Term (Schema Completion Required):**
11. Complete Guildhall service
12. Add fee structures once defined
13. Add all TODO items once confirmed
