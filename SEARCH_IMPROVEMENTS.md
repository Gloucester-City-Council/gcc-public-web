# Search Functionality Improvements

**Date**: 2026-01-08
**Status**: Implemented
**Author**: Claude Code Review

## Summary of Changes

This document details the improvements made to the search functionality across the static site frontend and provides recommendations for corresponding API changes.

---

## Frontend Changes Implemented

### 1. HTML Structure (`_site/index.html`)

#### Changes Made
- **Wrapped search in container**: Added `.search-wrapper` div to contain both the search form and results
- **Removed form action**: Changed from `action="/search"` to no action (JS-only search)
- **Added ARIA attributes**:
  - `aria-controls="search-results"` on input
  - `aria-expanded="false"` on input (managed dynamically by JS)
  - `aria-autocomplete="list"` on input
  - `autocomplete="off"` to prevent browser autocomplete
  - `role="region"` on results container
  - `aria-label="Search results"` on results container

#### Impact
- Better accessibility for screen reader users
- Clear relationship between search input and results
- Progressive enhancement foundation (can add fallback later if needed)

---

### 2. CSS Updates (`_site/assets/css/styles.css`)

#### Changes Made
- **Floating overlay positioning**:
  ```css
  .search-wrapper {
      position: relative;
      flex-grow: 1;
      max-width: 600px;
  }

  .search-results {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      right: 0;
      z-index: 1000;
      max-height: 400px;
      overflow-y: auto;
  }
  ```

- **Added loading state**:
  ```css
  .search-results__loading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-weight: 600;
  }

  .search-results__loading::before {
      content: "";
      width: 16px;
      height: 16px;
      border: 2px solid #e2e8f0;
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
  }
  ```

- **Mobile responsive**: Results constrained to `60vh` max-height on mobile

#### Impact
- Search results now float over content instead of pushing it down
- Better UX with loading spinner
- Proper z-index layering prevents content overlap
- Scrollable results for long result sets

---

### 3. JavaScript Enhancements (`_site/assets/js/search-api.js`)

#### Changes Made

1. **Fixed hardcoded endpoint**:
   ```javascript
   // Before:
   const searchEndpoint = 'https://gccpublicliteapi-c3dsa8fmg7g3eydv.westeurope-01.azurewebsites.net/api/search/search';

   // After:
   const searchEndpoint = `${apiBaseUrl}/api/search/search`;
   ```

2. **Added loading state**:
   - New `showLoading()` function displays spinner before API call
   - Shows "Searching..." message with animated spinner

3. **ARIA state management**:
   - Updates `aria-expanded` on input when showing/hiding results
   - Proper screen reader announcements via `aria-live="polite"`

4. **Keyboard navigation**:
   - ↓ Arrow from input moves focus to first result
   - ↑/↓ Arrows navigate between results
   - ↑ Arrow from first result returns focus to input
   - Escape key closes results and returns focus to input

5. **Click-outside-to-close**:
   - Clicking anywhere outside search wrapper closes results
   - Standard UX pattern matching major search implementations

#### Impact
- Fully keyboard accessible
- Better UX with immediate feedback
- Consistent with other API endpoints (uses centralized config)
- Standard interaction patterns reduce cognitive load

---

## API Recommendations

### Critical: Update Response Format (If Needed)

The frontend expects this response structure:

```json
[
  {
    "title": "Page Title",
    "url": "https://gloucester.gov.uk/page",
    "snippet": "Highlighted excerpt showing search term in context...",
    "description": "Alternative to snippet if not provided"
  }
]
```

Or:

```json
{
  "results": [
    { "title": "...", "url": "...", "snippet": "..." }
  ]
}
```

**Action Required**: Verify your API returns one of these formats. The frontend checks for:
1. Array of results directly
2. `data.results` array
3. `data.items` array

---

## Chunk Processing Recommendations

### Current State

**Build Process** (`scripts/search/search-index.js`):
```javascript
// Currently MERGES all chunks per URL into single document
const byUrl = new Map();
for (const line of lines) {
  const rec = JSON.parse(line);
  const url = rec.url;
  // ... merges chunks ...
  entry.text = combined.slice(0, MAX_TEXT_CHARS_PER_PAGE); // 20,000 chars
}
```

**Issues**:
1. Loses chunk precision from RAG corpus
2. Character-based truncation (not token-based)
3. Can't identify which section of long page matched
4. Makes snippet generation less accurate

---

### Recommended: Chunk-Level Indexing

#### Option A: Keep Chunks Separate (Recommended)

**Benefits**:
- More precise search results
- Better snippet generation (show matching chunk)
- Better ranking (score individual chunks)
- No arbitrary truncation

**Build Process Change**:
```javascript
// scripts/search/search-index.js
const docs = [];
for (const line of lines) {
  const rec = JSON.parse(line);
  docs.push({
    id: rec.id,                    // e.g., "https://...#chunk=0"
    url: rec.url,                  // e.g., "https://..."
    title: rec.title,
    text: rec.text,                // Single chunk, not merged
    chunk_index: rec.chunk_index
  });
}

miniSearch.addAll(docs);
```

**API Changes Required**:

1. **Search Index Loading**: No change needed - just load and use MiniSearch as before

2. **Result Processing**: Group results by URL and select best chunk
   ```javascript
   // In your API endpoint
   const searchResults = miniSearch.search(query);

   // Group by URL and pick best match per page
   const byUrl = new Map();
   for (const result of searchResults) {
     const url = result.url; // Without #chunk=N
     if (!byUrl.has(url) || result.score > byUrl.get(url).score) {
       byUrl.set(url, {
         title: result.title,
         url: result.url,
         snippet: extractSnippet(result.text, query),
         score: result.score,
         chunk_index: result.chunk_index
       });
     }
   }

   return Array.from(byUrl.values())
     .sort((a, b) => b.score - a.score)
     .slice(0, limit);
   ```

3. **Snippet Generation**: Use the matched chunk text
   ```javascript
   function extractSnippet(text, query, maxLength = 200) {
     const terms = query.toLowerCase().split(/\s+/);
     const lowerText = text.toLowerCase();

     // Find first match position
     let bestPos = -1;
     let bestTerm = '';
     for (const term of terms) {
       const pos = lowerText.indexOf(term);
       if (pos !== -1 && (bestPos === -1 || pos < bestPos)) {
         bestPos = pos;
         bestTerm = term;
       }
     }

     if (bestPos === -1) {
       // No match found, return start of text
       return text.slice(0, maxLength) + '...';
     }

     // Extract context around match
     const start = Math.max(0, bestPos - 80);
     const end = Math.min(text.length, bestPos + maxLength - 80);
     let snippet = text.slice(start, end);

     // Add ellipsis
     if (start > 0) snippet = '...' + snippet;
     if (end < text.length) snippet = snippet + '...';

     // Highlight search terms (optional, depends on frontend)
     // terms.forEach(term => {
     //   const regex = new RegExp(`(${term})`, 'gi');
     //   snippet = snippet.replace(regex, '<mark>$1</mark>');
     // });

     return snippet.trim();
   }
   ```

---

#### Option B: Keep Current Merging (Simpler)

If you prefer to keep the current approach, at least improve:

1. **Use token-based truncation** instead of character-based:
   ```javascript
   // In search-index.js
   import { get_encoding } from "@dqbd/tiktoken";
   const encoding = get_encoding("cl100k_base");

   const MAX_TOKENS_PER_PAGE = 5000; // Instead of MAX_TEXT_CHARS_PER_PAGE

   function truncateToTokens(text, maxTokens) {
     const tokens = encoding.encode(text);
     if (tokens.length <= maxTokens) return text;

     const truncated = encoding.decode(tokens.slice(0, maxTokens));
     return truncated;
   }

   // Then use:
   entry.text = truncateToTokens(combined, MAX_TOKENS_PER_PAGE);
   ```

2. **Improve snippet generation in API**:
   - Extract text around first occurrence of search term
   - Show "..." context around match
   - Highlight matching terms (optional)

---

## API Performance Considerations

### Caching Strategy

The `reload` parameter in the frontend suggests caching might be implemented:

```javascript
if (form.dataset.reload) {
    params.set('reload', form.dataset.reload);
}
```

**Recommendations**:

1. **Cache search index in memory**:
   - Load MiniSearch index on API startup
   - Keep in memory for fast searches
   - Reload when index files change

2. **Use `reload` parameter**:
   - Add `?reload=true` to bypass cache
   - Useful for testing/debugging
   - Could be exposed as admin feature

3. **Monitor index file changes**:
   ```javascript
   // Example in Node.js
   const fs = require('fs');
   const indexPath = '/path/to/index.json';

   let miniSearchInstance = loadIndex(indexPath);
   let lastModified = fs.statSync(indexPath).mtime;

   // Check on each search or periodically
   function getMiniSearch() {
     const currentModified = fs.statSync(indexPath).mtime;
     if (currentModified > lastModified) {
       miniSearchInstance = loadIndex(indexPath);
       lastModified = currentModified;
     }
     return miniSearchInstance;
   }
   ```

---

## Testing Checklist

### Frontend Testing

- [ ] Search input shows loading spinner when typing
- [ ] Results appear as floating overlay (not pushing content down)
- [ ] Results are scrollable if more than 400px tall
- [ ] Click outside search closes results
- [ ] Escape key closes results and returns focus to input
- [ ] Arrow down from input moves to first result
- [ ] Arrow up/down navigates between results
- [ ] Arrow up from first result returns to input
- [ ] Screen reader announces "Searching..." then result count
- [ ] Mobile: Results constrained to 60vh, still scrollable
- [ ] Focus indicators visible and high contrast
- [ ] Works without JavaScript (shows appropriate message or 404)

### API Testing

- [ ] Returns results in expected format
- [ ] Snippets show context around search terms
- [ ] Results ordered by relevance (score)
- [ ] Handles special characters in query
- [ ] Handles empty query gracefully
- [ ] Handles very long query gracefully
- [ ] Rate limiting works correctly
- [ ] Token validation works
- [ ] Returns within acceptable time (<500ms ideal, <1s acceptable)
- [ ] Handles concurrent requests correctly
- [ ] Cache invalidation works when index updates

### Integration Testing

- [ ] End-to-end: Type query → See results → Click result → Navigate to page
- [ ] Search with 0 results shows appropriate message
- [ ] Search with 100+ results shows first 10, scrollable
- [ ] Search with special characters (quotes, apostrophes, etc.)
- [ ] Search with multiple words
- [ ] Search with partial words (if supported)

---

## Deployment Notes

### Files Modified
1. `_site/index.html` - HTML structure
2. `_site/assets/css/styles.css` - Styles and animations
3. `_site/assets/js/search-api.js` - JavaScript behavior

### API Changes Needed
- **No breaking changes** to existing API
- **Optional improvements**:
  - Implement chunk-level indexing (recommended)
  - Improve snippet generation
  - Add caching layer
  - Monitor index file changes

### Rollback Plan
If issues arise, revert these commits:
```bash
git revert <commit-hash>
```

All changes are backwards compatible with existing API responses.

---

## Future Enhancements

### Short Term
1. Add search suggestions/autocomplete
2. Add recent searches (localStorage)
3. Track search analytics (what users search for)
4. Add "no results" suggestions (typo correction, alternatives)

### Medium Term
1. Add filters (by service category, content type)
2. Add search highlighting on result pages
3. Add "Did you mean...?" for typos
4. Add search result previews on hover

### Long Term
1. Implement vector search for semantic matching
2. Add personalization based on user history
3. Add voice search support
4. Add advanced search operators (AND, OR, NOT, quotes)

---

## Questions & Answers

### Q: Why remove the form action attribute?
**A**: The form action was `/search` but no such page exists. Since we're doing JS-only search, removing it makes the behavior clearer. If you want a fallback, create `_site/search/index.html`.

### Q: Will this work without JavaScript?
**A**: Currently no - search requires JS. To add fallback:
1. Keep `action="/search"` on form
2. Create static search page with instruction to enable JS
3. Or implement server-side search on that endpoint

### Q: What about the `data-reload` parameter?
**A**: It's currently unused. Document it or remove it. Suggested use: cache busting for testing.

### Q: Why chunk-level indexing instead of page-level?
**A**: Better precision, better snippets, better ranking. Trade-off is slightly larger index and more complex result processing. If you have short pages (<20k chars), current approach is fine.

### Q: How do I test the changes locally?
**A**:
1. Ensure API is running and accessible
2. Open `_site/index.html` in browser
3. Type search query
4. Check browser console for any errors
5. Test keyboard navigation and click-outside behavior

---

## Support & Feedback

If you have questions or issues with these changes:

1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check API response format matches expected structure
4. Test with different queries (short, long, special chars)
5. Review this document's testing checklist

For API-specific issues, verify:
- Search index files exist and are valid JSON
- MiniSearch library is loaded correctly
- Snippet generation handles edge cases
- Response format matches frontend expectations

---

## Appendix: Complete API Response Examples

### Minimal Valid Response
```json
[
  {
    "title": "Bin Collection Day",
    "url": "https://gloucester.gov.uk/bins/collection-day.html"
  }
]
```

### Optimal Response (With Snippets)
```json
[
  {
    "title": "Check your bin collection day",
    "url": "https://gloucester.gov.uk/bins/collection-day.html",
    "snippet": "Enter your postcode to find out which bins are collected when at your property.",
    "score": 4.2
  },
  {
    "title": "Report a missed collection",
    "url": "https://gloucester.gov.uk/bins/missed-collection.html",
    "snippet": "We'll return within 2 working days to collect your bin. This service is quick and easy.",
    "score": 3.8
  }
]
```

### Alternative Format (Also Supported)
```json
{
  "results": [
    {
      "title": "Bin Collection Day",
      "url": "https://gloucester.gov.uk/bins/collection-day.html",
      "description": "Find your collection day and set up reminders"
    }
  ],
  "total": 1,
  "query": "bin collection"
}
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-08
**Next Review**: After API implementation
