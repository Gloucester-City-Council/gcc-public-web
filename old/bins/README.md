# Bins and Recycling Section - Gloucester City Council

## Overview

This section provides comprehensive bins and recycling information based on best practices from exemplar UK councils (Rochdale, Camden, Stockport) and aligned with the household waste collection schema.

## Files Created

### 1. **index.html** - Landing Page
The main bins and recycling hub with:
- Quick action cards for top 6 tasks (check bin day, what goes where, missed collection, order bin, garden waste, bulky waste)
- 8 category cards organizing all services
- Service status sidebar
- Contact information
- Related services

**Key Features:**
- Task-based navigation (not department-focused)
- Maximum 2 clicks to any service
- Clear visual hierarchy with icons
- Comprehensive coverage of all bin services

### 2. **what-goes-where.html** - Recycling Guidance
Detailed guide to waste separation with:
- Green box 1 (plastics and metals)
- Green box 2 (glass)
- Blue bag (paper and cardboard)
- Food caddy (food waste)
- Black bin (general waste)
- Brown bin (garden waste - subscription)
- Special disposal items

**Key Features:**
- Clear "can/cannot" lists for each container
- AI-readable data attributes (data-material, data-ai-role)
- Schema.org HowTo markup
- Top tips for each bin type
- Links to related guidance

### 3. **collection-day.html** - Collection Day Lookup
Interactive page to check collection days with:
- Postcode lookup form
- Collection schedule display
- Calendar download options
- Putting bins out guidance
- Missed collection information
- Bank holiday guidance

**Key Features:**
- Form connected to API endpoint (/api/getBinCollection)
- JavaScript for dynamic results display
- Clear collection windows (7am-6pm)
- Reminder signup options

### 4. **garden-waste.html** - Garden Waste Subscription
Complete subscription service page with:
- Clear pricing (£60 per year)
- What's included in subscription
- What can/cannot be collected
- Collection dates and winter break
- Composting at home alternative
- Comprehensive FAQs

**Key Features:**
- Prominent CTA button to subscribe
- Schema.org Offer markup with pricing
- AI-readable pricing data (data-value, data-currency)
- Clear value proposition
- FAQ addressing common concerns

## Design Principles Applied

### 1. **Task-Based Organization**
Users think in terms of tasks ("check my bin day") not departments ("waste management services"). All navigation is organized around what residents need to do.

### 2. **Maximum 2 Clicks**
From the landing page, users can reach any specific service in at most 2 clicks:
- Landing page → What goes where (1 click)
- Landing page → Collection services → Check bin day (2 clicks)

### 3. **AI-Readable Content**
All pages include:
- Schema.org structured data (GovernmentService, HowTo, Offer)
- Data attributes for AI extraction (data-material, data-value, data-ai-role)
- Semantic HTML with clear hierarchy
- Machine-readable facts alongside human-readable content

### 4. **Accessibility Compliance**
- WCAG AAA standards
- Skip links on every page
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels and landmarks
- Screen reader only text for icons
- Clear form labels and error states

### 5. **Best Practice Research**
Based on analysis of:
- **Rochdale**: Excellent categorization, clear "recycle right" messaging, comprehensive A-Z guide
- **Camden**: Strong "what goes in bins" guidance, contamination warnings, accessibility focus
- **Stockport**: Good service descriptions, clear pricing

## Schema Alignment

All pages align with the household-waste-collection.json schema:

### Service Structure
- **Service ID**: household-waste-collection
- **URL slug**: /bins (as specified in schema)
- **Resident tasks**: All 5 tasks from schema covered
  - Check collection day ✓
  - What goes where ✓
  - Report missed collection ✓
  - Order/replace bin ✓
  - Garden waste subscription ✓

### Container Types
All containers from schema represented:
- Black bin (residual waste, fortnightly)
- Green box 1 (plastics/metals, weekly)
- Green box 2 (glass, weekly)
- Blue bag (paper/cardboard, weekly)
- Food caddy (food waste, weekly)
- Brown bin (garden waste, fortnightly, £60/year)

### Collection Details
- Frequency: Matches schema (weekly/fortnightly)
- Time window: 7am-6pm (from schema)
- Statutory obligations: Reflected in content
- Garden waste fee: £60 (from schema)

## Technical Implementation

### API Integration Points
Pages are ready to connect to Azure Functions:

1. **/api/getBinCollection** 
   - Endpoint: collection-day.html
   - Parameters: postcode or UPRN
   - Returns: Collection schedule, next collection dates

2. **/api/submitFeedback**
   - Endpoint: All pages (feedback widget)
   - Parameters: rating, comments, email, page URL

### JavaScript Features
- Mobile menu toggle
- Feedback widget with form submission
- Collection lookup with dynamic results
- Smooth scroll for anchor links
- External link warnings

### CSS Architecture
- Base styles in styles.css
- Service-specific layout in service-landing.css
- Inline styles for page-specific needs (price boxes, collection schedules)
- Responsive design (mobile-first approach)
- Consistent color scheme using CSS variables

## Content Principles

### Plain English
- Short sentences and paragraphs
- Active voice ("We collect your bins every week")
- No jargon or unnecessary technical terms
- Clear action words ("Check", "Report", "Subscribe")

### User-Focused
- "You" and "your" throughout
- Benefits clearly stated ("Save money", "Protect environment")
- Consequences explained ("If we stopped collecting...")
- Help readily available

### Scannable
- Bullet points for lists
- Headings for sections
- Bold for key facts
- White space between sections
- Visual icons for quick recognition

## Next Steps

### Pages to Complete
Additional pages referenced but not yet built:
- Missed collection report form
- Order/replace bin form
- Bulky waste booking
- Recycling centres
- Assisted collections
- Putting bins out detailed guide
- Contaminated recycling
- Special waste pages (batteries, textiles, hazardous)

### API Development
Connect pages to Azure Functions:
- Collection day lookup (UPRN/postcode → dates)
- Address lookup (postcode → addresses with UPRNs)
- Missed collection submission
- Garden waste subscription

### Content Enhancements
- Add downloadable PDF guides
- Create kitchen posters
- Build collection calendar (iCal/PDF)
- Christmas collection dates page
- Service update system

## Files Summary

```
/bins/
├── index.html (Landing page - service hub)
├── what-goes-where.html (Recycling guidance)
├── collection-day.html (Collection lookup)
└── garden-waste.html (Subscription service)
```

All files use:
- Consistent templates (service-landing-template.html structure)
- Shared CSS (styles.css + service-landing.css)
- Shared JavaScript (main.js)
- Same footer and navigation
- Feedback widgets
- Breadcrumb navigation

## Best Practice Wins

✓ Task-based not department-based navigation
✓ Maximum 2-click rule enforced
✓ AI-readable with Schema.org + data attributes
✓ WCAG AAA accessibility
✓ Mobile-responsive design
✓ Clear pricing and value propositions
✓ Comprehensive FAQs
✓ Multiple contact channels
✓ Related services cross-linked
✓ Feedback collection on every page

This foundation provides a solid, scalable structure that can be extended to cover all bin and recycling services while maintaining consistency and high usability standards.
