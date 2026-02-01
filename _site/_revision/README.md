# ⚡ Reactivity Rush

A super fun, colorful, high-energy educational game for **AQA GCSE Chemistry - Reactivity of Metals**.

Built with vanilla HTML/CSS/JavaScript. No frameworks, no build step, no server required.

## 🎮 Features

- **5 Rounds of Fast-Paced Learning**: Each game consists of 5 themed rounds
- **Multiple Question Types**: Short text, single choice, multi-choice, ordering, matching pairs
- **Strict Marking System**: No fuzzy matching - answers must be exact (with approved aliases)
- **Positive Feedback**: Encouraging messages and celebratory animations
- **Personal Best Tracking**: localStorage-based score tracking
- **Mobile-First Design**: Fully responsive and optimized for phones and tablets
- **Accessibility**: Keyboard navigation, ARIA labels, reduced motion support
- **Misconception Detection**: Intelligent feedback for common chemistry errors

## 🚀 How to Run Locally

### Option 1: Direct File Opening
1. Navigate to the `_site/_revision/` directory
2. Open `index.html` in a modern web browser

### Option 2: Local Server (Recommended)
Since the game loads JSON files, you'll get the best experience with a local server:

```bash
# Using Python 3
cd _site/_revision
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js http-server
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

## 📁 Project Structure

```
_site/_revision/
├── index.html              # Main HTML file
├── styles.css              # Arcade-style CSS
├── README.md              # This file
├── src/
│   ├── app.js             # Game state & flow control
│   ├── ui.js              # Rendering & animations
│   ├── marking.js         # Answer validation engine
│   └── storage.js         # localStorage management
└── JSON/
    ├── questionbank.json      # All questions
    ├── rounddeck.json         # Deck/round definitions
    ├── aliases.json           # Element aliases & spelling variants
    └── misconceptions.json    # Common misconceptions
```

## 📝 How to Add New Questions

Questions are stored in `JSON/questionbank.json`.

### Question Structure

Each question must have:
- `id`: Unique identifier
- `type`: Question type (see below)
- `prompt`: The question text
- `feedback`: Object with `correct` and `incorrect` messages
- `tags`: Array of topic tags (for revision tracking)
- `revisionFacts`: Array of 3 educational facts

### Question Types

#### 1. Short Text (Exact Match)
```json
{
  "id": "my-question-id",
  "type": "short_text_exact",
  "prompt": "What gas is produced when metals react with acids?",
  "correctAnswers": ["hydrogen", "hydrogen gas", "H2"],
  "rejectFeedback": {
    "oxygen": "Not oxygen! That's a different gas test."
  },
  "feedback": {
    "correct": "Perfect! Metal + acid → salt + hydrogen.",
    "incorrect": "Hint: Think about the squeaky pop test."
  },
  "tags": ["acid_reaction"],
  "revisionFacts": [
    "Metal + acid → salt + hydrogen gas",
    "Test for hydrogen: lit splint makes a squeaky pop",
    "Only metals above hydrogen in the series react with acids"
  ]
}
```

#### 2. Single Choice
```json
{
  "id": "my-choice-question",
  "type": "single_choice",
  "prompt": "Which metal is most reactive?",
  "options": ["Copper", "Zinc", "Potassium", "Iron"],
  "correctAnswer": "Potassium",
  "feedback": {
    "correct": "Yes! Potassium is highly reactive.",
    "incorrect": "Check the reactivity series."
  },
  "tags": ["reactivity_series"],
  "revisionFacts": [...]
}
```

#### 3. Multi-Choice
```json
{
  "id": "multi-question",
  "type": "multi_choice",
  "prompt": "Select all metals that react with water:",
  "options": ["Sodium", "Copper", "Potassium", "Gold"],
  "correctAnswers": ["Sodium", "Potassium"],
  "feedback": {...},
  "tags": ["water_reaction"],
  "revisionFacts": [...]
}
```

#### 4. Ordering
```json
{
  "id": "order-question",
  "type": "ordering",
  "prompt": "Order these metals from most to least reactive:",
  "items": ["copper", "zinc", "potassium", "iron"],
  "correctOrder": ["potassium", "zinc", "iron", "copper"],
  "feedback": {...},
  "tags": ["reactivity_series"],
  "revisionFacts": [...]
}
```

#### 5. Match Pairs
```json
{
  "id": "match-question",
  "type": "match_pairs",
  "prompt": "Match each test to its positive result:",
  "pairs": [
    {"left": "Hydrogen test", "right": "Squeaky pop"},
    {"left": "Oxygen test", "right": "Relights glowing splint"}
  ],
  "feedback": {...},
  "tags": ["practical"],
  "revisionFacts": [...]
}
```

## 🎲 How to Add New Decks/Rounds

Decks are stored in `JSON/rounddeck.json`.

### Deck Structure

```json
{
  "id": "deck-my-new-deck",
  "title": "My Awesome Round",
  "themeTags": ["reactivity_series", "water_reaction"],
  "difficulty": "both",
  "round": {
    "timerSeconds": 60,
    "numberOfPrompts": 6,
    "uniqueness": "on"
  },
  "promptIds": [
    "question-id-1",
    "question-id-2",
    "question-id-3"
  ]
}
```

### Deck Properties

- **id**: Unique deck identifier
- **title**: Display name for the round
- **themeTags**: Topics covered (for filtering)
- **difficulty**:
  - `"foundation"` - Foundation tier only
  - `"higher"` - Higher tier only
  - `"both"` - Available in all modes
- **round.timerSeconds**: Time limit (default: 60)
- **round.numberOfPrompts**: How many questions to show
- **promptIds**: Array of question IDs from questionbank.json

## 🔤 Managing Aliases

Aliases are stored in `JSON/aliases.json`.

### Element Aliases

```json
{
  "name": "sodium",
  "symbol": "Na",
  "aliases": ["Sodium", "na"]
}
```

This allows students to answer with "sodium", "Na", "Sodium", or "na" - all will be marked correct.

### Spelling Variants

```json
{
  "preferredUK": "aluminium",
  "allowed": ["aluminum"]
}
```

Both UK and US spellings will be accepted.

## 🚫 Managing Misconceptions

Misconceptions are stored in `JSON/misconceptions.json`.

### Misconception Structure

```json
{
  "pattern": "Reduction is loss of electrons.",
  "whyWrong": "In electron-transfer redox, reduction is GAIN of electrons.",
  "correctGuidance": "Use OILRIG: Reduction Is Gain (of electrons).",
  "questionIds": ["reduction-electrons-definition"]
}
```

When a student types exactly this misconception, they'll get the tailored `whyWrong` message instead of generic feedback.

## 🎨 Customization

### Changing Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary: #FF6B9D;      /* Main pink */
    --secondary: #C94277;    /* Dark pink */
    --accent: #FFA500;       /* Orange */
    --success: #4CAF50;      /* Green */
    --warning: #FF9800;      /* Amber */
    --danger: #F44336;       /* Red */
}
```

### Changing Game Settings

Edit `src/app.js`:

```javascript
const gameState = {
    totalRounds: 5,  // Change number of rounds per game
    // ...
};
```

## 📊 Score System

- **Base Points**: +2 per correct answer
- **Speed Bonus**:
  - +3 if >50% time remaining
  - +2 if 25-50% time remaining
  - +1 if <25% time remaining
- **Streak Bonus**: +1 for every 3 correct answers in a row

## 🧪 Testing the Game

1. **Question Coverage**: Check all question types work:
   - Short text: `hydrogen-test`
   - Single choice: `metals-form-what-ions`
   - Multi-choice: `group1-common-observation-first-three`
   - Ordering: `reactivity-series-order`
   - Match pairs: `alumina-products-cathode-anode`

2. **Difficulty Modes**: Try Foundation, Higher, and Mixed

3. **Mobile**: Test on actual mobile devices or use browser DevTools

4. **Accessibility**:
   - Navigate with keyboard (Tab, Enter)
   - Test with screen reader
   - Enable "Reduce motion" in OS settings

## 🐛 Troubleshooting

### Questions Not Loading
- Check browser console for errors
- Ensure JSON files are valid (use JSONLint.com)
- Verify file paths are correct

### Timer Not Working
- Must use a local server (not file://)
- Check browser console for errors

### Answers Marked Wrong When Correct
- Check `correctAnswers` array in question
- Add variant to `aliases.json`
- Check spelling and capitalization

### Personal Best Not Saving
- Check localStorage is enabled in browser
- Some browsers block localStorage in private/incognito mode

## 📱 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

Requires: ES6+ support, localStorage, CSS Grid

## 📄 License

Educational use only. Created for AQA GCSE Chemistry students.

## 🎓 Credits

Built with passion for education.

Game mechanics inspired by Scattergories and arcade quiz games.

---

**Have fun learning chemistry! ⚗️✨**
