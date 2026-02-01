/**
 * UI MODULE
 * Handles all rendering, animations, and visual feedback
 */

const UI = (function() {
    'use strict';

    // Compliment engine for positive feedback
    const compliments = [
        "Nice!", "You've got this!", "Brilliant!", "Spot on!",
        "That's GCSE-level thinking!", "You've got the pattern!",
        "Excellent!", "Keep it up!", "Amazing!", "Perfect!",
        "You're on fire!", "Chemistry genius!", "Nailed it!"
    ];

    const encouragements = [
        "Close — let's fix the idea.",
        "Good attempt — here's the key rule.",
        "Not quite, but you're thinking!",
        "Let's refine that answer.",
        "Nearly there!",
        "Good try! Check the hint."
    ];

    /**
     * Switch between screens with animation
     */
    function showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });

        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            targetScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Get a random compliment
     */
    function getRandomCompliment() {
        return compliments[Math.floor(Math.random() * compliments.length)];
    }

    /**
     * Get a random encouragement
     */
    function getRandomEncouragement() {
        return encouragements[Math.floor(Math.random() * encouragements.length)];
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
     * Render progress dots for rounds
     */
    function renderProgressDots(currentRound, totalRounds) {
        const container = document.getElementById('progress-dots');
        container.innerHTML = '';

        for (let i = 1; i <= totalRounds; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';

            if (i < currentRound) {
                dot.classList.add('completed');
            } else if (i === currentRound) {
                dot.classList.add('active');
            }

            container.appendChild(dot);
        }
    }

    /**
     * Update game header
     */
    function updateGameHeader(roundNum, deckTitle, score) {
        document.getElementById('current-round').textContent = roundNum;
        document.getElementById('deck-title').textContent = deckTitle;
        document.getElementById('current-score').textContent = score;
    }

    /**
     * Update timer display
     */
    function updateTimer(secondsRemaining, totalSeconds) {
        const timerBar = document.getElementById('timer-bar');
        const timerText = document.getElementById('timer-seconds');

        if (timerText) {
            timerText.textContent = secondsRemaining;
        }

        if (timerBar) {
            const percentage = (secondsRemaining / totalSeconds) * 100;
            timerBar.style.width = percentage + '%';

            // Change color based on time remaining
            timerBar.classList.remove('warning', 'danger');
            if (percentage < 30) {
                timerBar.classList.add('danger');
            } else if (percentage < 50) {
                timerBar.classList.add('warning');
            }
        }
    }

    /**
     * Render a single question in the single-question container
     */
    function renderSingleQuestion(question, index) {
        const container = document.getElementById('single-question-container');
        container.innerHTML = '';

        const card = document.createElement('div');
        card.className = 'question-card bounce-in';
        card.dataset.questionId = question.id;

        const numberEl = document.createElement('div');
        numberEl.className = 'question-number';
        numberEl.textContent = `Question ${index + 1}`;

        const promptEl = document.createElement('div');
        promptEl.className = 'question-prompt';
        promptEl.textContent = question.prompt;

        card.appendChild(numberEl);
        card.appendChild(promptEl);

        // Render input based on question type
        const inputEl = renderQuestionInput(question);
        card.appendChild(inputEl);

        container.appendChild(card);
    }

    /**
     * Render a single question card (legacy - for results)
     */
    function renderQuestionCard(question, index) {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.dataset.questionId = question.id;

        const numberEl = document.createElement('div');
        numberEl.className = 'question-number';
        numberEl.textContent = `Question ${index + 1}`;

        const promptEl = document.createElement('div');
        promptEl.className = 'question-prompt';
        promptEl.textContent = question.prompt;

        card.appendChild(numberEl);
        card.appendChild(promptEl);

        // Render input based on question type
        const inputEl = renderQuestionInput(question);
        card.appendChild(inputEl);

        return card;
    }

    /**
     * Render the appropriate input for a question type
     */
    function renderQuestionInput(question) {
        const container = document.createElement('div');
        container.className = 'question-input-container';

        switch (question.type) {
            case 'short_text_exact':
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'answer-input';
                input.placeholder = 'Type your answer...';
                input.dataset.questionId = question.id;
                input.setAttribute('aria-label', 'Your answer');
                container.appendChild(input);
                break;

            case 'single_choice':
                const choicesGrid = document.createElement('div');
                choicesGrid.className = 'choices-grid';
                // Shuffle options for variety
                const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
                shuffledOptions.forEach(option => {
                    const btn = document.createElement('button');
                    btn.type = 'button'; // Prevent form submission
                    btn.className = 'choice-btn';
                    btn.textContent = option;
                    btn.dataset.questionId = question.id;
                    btn.dataset.choice = option;
                    btn.setAttribute('role', 'radio');
                    btn.setAttribute('aria-checked', 'false');
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        handleSingleChoice(btn, question.id);
                    });
                    choicesGrid.appendChild(btn);
                });
                container.appendChild(choicesGrid);
                break;

            case 'multi_choice':
                const multiGrid = document.createElement('div');
                multiGrid.className = 'choices-grid';
                // Shuffle options for variety
                const shuffledMultiOptions = [...question.options].sort(() => Math.random() - 0.5);
                shuffledMultiOptions.forEach(option => {
                    const btn = document.createElement('button');
                    btn.type = 'button'; // Prevent form submission
                    btn.className = 'choice-btn';
                    btn.textContent = option;
                    btn.dataset.questionId = question.id;
                    btn.dataset.choice = option;
                    btn.setAttribute('role', 'checkbox');
                    btn.setAttribute('aria-checked', 'false');
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        handleMultiChoice(btn);
                    });
                    multiGrid.appendChild(btn);
                });
                container.appendChild(multiGrid);
                break;

            case 'ordering':
                const orderList = document.createElement('div');
                orderList.className = 'draggable-list';
                orderList.dataset.questionId = question.id;

                // Shuffle items for display
                const shuffled = [...question.items].sort(() => Math.random() - 0.5);

                shuffled.forEach((item, idx) => {
                    const itemWrapper = document.createElement('div');
                    itemWrapper.className = 'ordering-item-wrapper';

                    const itemEl = document.createElement('div');
                    itemEl.className = 'draggable-item';
                    itemEl.textContent = `${idx + 1}. ${item}`;
                    itemEl.draggable = true;
                    itemEl.dataset.value = item;
                    itemEl.dataset.index = idx;

                    // Drag and drop handlers (for desktop)
                    itemEl.addEventListener('dragstart', handleDragStart);
                    itemEl.addEventListener('dragover', handleDragOver);
                    itemEl.addEventListener('drop', handleDrop);
                    itemEl.addEventListener('dragend', handleDragEnd);

                    // Mobile-friendly controls
                    const controlsDiv = document.createElement('div');
                    controlsDiv.className = 'order-controls';

                    const upBtn = document.createElement('button');
                    upBtn.className = 'order-btn order-up';
                    upBtn.innerHTML = '▲';
                    upBtn.setAttribute('aria-label', 'Move up');
                    upBtn.type = 'button';
                    upBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        moveItemUp(itemWrapper, orderList);
                    });

                    const downBtn = document.createElement('button');
                    downBtn.className = 'order-btn order-down';
                    downBtn.innerHTML = '▼';
                    downBtn.setAttribute('aria-label', 'Move down');
                    downBtn.type = 'button';
                    downBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        moveItemDown(itemWrapper, orderList);
                    });

                    controlsDiv.appendChild(upBtn);
                    controlsDiv.appendChild(downBtn);

                    itemWrapper.appendChild(itemEl);
                    itemWrapper.appendChild(controlsDiv);
                    orderList.appendChild(itemWrapper);
                });
                container.appendChild(orderList);
                break;

            case 'match_pairs':
                const pairsContainer = document.createElement('div');
                pairsContainer.className = 'pairs-container';
                pairsContainer.dataset.questionId = question.id;

                const leftCol = document.createElement('div');
                leftCol.className = 'draggable-list left-column';

                const rightCol = document.createElement('div');
                rightCol.className = 'draggable-list right-column';

                // Shuffle right items
                const rightItems = [...question.pairs].map(p => p.right).sort(() => Math.random() - 0.5);

                question.pairs.forEach((pair, idx) => {
                    const leftItem = document.createElement('div');
                    leftItem.className = 'draggable-item';
                    leftItem.textContent = pair.left;
                    leftItem.dataset.leftValue = pair.left;
                    leftCol.appendChild(leftItem);
                });

                rightItems.forEach((right, idx) => {
                    const rightItem = document.createElement('div');
                    rightItem.className = 'draggable-item';
                    rightItem.textContent = right;
                    rightItem.draggable = true;
                    rightItem.dataset.rightValue = right;

                    rightItem.addEventListener('dragstart', handleDragStart);
                    rightCol.appendChild(rightItem);
                });

                // Make left items drop targets
                leftCol.querySelectorAll('.draggable-item').forEach(item => {
                    item.addEventListener('dragover', handleDragOver);
                    item.addEventListener('drop', handlePairDrop);
                });

                pairsContainer.appendChild(leftCol);
                pairsContainer.appendChild(rightCol);
                container.appendChild(pairsContainer);
                break;
        }

        return container;
    }

    /**
     * Handle single choice selection
     */
    function handleSingleChoice(clickedBtn, questionId) {
        // Deselect all choices for this question
        const allChoices = document.querySelectorAll(`[data-question-id="${questionId}"].choice-btn`);
        allChoices.forEach(btn => {
            btn.classList.remove('selected');
            btn.setAttribute('aria-checked', 'false');
        });

        // Select clicked choice
        clickedBtn.classList.add('selected');
        clickedBtn.setAttribute('aria-checked', 'true');
    }

    /**
     * Handle multi-choice selection
     */
    function handleMultiChoice(clickedBtn) {
        clickedBtn.classList.toggle('selected');
        const isSelected = clickedBtn.classList.contains('selected');
        clickedBtn.setAttribute('aria-checked', isSelected);
    }

    // Drag and drop state
    let draggedElement = null;

    function handleDragStart(e) {
        draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(e) {
        e.preventDefault();
        if (!draggedElement || draggedElement === e.target) return;

        // Get the wrapper elements
        const draggedWrapper = draggedElement.closest('.ordering-item-wrapper');
        const targetWrapper = e.target.closest('.ordering-item-wrapper');

        if (!draggedWrapper || !targetWrapper || draggedWrapper === targetWrapper) return;

        const parent = draggedWrapper.parentNode;
        const draggedIndex = Array.from(parent.children).indexOf(draggedWrapper);
        const targetIndex = Array.from(parent.children).indexOf(targetWrapper);

        if (draggedIndex < targetIndex) {
            parent.insertBefore(draggedWrapper, targetWrapper.nextSibling);
        } else {
            parent.insertBefore(draggedWrapper, targetWrapper);
        }

        // Renumber items
        renumberOrderItems(parent);
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
        draggedElement = null;
    }

    function handlePairDrop(e) {
        e.preventDefault();
        if (!draggedElement) return;

        const leftItem = e.target;
        const rightValue = draggedElement.dataset.rightValue;

        // Store the pairing
        leftItem.dataset.pairedWith = rightValue;

        // Visual feedback
        leftItem.textContent = `${leftItem.dataset.leftValue} → ${rightValue}`;
        leftItem.classList.add('paired');
    }

    /**
     * Move item up in ordering list (mobile-friendly)
     */
    function moveItemUp(itemWrapper, orderList) {
        const prev = itemWrapper.previousElementSibling;
        if (prev) {
            orderList.insertBefore(itemWrapper, prev);
            renumberOrderItems(orderList);
        }
    }

    /**
     * Move item down in ordering list (mobile-friendly)
     */
    function moveItemDown(itemWrapper, orderList) {
        const next = itemWrapper.nextElementSibling;
        if (next) {
            orderList.insertBefore(next, itemWrapper);
            renumberOrderItems(orderList);
        }
    }

    /**
     * Renumber items in ordering list
     */
    function renumberOrderItems(orderList) {
        const wrappers = orderList.querySelectorAll('.ordering-item-wrapper');
        wrappers.forEach((wrapper, idx) => {
            const itemEl = wrapper.querySelector('.draggable-item');
            const text = itemEl.dataset.value;
            itemEl.textContent = `${idx + 1}. ${text}`;
            itemEl.dataset.index = idx;
        });
    }

    /**
     * Get user answers from the current round
     */
    function getUserAnswers(questions) {
        const answers = {};

        questions.forEach(question => {
            const qId = question.id;

            switch (question.type) {
                case 'short_text_exact':
                    const input = document.querySelector(`.answer-input[data-question-id="${qId}"]`);
                    answers[qId] = input ? input.value.trim() : '';
                    break;

                case 'single_choice':
                    const selected = document.querySelector(`[data-question-id="${qId}"].choice-btn.selected`);
                    answers[qId] = selected ? selected.dataset.choice : '';
                    break;

                case 'multi_choice':
                    const selectedMulti = document.querySelectorAll(`[data-question-id="${qId}"].choice-btn.selected`);
                    answers[qId] = Array.from(selectedMulti).map(btn => btn.dataset.choice);
                    break;

                case 'ordering':
                    const orderList = document.querySelector(`.draggable-list[data-question-id="${qId}"]`);
                    if (orderList) {
                        const wrappers = Array.from(orderList.querySelectorAll('.ordering-item-wrapper'));
                        answers[qId] = wrappers.map(wrapper => {
                            const item = wrapper.querySelector('.draggable-item');
                            return item.dataset.value;
                        });
                    }
                    break;

                case 'match_pairs':
                    const pairsContainer = document.querySelector(`.pairs-container[data-question-id="${qId}"]`);
                    if (pairsContainer) {
                        const leftItems = pairsContainer.querySelectorAll('.left-column .draggable-item');
                        answers[qId] = Array.from(leftItems).map(item => ({
                            left: item.dataset.leftValue,
                            right: item.dataset.pairedWith || ''
                        }));
                    }
                    break;
            }
        });

        return answers;
    }

    /**
     * Render results for a round
     */
    function renderResults(results, questions) {
        const resultsContainer = document.getElementById('results-list');
        resultsContainer.innerHTML = '';

        let correctCount = 0;

        results.forEach((result, idx) => {
            const question = questions[idx];
            const item = document.createElement('div');
            item.className = `result-item ${result.correct ? 'correct' : 'incorrect'}`;

            const prompt = document.createElement('div');
            prompt.className = 'result-prompt';
            prompt.textContent = question.prompt;

            const status = document.createElement('div');
            status.className = `result-status ${result.correct ? 'correct' : 'incorrect'}`;

            if (result.correct) {
                correctCount++;
                status.innerHTML = `<span>✅ ${getRandomCompliment()}</span>`;
            } else {
                status.innerHTML = `<span>❌ ${getRandomEncouragement()}</span>`;
            }

            const feedback = document.createElement('div');
            feedback.className = 'result-feedback';
            feedback.textContent = result.feedback;

            if (result.hint) {
                const hint = document.createElement('div');
                hint.className = 'result-feedback';
                hint.textContent = `💡 ${result.hint}`;
                feedback.appendChild(hint);
            }

            item.appendChild(prompt);
            item.appendChild(status);
            item.appendChild(feedback);

            // Show one revision fact for correct answers
            if (result.correct && question.revisionFacts && question.revisionFacts.length > 0) {
                const fact = document.createElement('div');
                fact.className = 'result-feedback';
                fact.style.marginTop = '0.5rem';
                fact.style.fontStyle = 'normal';
                fact.textContent = `📚 ${question.revisionFacts[0]}`;
                item.appendChild(fact);
            }

            resultsContainer.appendChild(item);
        });

        // Update summary
        document.getElementById('correct-count').textContent = `${correctCount}/${results.length}`;

        return correctCount;
    }

    /**
     * Show revision card with facts
     */
    function showRevisionCard(questions) {
        const revisionCard = document.getElementById('revision-card');
        const factsList = document.getElementById('revision-facts');
        factsList.innerHTML = '';

        // Collect all revision facts from questions
        const allFacts = [];
        questions.forEach(q => {
            if (q.revisionFacts) {
                allFacts.push(...q.revisionFacts);
            }
        });

        // Pick 3 random facts
        const selectedFacts = [];
        const shuffled = [...allFacts].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(3, shuffled.length); i++) {
            selectedFacts.push(shuffled[i]);
        }

        if (selectedFacts.length > 0) {
            selectedFacts.forEach(fact => {
                const li = document.createElement('li');
                li.textContent = fact;
                factsList.appendChild(li);
            });
            revisionCard.style.display = 'block';
        } else {
            revisionCard.style.display = 'none';
        }
    }

    /**
     * Show final results screen
     */
    function showFinalResults(totalScore, correctCount, totalQuestions, bestStreak) {
        const isNewPB = Storage.isNewPersonalBest(totalScore);
        const pb = Math.max(totalScore, Storage.getPersonalBest());

        document.getElementById('final-score').textContent = totalScore;
        document.getElementById('final-pb').textContent = pb;
        document.getElementById('final-streak').textContent = bestStreak;
        document.getElementById('final-correct').textContent = `${correctCount}/${totalQuestions}`;

        // Celebration
        const celebrationEl = document.getElementById('final-celebration');
        if (isNewPB) {
            celebrationEl.textContent = '🏆';
            celebrationEl.classList.add('bounce-in');
            triggerConfetti();
        } else if (correctCount === totalQuestions) {
            celebrationEl.textContent = '🌟';
        } else if (correctCount / totalQuestions >= 0.8) {
            celebrationEl.textContent = '🎉';
        } else {
            celebrationEl.textContent = '👍';
        }

        showScreen('final-screen');
    }

    /**
     * Show improvement areas
     */
    function showImprovementAreas(missedTags) {
        const section = document.getElementById('improvement-section');
        const tagsContainer = document.getElementById('improvement-tags');
        tagsContainer.innerHTML = '';

        if (missedTags && missedTags.length > 0) {
            // Get unique tags
            const uniqueTags = [...new Set(missedTags)];

            // Format tags nicely
            const tagNames = {
                'reactivity_series': 'Reactivity Series',
                'water_reaction': 'Water Reactions',
                'acid_reaction': 'Acid Reactions',
                'displacement': 'Displacement',
                'redox': 'Redox',
                'extraction': 'Extraction',
                'practical': 'Practical Skills'
            };

            uniqueTags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'improvement-tag';
                tagEl.textContent = tagNames[tag] || tag;
                tagsContainer.appendChild(tagEl);
            });

            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    }

    /**
     * Trigger confetti animation
     */
    function triggerConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces = [];
        const numberOfPieces = 100;
        const colors = ['#FF6B9D', '#FFA500', '#9C27B0', '#2196F3', '#4CAF50'];

        for (let i = 0; i < numberOfPieces; i++) {
            pieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                rotation: Math.random() * 360,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 2 - 1,
                rotationSpeed: Math.random() * 5 - 2.5
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            pieces.forEach((piece, index) => {
                ctx.save();
                ctx.translate(piece.x, piece.y);
                ctx.rotate((piece.rotation * Math.PI) / 180);
                ctx.fillStyle = piece.color;
                ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
                ctx.restore();

                piece.y += piece.speedY;
                piece.x += piece.speedX;
                piece.rotation += piece.rotationSpeed;

                if (piece.y > canvas.height) {
                    pieces.splice(index, 1);
                }
            });

            if (pieces.length > 0) {
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        animate();
    }

    /**
     * Add visual feedback animation to element
     */
    function addFeedbackAnimation(element, type) {
        if (type === 'success') {
            element.classList.add('flash-success');
            setTimeout(() => element.classList.remove('flash-success'), 600);
        } else if (type === 'error') {
            element.classList.add('flash-error', 'shake');
            setTimeout(() => {
                element.classList.remove('flash-error', 'shake');
            }, 600);
        }
    }

    /**
     * Get current answer for single question
     */
    function getCurrentAnswer(question) {
        const qId = question.id;

        switch (question.type) {
            case 'short_text_exact':
                const input = document.querySelector(`.answer-input[data-question-id="${qId}"]`);
                return input ? input.value.trim() : '';

            case 'single_choice':
                const selected = document.querySelector(`[data-question-id="${qId}"].choice-btn.selected`);
                return selected ? selected.dataset.choice : '';

            case 'multi_choice':
                const selectedMulti = document.querySelectorAll(`[data-question-id="${qId}"].choice-btn.selected`);
                return Array.from(selectedMulti).map(btn => btn.dataset.choice);

            case 'ordering':
                const orderList = document.querySelector(`.draggable-list[data-question-id="${qId}"]`);
                if (orderList) {
                    const wrappers = Array.from(orderList.querySelectorAll('.ordering-item-wrapper'));
                    return wrappers.map(wrapper => {
                        const item = wrapper.querySelector('.draggable-item');
                        return item.dataset.value;
                    });
                }
                return [];

            case 'match_pairs':
                const pairsContainer = document.querySelector(`.pairs-container[data-question-id="${qId}"]`);
                if (pairsContainer) {
                    const leftItems = pairsContainer.querySelectorAll('.left-column .draggable-item');
                    return Array.from(leftItems).map(item => ({
                        left: item.dataset.leftValue,
                        right: item.dataset.pairedWith || ''
                    }));
                }
                return [];

            default:
                return '';
        }
    }

    /**
     * Show instant feedback after answer
     */
    function showInstantFeedback(isCorrect, message, pointsOrHint) {
        const feedbackEl = document.getElementById('instant-feedback');
        const contentEl = feedbackEl.querySelector('.feedback-content');
        const messageEl = feedbackEl.querySelector('.feedback-message');
        const pointsEl = feedbackEl.querySelector('.feedback-points');

        contentEl.className = `feedback-content ${isCorrect ? 'correct' : 'incorrect'}`;
        messageEl.textContent = message;
        pointsEl.textContent = pointsOrHint;

        feedbackEl.style.display = 'block';
    }

    /**
     * Hide instant feedback
     */
    function hideInstantFeedback() {
        const feedbackEl = document.getElementById('instant-feedback');
        feedbackEl.style.display = 'none';
    }

    /**
     * Update streak display
     */
    function updateStreakDisplay(streak) {
        const streakEl = document.getElementById('streak-display');
        const streakCount = document.getElementById('streak-count');

        if (streak >= 2) {
            streakCount.textContent = streak;
            streakEl.style.display = 'block';
            streakEl.classList.add('pulse');
            setTimeout(() => streakEl.classList.remove('pulse'), 500);
        } else {
            streakEl.style.display = 'none';
        }
    }

    /**
     * Update score display with animation
     */
    function updateScoreDisplay(score) {
        const scoreEl = document.getElementById('current-score');
        scoreEl.textContent = score;
        scoreEl.classList.add('pulse');
        setTimeout(() => scoreEl.classList.remove('pulse'), 500);
    }

    // Public API
    return {
        showScreen,
        updateHomeStats,
        renderProgressDots,
        updateGameHeader,
        updateTimer,
        renderQuestionCard,
        renderSingleQuestion,
        getUserAnswers,
        getCurrentAnswer,
        renderResults,
        showRevisionCard,
        showFinalResults,
        showImprovementAreas,
        triggerConfetti,
        addFeedbackAnimation,
        getRandomCompliment,
        getRandomEncouragement,
        showInstantFeedback,
        hideInstantFeedback,
        updateStreakDisplay,
        updateScoreDisplay
    };
})();

// Make it available globally
window.UI = UI;
