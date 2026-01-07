# bins2 - Best Practice Simplified Approach

This folder contains an alternative, simplified approach to bin pages following best practices from exemplar UK councils.

## Key Differences from `/bins/`

### **Problem with `/bins/` Structure:**

**Too many entry points:**
- `index.html` = Main hub with 6 quick actions + 8 category cards (40+ links)
- `bin-services.html` = Competing hub page for bins & containers

**Result:** Confusing user journey, unclear which page to start from

---

## **bins2 Solution: Clear Hierarchy**

### Single Clear Entry Point

**`index.html` - Simplified Bins Hub**
```
├─ 6 Top Tasks Only (Most Common 80% of User Needs)
│  1. Check your bin day
│  2. What goes in which bin
│  3. Report missed collection
│  4. Order bins & containers
│  5. Garden waste subscription
│  6. Find recycling centre
│
└─ Simple A-Z List ("Browse all bin services")
   └─ 8 services listed alphabetically
```

**Key Improvements:**
- ✅ **No competing hubs** - One clear starting point
- ✅ **6 tasks only** - Covers 80% of user needs (Pareto principle)
- ✅ **No category cards** - Removed confusing 8-category navigation
- ✅ **Simple fallback** - A-Z list for less common tasks
- ✅ **Maximum 1-2 clicks** - From home to any task

---

### Refocused Sub-Pages

**`order-bins.html` (was `bin-services.html`)**
- **Clear purpose:** Order/get bins for your property type
- **Not a competing hub:** Clearly a sub-page task
- **User situations maintained:** Still organized by home/flats/developers
- **Title changed:** "Order Bins & Containers" (not "All Your Bins & Containers")

---

## Best Practice Principles Applied

### 1. **Task-Based Not Department-Based** ✅
- Users think "Check my bin day" not "Collection services database"
- Every link is an action verb: Check, Order, Report, Find

### 2. **Maximum 2 Clicks Rule** ✅
```
Home (index.html) → Task Page → Complete
           ↓
   1 click to 80% of tasks
   2 clicks to 100% of tasks
```

### 3. **Progressive Disclosure** ✅
- Show 6 most common tasks prominently
- Hide less common tasks in simple A-Z list
- Prevents cognitive overload

### 4. **Single Source of Truth** ✅
- One bins hub (index.html)
- No duplicate navigation paths
- Clear information architecture

### 5. **Mobile-First Simplicity** ✅
- 6 cards scan faster than 14+ links
- Cleaner, less overwhelming interface
- Better for small screens

---

## Comparison Table

| Feature | `/bins/` | `/bins/` |
|---------|----------|-----------|
| **Entry points** | 2 (index + bin-services) | 1 (index only) |
| **Quick actions** | 6 | 6 |
| **Category cards** | 8 (with 4-5 links each) | 0 (removed) |
| **Total links on home** | 40+ | 14 (6 cards + 8 A-Z) |
| **Clicks to task** | 1-2 clicks | 1-2 clicks |
| **Clarity** | Confusing which hub to use | Clear single starting point |
| **bin-services role** | Competing hub page | Sub-page for ordering bins |

---

## User Journey Examples

### Scenario 1: "I need to check my bin day"
**`/bins/`:** index.html → Click "Check your bin day" (1 click) ✅
**`/bins/`:** index.html → Click "Check your bin day" (1 click) ✅

**Winner:** Tie (both 1 click)

---

### Scenario 2: "I'm new to Gloucester, how do I get bins?"
**`/bins/`:**
- Option A: index.html → "Order bins & containers" quick action → bin-services.html → "New to Gloucester" section (2 clicks)
- Option B: index.html → "Bins and containers" category → "All your bins & containers" link → bin-services.html (2 clicks)
- **Confusion:** Two paths to same destination

**`/bins/`:**
- index.html → "Order bins & containers" → order-bins.html → "New to Gloucester" section (1 click)

**Winner:** `/bins/` (clearer path, no confusion)

---

### Scenario 3: "I need assisted collections"
**`/bins/`:**
- Option A: index.html → Scroll to "Help and support" category → "Assisted bin collections" (2 clicks, requires scrolling past 7 categories)
- Option B: index.html → "Order bins & containers" → bin-services.html → See link in sidebar (2-3 clicks)

**`/bins/`:**
- index.html → Scroll to "Browse all" A-Z list → "Assisted collections" (1 click, list is visible without scrolling)

**Winner:** `/bins/` (faster, simpler)

---

## What We Kept (Good Practices)

✅ Task-based language
✅ User situation organization (home/flats/developers)
✅ Visual card design
✅ Clear CTAs and buttons
✅ Comprehensive service coverage
✅ Accessibility standards
✅ Links to Waste Wizard
✅ All existing detail pages (what-goes-where, collection-day, etc.)

---

## What We Changed (Improvements)

### Removed:
- ❌ 8 category cards on home page (too much choice)
- ❌ bin-services.html as competing hub
- ❌ Duplicate navigation paths

### Simplified:
- ✅ 6 top tasks prominently displayed
- ✅ Simple A-Z list for less common tasks
- ✅ Single clear entry point
- ✅ order-bins.html refocused as task page (not hub)

---

## Exemplar Council Alignment

### Rochdale Council (Exemplar)
- ✅ **6-8 top tasks on bins home** - bins2 matches
- ✅ **Simple navigation** - bins2 matches
- ✅ **Task-based** - bins2 matches

### Camden Council (Exemplar)
- ✅ **Clear "what goes in bins"** - bins2 has this
- ✅ **No category overload** - bins2 avoids this
- ✅ **Mobile-friendly** - bins2 optimized

### Brighton Council (Exemplar)
- ✅ **Progressive disclosure** - bins2 implements
- ✅ **A-Z fallback** - bins2 has this
- ✅ **Single purpose pages** - bins2 follows

---

## Metrics We Expect to Improve

1. **Task completion time** ⏱️
   - Fewer clicks to common tasks
   - No confusion about which page to start

2. **Bounce rate** 📉
   - Clearer purpose reduces user confusion
   - Better scent of information

3. **Mobile usability** 📱
   - Simpler page loads faster
   - Less scrolling required

4. **User satisfaction** 😊
   - Less cognitive load
   - Clearer pathways

---

## Recommendation

**Use `/bins/` approach** for the following reasons:

1. **Follows UK GOV.UK design principles**
2. **Matches exemplar council best practices**
3. **Simpler = faster = better UX**
4. **No competing navigation**
5. **Scales better for future services**
6. **Mobile-first friendly**

---

## Next Steps

1. User test both `/bins/` and `/bins/` approaches
2. Measure task completion rates
3. Gather user feedback on clarity
4. If `/bins/` performs better, migrate and archive `/bins/`

---

## Files in bins2

- `index.html` - Simplified bins hub (NEW APPROACH)
- `order-bins.html` - Order bins by property type (refocused bin-services.html)
- `collection-day.html` - Check bin day
- `what-goes-where.html` - Recycling guide
- `garden-waste.html` - Garden waste subscription
- `missed-collection.html` - Report missed collection
- `recycling-centres.html` - Find HRCs
- `assisted-collections.html` - Assisted collections
- `extra-or-larger-bin.html` - Extra/larger bin application

---

Created: December 2024
Approach: Best practice simplified structure
Status: Prototype for comparison testing
