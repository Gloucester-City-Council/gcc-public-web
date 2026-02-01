/**
 * REACTIVITY RUSH - MAIN APP MODULE
 * Game state management and flow control
 */

(function() {
    'use strict';

    // Game Data
    let questionBank = [];
    let deckBank = [];
    let soundEnabled = false;
    let timerEnabled = true;

    // Game State
    const gameState = {
        difficulty: 'mixed',
        currentRound: 0,
        totalRounds: 5,
        currentDeck: null,
        currentQuestions: [],
        currentQuestionIndex: 0,
        currentAnswers: {},
        roundResults: [],
        score: 0,
        correctCount: 0,
        totalQuestions: 0,
        currentStreak: 0,
        bestStreak: 0,
        missedTags: [],
        roundStartTime: null,
        timerInterval: null,
        secondsRemaining: 60
    };

    /**
     * Initialize the app
     */
    async function init() {
        console.log('🚀 Reactivity Rush - Initializing...');

        // Load data
        await loadGameData();

        // Initialize modules
        await Marking.init();

        // Set up event listeners
        setupEventListeners();

        // Update home screen
        UI.updateHomeStats();

        console.log('✅ Reactivity Rush - Ready!');
    }

    /**
     * Load question bank and deck data
     */
    async function loadGameData() {
        try {
            const [questionsResponse, decksResponse] = await Promise.all([
                fetch('/_revision/JSON/questionbank.json'),
                fetch('/_revision/JSON/rounddeck.json')
            ]);

            const questionsData = await questionsResponse.json();
            const decksData = await decksResponse.json();

            questionBank = questionsData.questions || [];
            deckBank = decksData.decks || [];

            console.log(`Loaded ${questionBank.length} questions and ${deckBank.length} decks`);
        } catch (error) {
            console.error('Failed to load game data:', error);
            alert('Failed to load game data. Please refresh the page.');
        }
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Home screen
        document.getElementById('play-btn').addEventListener('click', startGame);

        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => selectDifficulty(e.target));
        });

        // Sound toggle
        document.getElementById('sound-toggle').addEventListener('click', toggleSound);

        // Timer toggle
        document.getElementById('timer-toggle').addEventListener('click', toggleTimer);

        // Game screen
        document.getElementById('submit-answer-btn').addEventListener('click', submitCurrentAnswer);
        document.getElementById('continue-btn').addEventListener('click', continueToNextQuestion);

        // Results screen
        document.getElementById('next-round-btn').addEventListener('click', nextRound);

        // Final screen
        document.getElementById('play-again-btn').addEventListener('click', startGame);
        document.getElementById('home-btn').addEventListener('click', () => {
            UI.showScreen('home-screen');
            UI.updateHomeStats();
        });
    }

    /**
     * Select difficulty
     */
    function selectDifficulty(clickedBtn) {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });

        clickedBtn.classList.add('active');
        clickedBtn.setAttribute('aria-pressed', 'true');
        gameState.difficulty = clickedBtn.dataset.difficulty;
    }

    /**
     * Toggle sound
     */
    function toggleSound() {
        soundEnabled = !soundEnabled;
        const icon = document.getElementById('sound-icon');
        icon.textContent = soundEnabled ? '🔊' : '🔇';
    }

    /**
     * Toggle timer
     */
    function toggleTimer() {
        timerEnabled = !timerEnabled;
        const btn = document.getElementById('timer-toggle');
        const icon = document.getElementById('timer-icon');

        if (timerEnabled) {
            btn.classList.add('active');
            icon.textContent = '⏱️';
        } else {
            btn.classList.remove('active');
            icon.textContent = '⏱️';
        }
    }

    /**
     * Start a new game
     */
    function startGame() {
        // Reset game state
        gameState.currentRound = 0;
        gameState.score = 0;
        gameState.correctCount = 0;
        gameState.totalQuestions = 0;
        gameState.currentStreak = 0;
        gameState.bestStreak = 0;
        gameState.missedTags = [];

        // Start first round
        nextRound();
    }

    /**
     * Start the next round
     */
    function nextRound() {
        gameState.currentRound++;

        // Check if game is complete
        if (gameState.currentRound > gameState.totalRounds) {
            endGame();
            return;
        }

        // Reset for new round
        gameState.currentQuestionIndex = 0;
        gameState.roundResults = [];

        // Select a deck for this round
        selectDeck();

        // Load questions for the deck
        loadRoundQuestions();

        // Render the game screen
        renderGameScreen();

        // Start timer
        startTimer();

        // Show game screen
        UI.showScreen('game-screen');
    }

    /**
     * Select a deck based on difficulty
     */
    function selectDeck() {
        let availableDecks = deckBank.filter(deck => {
            if (gameState.difficulty === 'mixed') {
                return deck.difficulty === 'both' || deck.difficulty === 'foundation' || deck.difficulty === 'higher';
            }
            return deck.difficulty === gameState.difficulty || deck.difficulty === 'both';
        });

        if (availableDecks.length === 0) {
            availableDecks = deckBank;
        }

        // Pick a random deck
        const randomIndex = Math.floor(Math.random() * availableDecks.length);
        gameState.currentDeck = availableDecks[randomIndex];
    }

    /**
     * Load questions for the current deck
     */
    function loadRoundQuestions() {
        const deck = gameState.currentDeck;
        const promptIds = deck.promptIds || [];

        gameState.currentQuestions = [];

        // Get questions from the question bank
        promptIds.forEach(promptId => {
            const question = questionBank.find(q => q.id === promptId);
            if (question) {
                gameState.currentQuestions.push(question);
            }
        });

        // ALWAYS shuffle questions for variety
        gameState.currentQuestions = gameState.currentQuestions.sort(() => Math.random() - 0.5);

        // Limit to deck's numberOfPrompts
        const numberOfPrompts = deck.round?.numberOfPrompts || 6;
        if (gameState.currentQuestions.length > numberOfPrompts) {
            gameState.currentQuestions = gameState.currentQuestions.slice(0, numberOfPrompts);
        }

        gameState.totalQuestions += gameState.currentQuestions.length;
    }

    /**
     * Render the current single question
     */
    function renderGameScreen() {
        const deck = gameState.currentDeck;

        // Update header
        UI.updateGameHeader(
            gameState.currentRound,
            deck.title || 'Round ' + gameState.currentRound,
            gameState.score
        );

        // Update question progress
        document.getElementById('question-current').textContent = gameState.currentQuestionIndex + 1;
        document.getElementById('question-total').textContent = gameState.currentQuestions.length;

        // Render current question
        const currentQuestion = gameState.currentQuestions[gameState.currentQuestionIndex];
        UI.renderSingleQuestion(currentQuestion, gameState.currentQuestionIndex);

        // Update streak display
        UI.updateStreakDisplay(gameState.currentStreak);
    }

    /**
     * Start the round timer
     */
    function startTimer() {
        const timerSeconds = gameState.currentDeck.round?.timerSeconds || 60;
        gameState.roundStartTime = Date.now();

        // Clear any existing timer
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }

        // If timer is disabled, hide timer bar and set infinite time
        if (!timerEnabled) {
            gameState.secondsRemaining = 999999;
            const timerContainer = document.querySelector('.timer-bar-container');
            if (timerContainer) {
                timerContainer.style.display = 'none';
            }
            return;
        }

        // Show timer bar
        const timerContainer = document.querySelector('.timer-bar-container');
        if (timerContainer) {
            timerContainer.style.display = 'flex';
        }

        gameState.secondsRemaining = timerSeconds;

        // Update timer display
        UI.updateTimer(gameState.secondsRemaining, timerSeconds);

        // Start countdown
        gameState.timerInterval = setInterval(() => {
            gameState.secondsRemaining--;

            if (gameState.secondsRemaining <= 0) {
                clearInterval(gameState.timerInterval);
                gameState.secondsRemaining = 0;
                endRound(); // Auto-end round when timer runs out
            }

            UI.updateTimer(gameState.secondsRemaining, timerSeconds);
        }, 1000);
    }

    /**
     * Submit the current answer
     */
    function submitCurrentAnswer() {
        const currentQuestion = gameState.currentQuestions[gameState.currentQuestionIndex];

        // Get user answer for current question
        const userAnswer = UI.getCurrentAnswer(currentQuestion);

        // Mark the answer
        const result = Marking.markQuestion(currentQuestion, userAnswer);

        // Store result
        gameState.roundResults.push({
            question: currentQuestion,
            userAnswer: userAnswer,
            ...result
        });

        // Update score and streak
        if (result.correct) {
            gameState.correctCount++;
            gameState.currentStreak++;
            if (gameState.currentStreak > gameState.bestStreak) {
                gameState.bestStreak = gameState.currentStreak;
            }

            // Award points (+2 base)
            const points = 2;
            gameState.score += points;

            // Show instant success feedback
            UI.showInstantFeedback(true, UI.getRandomCompliment(), `+${points} points`);
        } else {
            gameState.currentStreak = 0;

            // Track missed tags
            if (currentQuestion.tags) {
                gameState.missedTags.push(...currentQuestion.tags);
            }

            // Show instant feedback with hint and correct answer
            const correctAnswerText = result.correctAnswer || 'N/A';
            const hintText = result.hint ? `${result.hint}\n\n✓ Correct answer: ${correctAnswerText}` : `✓ Correct answer: ${correctAnswerText}`;
            UI.showInstantFeedback(false, result.feedback, hintText);
        }

        // Update streak display
        UI.updateStreakDisplay(gameState.currentStreak);

        // Update score display with animation
        UI.updateScoreDisplay(gameState.score);
    }

    /**
     * Continue to next question (after viewing feedback)
     */
    function continueToNextQuestion() {
        UI.hideInstantFeedback();
        moveToNextQuestion();
    }

    /**
     * Move to the next question or end round
     */
    function moveToNextQuestion() {
        gameState.currentQuestionIndex++;

        if (gameState.currentQuestionIndex >= gameState.currentQuestions.length) {
            // Round complete
            endRound();
        } else {
            // Render next question
            renderGameScreen();
        }
    }

    /**
     * End the current round and show results
     */
    function endRound() {
        // Stop timer
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }

        // Show round results
        showRoundResults(gameState.roundResults, gameState.score);
    }

    // Marking is now done per-question in submitCurrentAnswer()
    // Points are calculated per-question (+2 base)

    /**
     * Show round results
     */
    function showRoundResults(results, totalScore) {
        // Render results
        const questions = gameState.currentQuestions;
        const correctCount = UI.renderResults(results, questions);

        // Calculate round points (just for display)
        const roundPoints = results.filter(r => r.correct).length * 2;

        // Update points display
        document.getElementById('round-points').textContent = roundPoints;

        // Show revision card
        UI.showRevisionCard(questions);

        // Update button text
        const nextBtn = document.getElementById('next-round-btn');
        if (gameState.currentRound >= gameState.totalRounds) {
            nextBtn.textContent = 'See Final Results';
        } else {
            nextBtn.textContent = 'Next Round';
        }

        // Show results screen
        UI.showScreen('results-screen');
    }

    /**
     * End the game and show final results
     */
    function endGame() {
        // Update storage
        Storage.updateAfterGame(
            gameState.score,
            gameState.correctCount,
            gameState.totalQuestions,
            gameState.bestStreak,
            gameState.missedTags
        );

        // Show improvement areas
        UI.showImprovementAreas(gameState.missedTags);

        // Show final results
        UI.showFinalResults(
            gameState.score,
            gameState.correctCount,
            gameState.totalQuestions,
            gameState.bestStreak
        );
    }

    /**
     * Handle visibility change (pause timer when tab not visible)
     */
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && gameState.timerInterval) {
            // Pause timer when tab is hidden
            clearInterval(gameState.timerInterval);
        } else if (!document.hidden && gameState.timerInterval === null && gameState.currentRound > 0) {
            // Resume timer when tab is visible again (if in a round)
            // For simplicity, we won't resume - instead keep it paused
        }
    });

    /**
     * Handle keyboard shortcuts
     */
    document.addEventListener('keydown', (e) => {
        // Enter to submit (when on game screen)
        if (e.key === 'Enter' && document.getElementById('game-screen').classList.contains('active')) {
            const submitBtn = document.getElementById('submit-round-btn');
            if (submitBtn && !submitBtn.disabled) {
                e.preventDefault();
                submitBtn.click();
            }
        }

        // Enter to continue (when on results screen)
        if (e.key === 'Enter' && document.getElementById('results-screen').classList.contains('active')) {
            const nextBtn = document.getElementById('next-round-btn');
            if (nextBtn) {
                e.preventDefault();
                nextBtn.click();
            }
        }
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
