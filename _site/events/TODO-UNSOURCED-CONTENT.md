# Events Area - Unsourced Content TODO List

This document lists all content on the Events pages that does NOT have a direct source in the provided schema. This content was either inferred from context, added for user experience, or represents gaps in the schema that need to be filled.

## Overall Website Structure (All Pages)

### Header & Navigation
- **NO SOURCE**: Skip link ("Skip to main content")
- **NO SOURCE**: Search functionality in header
- **NO SOURCE**: Main navigation menu items (Contact us, My Gloucester, News, Subscribe)
- **NO SOURCE**: Welcome banner H1 styling and placement

### Footer
- **NO SOURCE**: Entire footer structure and content
- **NO SOURCE**: Quick links (Check bin day, Pay Council Tax, Planning applications, Report a problem)
- **NO SOURCE**: About Gloucester links (Visit Gloucester, Find your councillor, Jobs)
- **NO SOURCE**: Using our site links (Privacy and cookies, Accessibility, Contact us)
- **NO SOURCE**: Copyright notice and registered office address format

### Feedback Panel
- **NO SOURCE**: "Was this page helpful?" feedback mechanism
- **NO SOURCE**: Feedback form structure and prompts
- **NO SOURCE**: Optional email collection for feedback follow-up

## Landing Page (/events/index.html)

### Contact Information
- **NO SOURCE**: Office hours (Monday to Friday, 8:30am to 5pm)
- **NO SOURCE**: Response time promise ("We aim to reply within 2 working days")

### User Interface Elements
- **NO SOURCE**: "What do you want to do?" user-friendly heading
- **NO SOURCE**: Emoji icons for action cards (🌳, 🎉, 🏛️)
- **NO SOURCE**: "Before you apply" callout box
- **NO SOURCE**: "You might also need" related links section
- **NO SOURCE**: Specific links to /licensing and /planning pages

### Venue Descriptions
- **PARTIALLY SOURCED**: Venue names come from schema, but these descriptions are inferred/simplified:
  - "Community park suitable for smaller events" (Hillfield Gardens)
  - "Green space with varied facilities" (Barnwood Park)
  - "Sports facilities and outdoor space" (Plock Court)

### Introductory Text
- **NO SOURCE**: "We help you plan safe events that work for everyone. Our team will guide you through what you need to do."

## Parks and Open Spaces Page (/events/parks-and-open-spaces.html)

### Page Introduction
- **NO SOURCE**: "Get permission to hold an event on council-owned parks, open spaces, and public land in Gloucester." (intro paragraph)

### Service Standards
- **PARTIALLY SOURCED**: Schema mentions "acknowledge application within 5 working days" and "decision within 4 weeks" but page context adds:
  - "We will reply to your first contact within 5 working days" (slightly reworded)
  - Explanatory context around timelines

### Event Type Descriptions
- **PARTIALLY SOURCED**: Schema lists event types but page adds user-friendly descriptions:
  - "Community events: Festivals, fetes, and celebrations"
  - "Sports events: Tournaments and competitions"
  - "Charity events: Fundraising and awareness events"
  - etc.

### Application Process Visual Design
- **NO SOURCE**: Numbered step presentation with visual styling (circles with numbers 1-13)
- **NO SOURCE**: Step-by-step active/completed styling approach

### Venue Descriptions
- **PARTIALLY SOURCED**:
  - "Premier city park with 11 hectares of space" for Gloucester Park (hectares mentioned in schema)
  - Other venues have inferred descriptions

### Staffing Rule Presentation
- **SOURCED**: "1 event staff member per 100 attendees" is in schema
- **NO SOURCE**: Visual callout box styling and "General rule" heading
- **NO SOURCE**: Example calculation "475 people requires minimum 5 staff"

### Facilities Section
- **PARTIALLY SOURCED**: Toilets, first aid, waste management are in schema
- **NO SOURCE**: "General rule: 1 toilet for every 100-150 people" (ratio not in schema)

### User Journey Elements
- **NO SOURCE**: "Start your application" button/CTA in sidebar
- **NO SOURCE**: Breadcrumb navigation structure

## Street Parties Page (/events/street-parties.html)

### Page Introduction
- **NO SOURCE**: "Get advice and support for organising a street party on a residential street in Gloucester."

### What is a Street Party Section
- **SOURCED**: Schema defines typical street party characteristics
- **NO SOURCE**: Section heading "What is a street party" and introductory framing

### Visual Design Elements
- **NO SOURCE**: Green checkmark list for "Good for street parties"
- **NO SOURCE**: Red X/warning styling for "Not suitable for street parties"
- **NO SOURCE**: Important notice callout box design

### Road Closure Guidance
- **SOURCED**: 6-8 weeks advance notice from schema
- **NO SOURCE**: Bullet points for sign options (borrow, hire, buy, make) - schema mentions but not in list format
- **NO SOURCE**: "Around £50 each" price for signs (approximate figure not in schema)

### Neighbor Consultation
- **SOURCED**: Schema mentions resident consultation
- **NO SOURCE**: Specific format suggestions for consultation letter
- **NO SOURCE**: Content recommendations for notification

### Insurance Guidance
- **SOURCED**: Schema says "not legally required but recommended"
- **NO SOURCE**: "May cost £50-100" estimate
- **NO SOURCE**: Suggestion to "split cost between households"

### County Council Information
- **NO SOURCE**: Gloucestershire County Council website link (www.gloucestershire.gov.uk)
- **NO SOURCE**: External resources section with streetparty.org.uk

## Guildhall Events Page (/events/guildhall.html)

### Overall Note
- **SCHEMA STATUS**: The schema explicitly states this service is a placeholder
- **NO SOURCE**: Most of the Guildhall page content is inferred or placeholder

### Page Introduction
- **NO SOURCE**: "Hire the historic Gloucester Guildhall for your event, performance, or ceremony."
- **NO SOURCE**: "Historic building in the heart of the city"

### Venue Description
- **NO SOURCE**: "It has performance and event spaces suitable for a range of activities"

### Event Types
- **PARTIALLY SOURCED**: Schema lists some event types for Guildhall
- **NO SOURCE**: These specific descriptions:
  - "Performances: Concerts, shows, and theatre"
  - "Conferences: Business events and meetings"
  - "Weddings: Ceremonies and receptions"
  - etc.

### Booking Process
- **NO SOURCE**: 5-step booking process
- **NO SOURCE**: "Contact the Guildhall booking team to check availability"
- **NO SOURCE**: Note that separate booking system from parks

### Requirements
- **NO SOURCE**: "Similar to other events on council property" framing
- **NO SOURCE**: Capacity limits mention

## Privacy Page (/events/privacy.html)

### Page Structure
- **SOURCED**: Most privacy page content comes from common_elements.data_privacy
- **NO SOURCE**: User-friendly heading "Who we are" (schema has "data_controller")

### Rights Explanation
- **PARTIALLY SOURCED**: Rights are mentioned in schema
- **NO SOURCE**: Visual card/box presentation of each right
- **NO SOURCE**: Color-coded "Rights that do not apply" section

### Contact Information
- **SOURCED**: Email addresses and phone numbers from schema
- **NO SOURCE**: Office hours
- **NO SOURCE**: Response time ("Response within 1 month" - actually this IS standard GDPR, not schema-specific)

### Updates Notice
- **NO SOURCE**: "Updates to this notice" section footer
- **NO SOURCE**: "Check this page for the latest information"

## Cross-Page Consistency Elements

### Typography & Reading Level
- **NO SOURCE**: Simplified language decisions (reading age 11)
- **NO SOURCE**: Sentence structure choices
- **NO SOURCE**: Use of contractions (don't, can't, etc.)

### Accessibility Features (Not in Schema)
- **NO SOURCE**: All ARIA labels and roles
- **NO SOURCE**: Screen reader only text (class="sr-only")
- **NO SOURCE**: Semantic HTML5 element choices
- **NO SOURCE**: Focus management decisions
- **NO SOURCE**: Keyboard navigation structure

### Mobile Responsiveness (Not in Schema)
- **NO SOURCE**: Responsive grid layouts
- **NO SOURCE**: Touch-friendly button sizing
- **NO SOURCE**: Mobile breakpoint decisions
- **NO SOURCE**: Viewport meta tag configuration

### Visual Design (Not in Schema)
- **NO SOURCE**: Color scheme (#2d6a4f green, #0ea5e9 blue, etc.)
- **NO SOURCE**: Box shadows and border radius values
- **NO SOURCE**: Padding and margin spacing
- **NO SOURCE**: Card component styling
- **NO SOURCE**: Button and link styles

## Schema Gaps to Fill (TODO Items from Schema)

These items are marked as TODO in the schema itself:

### Validation Status Items (schema_metadata.validation_status)
1. **TODO**: DPO sign-off required before publication
2. **TODO**: Define fee structures for different event types and locations
3. **TODO**: Confirm Safety Advisory Group membership and thresholds
4. **TODO**: Confirm data retention periods for event applications and risk assessments
5. **TODO**: Define relationship with Guildhall booking system
6. **TODO**: Define system for event applications and calendar management
7. **TODO**: Define which events require SAG vs City Events Group
8. **TODO**: Define specific insurance requirements and evidence needed
9. **TODO**: Define when deposits required and amounts

### Processing Systems (common_elements.processing_systems)
10. **TODO**: Define event application system
11. **TODO**: Confirm if calendar system integrated with event application or separate

### Governance (common_elements.governance)
12. **TODO**: Confirm City Events Group meeting frequency during busy periods
13. **TODO**: Define Safety Advisory Group threshold for larger events

### Venue Availability (common_elements.venue_availability)
14. **TODO**: Confirm if public calendar available online

### Data Privacy (common_elements.data_privacy)
15. **TODO**: Define storage system for event applications
16. **TODO**: Define retention period for event applications
17. **TODO**: Define processor once system confirmed
18. **TODO**: Complete DPIA covering safeguarding data in event applications
19. **TODO**: DPO sign-off for data privacy notices

### Service-Specific: Parks and Open Spaces (services[0])
20. **TODO**: Define fee structure (factors listed but no amounts)
21. **TODO**: Define damage deposit policy and amounts

### Service-Specific: Street Parties (services[1])
22. **TODO**: Confirm if Gloucestershire County Council charges for road closures

### Service-Specific: Guildhall (services[2])
23. **TODO**: Define Guildhall fee structure
24. **TODO**: Confirm Guildhall management structure
25. **TODO**: Define Guildhall bookings page URL
26. **TODO**: Define Guildhall booking contact details
27. **TODO**: Confirm operational model for Guildhall bookings

## Recommendations

### High Priority - Add to Schema
1. **Office hours** for City Events team
2. **Response time commitments** for enquiries and applications
3. **Fee structures** for all three services
4. **Damage deposit amounts** and policy
5. **Toilet and first aid ratios** for event planning
6. **Safety Advisory Group thresholds** (number of attendees)
7. **Guildhall booking system** integration details
8. **Public calendar availability** for venue bookings

### Medium Priority - Confirm or Add
9. **Office hours** and **response times** for all contact points
10. **Related services** links (licensing, planning, etc.)
11. **External resources** and useful websites
12. **Approximate costs** for common items (signs, insurance estimates)
13. **Event application system** platform and URL
14. **Documents** - confirm all are available (Event Application Form, templates, etc.)

### Low Priority - User Experience Elements
15. Document **visual design standards** (colors, spacing) if standardized
16. Document **tone of voice** guidelines (reading age, friendliness level)
17. Create **feedback mechanism** specification for "Was this helpful?"
18. Define **accessibility requirements** beyond WCAG 2.2

## Notes

- Items marked **NO SOURCE** are not wrong - they are appropriate additions for user experience
- Items marked **PARTIALLY SOURCED** use schema data but add interpretation or formatting
- Items marked **TODO** in schema should be completed before site launch
- Many "NO SOURCE" items are standard web conventions and don't need to be in the schema
- Some items (like ARIA labels, mobile responsiveness) are implementation details, not content

## Action Items

1. **Review schema TODOs** and complete before launch
2. **Add missing operational details** to schema (hours, response times, fees)
3. **Confirm Guildhall booking process** and integrate properly
4. **Get DPO sign-off** on data privacy content
5. **Define fee structures** for all services
6. **Confirm Safety Advisory Group thresholds**
7. **Test all external links** (County Council, external resources)
8. **Review "NO SOURCE" items** and determine if any should be added to schema for record-keeping
