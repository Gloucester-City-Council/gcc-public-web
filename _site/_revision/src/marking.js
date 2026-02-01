/**
 * MARKING MODULE - Duolingo Style
 * Handles answer validation for new question types
 */

const Marking = (function() {
    'use strict';

    /**
     * Normalize text for comparison
     */
    function normalizeText(text) {
        if (!text || typeof text !== 'string') return '';
        return text.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,;!?]+$/, '');
    }

    /**
     * Mark fill_blank questions
     * Checks against acceptVariations array
     */
    function markFillBlank(question, userAnswer) {
        const normalized = normalizeText(userAnswer);
        const variations = question.acceptVariations || [question.correctAnswer];

        const isCorrect = variations.some(variant =>
            normalizeText(variant) === normalized
        );

        return {
            correct: isCorrect,
            correctAnswer: question.correctAnswer,
            feedback: isCorrect ?
                "Correct!" :
                question.explanation?.why || "Not quite right",
            tip: question.explanation?.tip || ""
        };
    }

    /**
     * Mark fill_sentence questions
     * Checks for required keywords in any order
     */
    function markFillSentence(question, userAnswer) {
        const normalized = normalizeText(userAnswer);
        const keywords = question.requiredKeywords || [];

        const hasAllKeywords = keywords.every(keyword =>
            normalized.includes(normalizeText(keyword))
        );

        return {
            correct: hasAllKeywords,
            correctAnswer: question.correctAnswer,
            feedback: hasAllKeywords ?
                "Perfect!" :
                question.explanation?.why || "Make sure to include all key points",
            tip: question.explanation?.tip || ""
        };
    }

    /**
     * Mark multiple_choice questions
     * Exact match required
     */
    function markMultipleChoice(question, userAnswer) {
        const isCorrect = normalizeText(userAnswer) === normalizeText(question.correctAnswer);

        return {
            correct: isCorrect,
            correctAnswer: question.correctAnswer,
            feedback: isCorrect ?
                "Excellent!" :
                question.explanation?.why || "Not the right answer",
            tip: question.explanation?.tip || ""
        };
    }

    /**
     * Mark word_bank questions
     * Constructed answer must match
     */
    function markWordBank(question, userAnswer) {
        const isCorrect = normalizeText(userAnswer) === normalizeText(question.correctAnswer);

        return {
            correct: isCorrect,
            correctAnswer: question.correctAnswer,
            feedback: isCorrect ?
                "Well done!" :
                question.explanation?.why || "Check the order and words used",
            tip: question.explanation?.tip || ""
        };
    }

    /**
     * Mark ordering questions
     * Order must match exactly
     */
    function markOrdering(question, userOrder) {
        if (!Array.isArray(userOrder) || !Array.isArray(question.correctOrder)) {
            return {
                correct: false,
                correctAnswer: question.correctOrder?.join(' → ') || '',
                feedback: "Invalid answer format",
                tip: ""
            };
        }

        const isCorrect = userOrder.length === question.correctOrder.length &&
            userOrder.every((item, index) =>
                normalizeText(item) === normalizeText(question.correctOrder[index])
            );

        return {
            correct: isCorrect,
            correctAnswer: question.correctOrder.join(' → '),
            feedback: isCorrect ?
                "Perfect order!" :
                question.explanation?.why || "Not quite the right order",
            tip: question.explanation?.tip || ""
        };
    }

    /**
     * Mark select_all questions
     * All correct answers must be selected, no extras
     */
    function markSelectAll(question, userAnswers) {
        if (!Array.isArray(userAnswers)) {
            userAnswers = [userAnswers];
        }

        const correctAnswers = question.correctAnswers || [question.correctAnswer];

        const userNorm = userAnswers.map(normalizeText).sort();
        const correctNorm = correctAnswers.map(normalizeText).sort();

        const isCorrect = userNorm.length === correctNorm.length &&
            userNorm.every((ans, idx) => ans === correctNorm[idx]);

        return {
            correct: isCorrect,
            correctAnswer: correctAnswers.join(', '),
            feedback: isCorrect ?
                "All correct!" :
                question.explanation?.why || "Make sure you select all correct answers",
            tip: question.explanation?.tip || ""
        };
    }

    /**
     * Main marking function
     * Routes to appropriate marker based on question type
     */
    function markQuestion(question, userAnswer) {
        if (!question || !question.type) {
            return {
                correct: false,
                feedback: 'Invalid question',
                correctAnswer: '',
                tip: ''
            };
        }

        switch (question.type) {
            case 'fill_blank':
                return markFillBlank(question, userAnswer);

            case 'fill_sentence':
                return markFillSentence(question, userAnswer);

            case 'multiple_choice':
                return markMultipleChoice(question, userAnswer);

            case 'word_bank':
                return markWordBank(question, userAnswer);

            case 'ordering':
                return markOrdering(question, userAnswer);

            case 'select_all':
                return markSelectAll(question, userAnswers);

            default:
                return {
                    correct: false,
                    feedback: 'Unknown question type: ' + question.type,
                    correctAnswer: question.correctAnswer || '',
                    tip: ''
                };
        }
    }

    // Public API
    return {
        markQuestion,
        normalizeText
    };
})();

// Make it available globally
window.Marking = Marking;
