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

    // Game State
    const gameState = {
        difficulty: 'mixed',
        currentRound: 0,
        totalRounds: 5,
        currentDeck: null,
        currentQuestions: [],
        currentAnswers: {},
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
                fetch('./JSON/questionbank.json'),
                fetch('./JSON/rounddeck.json')
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

        // Game screen
        document.getElementById('submit-round-btn').addEventListener('click', submitRound);

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

        // Limit to deck's numberOfPrompts
        const numberOfPrompts = deck.round?.numberOfPrompts || 6;
        if (gameState.currentQuestions.length > numberOfPrompts) {
            // Shuffle and take the required number
            gameState.currentQuestions = gameState.currentQuestions
                .sort(() => Math.random() - 0.5)
                .slice(0, numberOfPrompts);
        }

        gameState.totalQuestions += gameState.currentQuestions.length;
    }

    /**
     * Render the game screen
     */
    function renderGameScreen() {
        const deck = gameState.currentDeck;

        // Update header
        UI.updateGameHeader(
            gameState.currentRound,
            deck.title || 'Round ' + gameState.currentRound,
            gameState.score
        );

        // Render progress dots
        UI.renderProgressDots(gameState.currentRound, gameState.totalRounds);

        // Render questions
        const container = document.getElementById('prompts-container');
        container.innerHTML = '';

        gameState.currentQuestions.forEach((question, idx) => {
            const card = UI.renderQuestionCard(question, idx);
            container.appendChild(card);
        });
    }

    /**
     * Start the round timer
     */
    function startTimer() {
        const timerSeconds = gameState.currentDeck.round?.timerSeconds || 60;
        gameState.secondsRemaining = timerSeconds;
        gameState.roundStartTime = Date.now();

        // Clear any existing timer
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }

        // Update timer display
        UI.updateTimer(gameState.secondsRemaining, timerSeconds);

        // Start countdown
        gameState.timerInterval = setInterval(() => {
            gameState.secondsRemaining--;

            if (gameState.secondsRemaining <= 0) {
                clearInterval(gameState.timerInterval);
                gameState.secondsRemaining = 0;
                submitRound(); // Auto-submit when timer runs out
            }

            UI.updateTimer(gameState.secondsRemaining, timerSeconds);
        }, 1000);
    }

    /**
     * Submit the current round for marking
     */
    function submitRound() {
        // Stop timer
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }

        // Get user answers
        const userAnswers = UI.getUserAnswers(gameState.currentQuestions);
        gameState.currentAnswers = userAnswers;

        // Mark answers
        const results = markRound(userAnswers);

        // Calculate points
        const points = calculatePoints(results);

        // Update game state
        gameState.score += points;

        // Show results
        showRoundResults(results, points);
    }

    /**
     * Mark all answers in the round
     */
    function markRound(userAnswers) {
        const results = [];

        gameState.currentQuestions.forEach(question => {
            const userAnswer = userAnswers[question.id];
            const result = Marking.markQuestion(question, userAnswer);

            // Track correct answers
            if (result.correct) {
                gameState.correctCount++;
                gameState.currentStreak++;

                if (gameState.currentStreak > gameState.bestStreak) {
                    gameState.bestStreak = gameState.currentStreak;
                }
            } else {
                gameState.currentStreak = 0;

                // Track missed tags for improvement
                if (question.tags) {
                    gameState.missedTags.push(...question.tags);
                }
            }

            results.push({
                question: question,
                userAnswer: userAnswer,
                ...result
            });
        });

        return results;
    }

    /**
     * Calculate points for the round
     */
    function calculatePoints(results) {
        let points = 0;

        // Base points: +2 per correct answer
        const correctCount = results.filter(r => r.correct).length;
        points += correctCount * 2;

        // Speed bonus: +0 to +3 based on time remaining
        const timerSeconds = gameState.currentDeck.round?.timerSeconds || 60;
        const timeRemaining = gameState.secondsRemaining;
        const timePercentage = timeRemaining / timerSeconds;

        if (timePercentage > 0.5) {
            points += 3; // Very fast
        } else if (timePercentage > 0.25) {
            points += 2; // Fast
        } else if (timePercentage > 0) {
            points += 1; // Some time left
        }

        // Streak bonus: +1 for every 3 correct in a row
        const streakBonus = Math.floor(gameState.currentStreak / 3);
        points += streakBonus;

        return points;
    }

    /**
     * Show round results
     */
    function showRoundResults(results, points) {
        // Render results
        const correctCount = UI.renderResults(results, gameState.currentQuestions);

        // Update points display
        document.getElementById('round-points').textContent = points;

        // Show revision card
        UI.showRevisionCard(gameState.currentQuestions);

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
