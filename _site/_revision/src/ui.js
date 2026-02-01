/**
 * UI MODULE - Duolingo Style
 * Renders all question types and handles interactions
 */

const UI = (function() {
    'use strict';

    /**
     * Show a screen
     */
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.add('active');
    }

    /**
     * Update home screen stats
     */
    function updateHomeStats() {
        const pb = Storage.getPersonalBest();
        const games = Storage.getGamesPlayed();
        document.getElementById('home-pb').textContent = pb;
        document.getElementById('home-games').textContent = games;
    }

    /**
     * Update score display
     */
    function updateScoreDisplay(score) {
        document.getElementById('score-value').textContent = score;
    }

    /**
     * Update streak display
     */
    function updateStreakDisplay(streak) {
        const streakEl = document.getElementById('streak-display');
        streakEl.textContent = streak > 0 ? `🔥 ${streak}` : '';
    }

    /**
     * Render a question based on its type
     */
    function renderQuestion(question, progress, total) {
        const container = document.getElementById('single-question-container');
        container.innerHTML = '';

        // Progress indicator
        const progressEl = document.createElement('div');
        progressEl.className = 'question-progress';
        progressEl.textContent = `Question ${progress}/${total}`;
        container.appendChild(progressEl);

        // Question card
        const card = document.createElement('div');
        card.className = 'question-card';

        // Topic badge
        if (question.topic) {
            const badge = document.createElement('div');
            badge.className = 'topic-badge';
            badge.textContent = question.topic;
            card.appendChild(badge);
        }

        // Question prompt
        const promptEl = document.createElement('h2');
        promptEl.className = 'question-prompt';
        promptEl.textContent = question.prompt;
        card.appendChild(promptEl);

        // Render answer area based on type
        const answerArea = document.createElement('div');
        answerArea.className = 'answer-area';
        answerArea.id = 'answer-area';

        switch (question.type) {
            case 'fill_blank':
                renderFillBlank(answerArea, question);
                break;
            case 'fill_sentence':
                renderFillSentence(answerArea, question);
                break;
            case 'multiple_choice':
                renderMultipleChoice(answerArea, question);
                break;
            case 'word_bank':
                renderWordBank(answerArea, question);
                break;
            case 'ordering':
                renderOrdering(answerArea, question);
                break;
            case 'select_all':
                renderSelectAll(answerArea, question);
                break;
        }

        card.appendChild(answerArea);
        container.appendChild(card);
    }

    /**
     * Render fill_blank question (single word input)
     */
    function renderFillBlank(container, question) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'answer-input';
        input.placeholder = 'Type your answer...';
        input.id = 'user-answer';
        container.appendChild(input);
    }

    /**
     * Render fill_sentence question (multi-word textarea)
     */
    function renderFillSentence(container, question) {
        const textarea = document.createElement('textarea');
        textarea.className = 'answer-textarea';
        textarea.placeholder = 'Type your answer...';
        textarea.rows = 3;
        textarea.id = 'user-answer';
        container.appendChild(textarea);
    }

    /**
     * Render multiple_choice question (buttons)
     */
    function renderMultipleChoice(container, question) {
        const options = question.options || [];
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = option;
            btn.type = 'button';
            btn.addEventListener('click', () => {
                document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
            container.appendChild(btn);
        });
    }

    /**
     * Render word_bank question (simplified - just text input for now)
     */
    function renderWordBank(container, question) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'answer-input';
        input.placeholder = 'Type the equation...';
        input.id = 'user-answer';
        container.appendChild(input);

        // Show word bank
        if (question.wordBank) {
            const bankEl = document.createElement('div');
            bankEl.className = 'word-bank';
            bankEl.innerHTML = '<p>Available words: ' + question.wordBank.join(', ') + '</p>';
            container.appendChild(bankEl);
        }
    }

    /**
     * Render ordering question
     */
    function renderOrdering(container, question) {
        const list = document.createElement('div');
        list.className = 'ordering-list';
        list.id = 'ordering-list';

        const items = [...(question.items || question.correctOrder || [])];
        items.sort(() => Math.random() - 0.5); // Shuffle

        items.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'ordering-item';
            itemEl.textContent = item;
            itemEl.dataset.value = item;

            // Up/down buttons
            const btnContainer = document.createElement('div');
            btnContainer.className = 'ordering-controls';

            const upBtn = document.createElement('button');
            upBtn.textContent = '▲';
            upBtn.className = 'order-btn';
            upBtn.type = 'button';
            upBtn.onclick = () => moveUp(itemEl);

            const downBtn = document.createElement('button');
            downBtn.textContent = '▼';
            downBtn.className = 'order-btn';
            downBtn.type = 'button';
            downBtn.onclick = () => moveDown(itemEl);

            btnContainer.appendChild(upBtn);
            btnContainer.appendChild(downBtn);
            itemEl.appendChild(btnContainer);

            list.appendChild(itemEl);
        });

        container.appendChild(list);
    }

    /**
     * Move item up in ordering list
     */
    function moveUp(item) {
        const prev = item.previousElementSibling;
        if (prev) item.parentNode.insertBefore(item, prev);
    }

    /**
     * Move item down in ordering list
     */
    function moveDown(item) {
        const next = item.nextElementSibling;
        if (next) item.parentNode.insertBefore(next, item);
    }

    /**
     * Render select_all question (checkboxes)
     */
    function renderSelectAll(container, question) {
        const options = question.options || question.correctAnswers || [];
        options.forEach(option => {
            const label = document.createElement('label');
            label.className = 'checkbox-label';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = option;
            checkbox.className = 'answer-checkbox';

            const span = document.createElement('span');
            span.textContent = option;

            label.appendChild(checkbox);
            label.appendChild(span);
            container.appendChild(label);
        });
    }

    /**
     * Get current answer based on question type
     */
    function getCurrentAnswer(question) {
        switch (question.type) {
            case 'fill_blank':
            case 'fill_sentence':
            case 'word_bank':
                const input = document.getElementById('user-answer');
                return input ? input.value.trim() : '';

            case 'multiple_choice':
                const selected = document.querySelector('.choice-btn.selected');
                return selected ? selected.textContent : '';

            case 'ordering':
                const items = document.querySelectorAll('.ordering-item');
                return Array.from(items).map(item => item.dataset.value);

            case 'select_all':
                const checkboxes = document.querySelectorAll('.answer-checkbox:checked');
                return Array.from(checkboxes).map(cb => cb.value);

            default:
                return '';
        }
    }

    /**
     * Show instant feedback
     */
    function showInstantFeedback(isCorrect, message, hint) {
        const feedback = document.getElementById('instant-feedback');
        const content = feedback.querySelector('.feedback-content');
        const messageEl = feedback.querySelector('.feedback-message');
        const hintEl = feedback.querySelector('.feedback-points');

        content.className = `feedback-content ${isCorrect ? 'correct' : 'incorrect'}`;
        messageEl.textContent = message;
        hintEl.textContent = hint;
        feedback.style.display = 'block';
    }

    /**
     * Hide instant feedback
     */
    function hideInstantFeedback() {
        document.getElementById('instant-feedback').style.display = 'none';
    }

    /**
     * Show final screen
     */
    function showFinalScreen(stats) {
        document.getElementById('final-score').textContent = stats.score;
        document.getElementById('final-correct').textContent = `${stats.correctCount}/${stats.totalQuestions}`;
        document.getElementById('final-accuracy').textContent = `${stats.accuracy}%`;
        document.getElementById('final-streak').textContent = stats.bestStreak;
        showScreen('final-screen');
    }

    // Public API
    return {
        showScreen,
        updateHomeStats,
        updateScoreDisplay,
        updateStreakDisplay,
        renderQuestion,
        getCurrentAnswer,
        showInstantFeedback,
        hideInstantFeedback,
        showFinalScreen
    };
})();

window.UI = UI;
