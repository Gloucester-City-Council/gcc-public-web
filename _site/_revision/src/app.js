/**
 * CHEMISTRY QUIZ - Duolingo Style
 * Simplified game flow with new question types
 */

(function() {
    'use strict';

    // Game Data
    let questionBank = [];
    let soundEnabled = false;

    // Game State
    const gameState = {
        currentQuestions: [],
        currentQuestionIndex: 0,
        score: 0,
        correctCount: 0,
        currentStreak: 0,
        bestStreak: 0,
        questionsPerSession: 10
    };

    /**
     * Initialize the app
     */
    async function init() {
        console.log('🎮 Chemistry Quiz - Duolingo Style!');
        await loadGameData();
        setupEventListeners();
        UI.updateHomeStats();
        console.log('✅ Ready!');
    }

    /**
     * Load question bank
     */
    async function loadGameData() {
        try {
            const response = await fetch('/_revision/JSON/questionbank.json');
            const data = await response.json();
            questionBank = data.questions || [];
            console.log(`✅ Loaded ${questionBank.length} questions`);
        } catch (error) {
            console.error('Failed to load questions:', error);
            alert('Failed to load questions. Please refresh.');
        }
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        document.getElementById('play-btn').addEventListener('click', startGame);
        document.getElementById('play-again-btn')?.addEventListener('click', startGame);
        document.getElementById('sound-toggle').addEventListener('click', toggleSound);
        document.getElementById('submit-answer-btn').addEventListener('click', submitCurrentAnswer);
        document.getElementById('continue-btn').addEventListener('click', continueToNextQuestion);
        document.getElementById('home-btn')?.addEventListener('click', () => {
            UI.showScreen('home-screen');
        });
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
        // Reset state
        gameState.currentQuestionIndex = 0;
        gameState.score = 0;
        gameState.correctCount = 0;
        gameState.currentStreak = 0;
        gameState.bestStreak = 0;

        // Pick random questions
        gameState.currentQuestions = pickRandomQuestions(gameState.questionsPerSession);

        // Show first question
        renderCurrentQuestion();
        UI.updateScoreDisplay(gameState.score);
        UI.updateStreakDisplay(gameState.currentStreak);
        UI.showScreen('game-screen');
    }

    /**
     * Pick random questions from the bank
     */
    function pickRandomQuestions(count) {
        const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * Render the current question
     */
    function renderCurrentQuestion() {
        const question = gameState.currentQuestions[gameState.currentQuestionIndex];
        const progress = gameState.currentQuestionIndex + 1;
        const total = gameState.currentQuestions.length;

        UI.renderQuestion(question, progress, total);
    }

    /**
     * Submit the current answer
     */
    function submitCurrentAnswer() {
        const question = gameState.currentQuestions[gameState.currentQuestionIndex];
        const userAnswer = UI.getCurrentAnswer(question);

        // Mark the answer
        const result = Marking.markQuestion(question, userAnswer);

        // Update score and streak
        if (result.correct) {
            gameState.score += 2;
            gameState.correctCount++;
            gameState.currentStreak++;
            if (gameState.currentStreak > gameState.bestStreak) {
                gameState.bestStreak = gameState.currentStreak;
            }
            UI.showInstantFeedback(true, result.feedback, `+2 points • ${result.tip}`);
        } else {
            gameState.currentStreak = 0;
            const hintText = `✓ Answer: ${result.correctAnswer}\n\n📖 ${result.feedback}\n\n💡 ${result.tip}`;
            UI.showInstantFeedback(false, "Not quite!", hintText);
        }

        UI.updateScoreDisplay(gameState.score);
        UI.updateStreakDisplay(gameState.currentStreak);
    }

    /**
     * Continue to next question
     */
    function continueToNextQuestion() {
        UI.hideInstantFeedback();
        gameState.currentQuestionIndex++;

        if (gameState.currentQuestionIndex >= gameState.currentQuestions.length) {
            endGame();
        } else {
            renderCurrentQuestion();
        }
    }

    /**
     * End the game
     */
    function endGame() {
        const accuracy = Math.round((gameState.correctCount / gameState.currentQuestions.length) * 100);

        UI.showFinalScreen({
            score: gameState.score,
            correctCount: gameState.correctCount,
            totalQuestions: gameState.currentQuestions.length,
            accuracy: accuracy,
            bestStreak: gameState.bestStreak
        });

        // Update stats
        Storage.updateStats({
            score: gameState.score,
            accuracy: accuracy,
            streak: gameState.bestStreak
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
