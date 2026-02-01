/**
 * MARKING MODULE
 * Handles strict answer validation with aliases and misconception detection
 * NO fuzzy matching, NO partial credit
 */

const Marking = (function() {
    'use strict';

    let aliasesData = null;
    let misconceptionsData = null;

    /**
     * Load aliases from JSON
     */
    async function loadAliases() {
        try {
            const response = await fetch('/_revision/JSON/aliases.json');
            aliasesData = await response.json();
            return true;
        } catch (e) {
            console.error('Failed to load aliases:', e);
            return false;
        }
    }

    /**
     * Load misconceptions from JSON
     */
    async function loadMisconceptions() {
        try {
            const response = await fetch('/_revision/JSON/misconceptions.json');
            misconceptionsData = await response.json();
            return true;
        } catch (e) {
            console.error('Failed to load misconceptions:', e);
            return false;
        }
    }

    /**
     * Initialize the marking module
     */
    async function init() {
        await Promise.all([loadAliases(), loadMisconceptions()]);
    }

    /**
     * Normalize text for comparison
     * - Trim whitespace
     * - Convert to lowercase
     * - Remove extra spaces
     * - Remove common punctuation at end
     */
    function normalizeText(text) {
        if (!text || typeof text !== 'string') return '';

        return text
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ')  // Collapse multiple spaces
            .replace(/[.,;!?]+$/, '');  // Remove trailing punctuation
    }

    /**
     * Check if answer matches using aliases
     * Returns normalized form if match found, null otherwise
     */
    function checkWithAliases(userAnswer, correctAnswers) {
        const normalized = normalizeText(userAnswer);

        // Direct match check
        for (const correct of correctAnswers) {
            if (normalizeText(correct) === normalized) {
                return correct;
            }
        }

        // Element symbol/name alias check
        if (aliasesData && aliasesData.elements) {
            for (const element of aliasesData.elements) {
                // Check if user answered with symbol or any alias
                const allForms = [
                    element.symbol,
                    element.name,
                    ...(element.aliases || [])
                ];

                const userMatchesElement = allForms.some(form =>
                    normalizeText(form) === normalized
                );

                if (userMatchesElement) {
                    // Check if any correct answer also matches this element
                    for (const correct of correctAnswers) {
                        const correctNorm = normalizeText(correct);
                        if (allForms.some(form => normalizeText(form) === correctNorm)) {
                            return correct;
                        }
                    }
                }
            }
        }

        // Spelling variants check
        if (aliasesData && aliasesData.spellingVariants) {
            for (const variant of aliasesData.spellingVariants) {
                const allSpellings = [
                    variant.preferredUK,
                    ...(variant.allowed || [])
                ];

                const userMatchesVariant = allSpellings.some(spelling =>
                    normalizeText(spelling) === normalized
                );

                if (userMatchesVariant) {
                    // Check if any correct answer matches this variant
                    for (const correct of correctAnswers) {
                        if (allSpellings.some(spelling =>
                            normalizeText(correct).includes(normalizeText(spelling))
                        )) {
                            return correct;
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * Check if answer is a known misconception
     * Returns misconception object if found, null otherwise
     */
    function checkMisconception(userAnswer, questionId) {
        if (!misconceptionsData || !misconceptionsData.items) {
            return null;
        }

        const normalized = normalizeText(userAnswer);

        for (const item of misconceptionsData.items) {
            // Check if this misconception applies to this question
            if (item.questionIds && item.questionIds.includes(questionId)) {
                if (normalizeText(item.pattern) === normalized) {
                    return {
                        whyWrong: item.whyWrong,
                        correctGuidance: item.correctGuidance
                    };
                }
            }
        }

        return null;
    }

    /**
     * Mark a short text answer (strict exact matching)
     */
    function markShortText(question, userAnswer) {
        const correctAnswers = question.correctAnswers || [];

        // Try direct match with aliases
        const match = checkWithAliases(userAnswer, correctAnswers);

        if (match) {
            return {
                correct: true,
                matchedAnswer: match,
                feedback: question.feedback.correct
            };
        }

        // Check for misconception
        const misconception = checkMisconception(userAnswer, question.id);

        if (misconception) {
            return {
                correct: false,
                feedback: misconception.whyWrong,
                hint: misconception.correctGuidance,
                isMisconception: true
            };
        }

        // Check for specific reject feedback
        if (question.rejectFeedback) {
            const normalized = normalizeText(userAnswer);
            for (const [wrongAnswer, feedback] of Object.entries(question.rejectFeedback)) {
                if (normalizeText(wrongAnswer) === normalized) {
                    return {
                        correct: false,
                        feedback: feedback,
                        hint: question.feedback.incorrect
                    };
                }
            }
        }

        // Generic incorrect
        return {
            correct: false,
            feedback: question.feedback.incorrect
        };
    }

    /**
     * Mark a single choice answer
     */
    function markSingleChoice(question, userAnswer) {
        const normalized = normalizeText(userAnswer);
        const correctNorm = normalizeText(question.correctAnswer);

        if (normalized === correctNorm) {
            return {
                correct: true,
                matchedAnswer: question.correctAnswer,
                feedback: question.feedback.correct
            };
        }

        // Check for misconception on incorrect answers
        const misconception = checkMisconception(userAnswer, question.id);

        if (misconception) {
            return {
                correct: false,
                feedback: misconception.whyWrong,
                hint: misconception.correctGuidance,
                isMisconception: true
            };
        }

        return {
            correct: false,
            feedback: question.feedback.incorrect
        };
    }

    /**
     * Mark a multi-choice answer
     */
    function markMultiChoice(question, userAnswers) {
        if (!Array.isArray(userAnswers)) {
            userAnswers = [userAnswers];
        }

        const userNorm = userAnswers.map(normalizeText).sort();
        const correctNorm = (question.correctAnswers || []).map(normalizeText).sort();

        // Must match exactly (same items, same count)
        if (userNorm.length !== correctNorm.length) {
            // Check for misconception in any of the selected answers
            for (const answer of userAnswers) {
                const misconception = checkMisconception(answer, question.id);
                if (misconception) {
                    return {
                        correct: false,
                        feedback: misconception.whyWrong,
                        hint: misconception.correctGuidance,
                        isMisconception: true
                    };
                }
            }

            return {
                correct: false,
                feedback: question.feedback.incorrect
            };
        }

        const allMatch = userNorm.every((ans, idx) => ans === correctNorm[idx]);

        if (allMatch) {
            return {
                correct: true,
                matchedAnswer: question.correctAnswers.join(', '),
                feedback: question.feedback.correct
            };
        }

        // Check for misconception in any of the selected answers
        for (const answer of userAnswers) {
            const misconception = checkMisconception(answer, question.id);
            if (misconception) {
                return {
                    correct: false,
                    feedback: misconception.whyWrong,
                    hint: misconception.correctGuidance,
                    isMisconception: true
                };
            }
        }

        return {
            correct: false,
            feedback: question.feedback.incorrect
        };
    }

    /**
     * Mark an ordering answer
     */
    function markOrdering(question, userOrder) {
        if (!Array.isArray(userOrder)) {
            return {
                correct: false,
                feedback: 'Invalid answer format'
            };
        }

        const userNorm = userOrder.map(normalizeText);
        const correctNorm = (question.correctOrder || []).map(normalizeText);

        // Must match exactly in order
        if (userNorm.length !== correctNorm.length) {
            return {
                correct: false,
                feedback: question.feedback.incorrect
            };
        }

        const allMatch = userNorm.every((ans, idx) => ans === correctNorm[idx]);

        if (allMatch) {
            return {
                correct: true,
                matchedAnswer: question.correctOrder.join(' → '),
                feedback: question.feedback.correct
            };
        }

        return {
            correct: false,
            feedback: question.feedback.incorrect
        };
    }

    /**
     * Mark a match pairs answer
     */
    function markMatchPairs(question, userPairs) {
        if (!Array.isArray(userPairs)) {
            return {
                correct: false,
                feedback: 'Invalid answer format'
            };
        }

        const correctPairs = question.pairs || [];

        // Check if all pairs match (order doesn't matter for pairs array)
        if (userPairs.length !== correctPairs.length) {
            return {
                correct: false,
                feedback: question.feedback.incorrect
            };
        }

        const allCorrect = correctPairs.every(correctPair => {
            return userPairs.some(userPair =>
                normalizeText(userPair.left) === normalizeText(correctPair.left) &&
                normalizeText(userPair.right) === normalizeText(correctPair.right)
            );
        });

        if (allCorrect) {
            return {
                correct: true,
                matchedAnswer: correctPairs.map(p => `${p.left} → ${p.right}`).join('; '),
                feedback: question.feedback.correct
            };
        }

        return {
            correct: false,
            feedback: question.feedback.incorrect
        };
    }

    /**
     * Mark any question based on its type
     */
    function markQuestion(question, userAnswer) {
        if (!question || !question.type) {
            return { correct: false, feedback: 'Invalid question' };
        }

        switch (question.type) {
            case 'short_text_exact':
                return markShortText(question, userAnswer);

            case 'single_choice':
                return markSingleChoice(question, userAnswer);

            case 'multi_choice':
                return markMultiChoice(question, userAnswer);

            case 'ordering':
                return markOrdering(question, userAnswer);

            case 'match_pairs':
                return markMatchPairs(question, userAnswer);

            case 'scenario_judgement':
                // For scenario judgement, treat as single choice
                return markSingleChoice(question, userAnswer);

            default:
                return { correct: false, feedback: 'Unknown question type' };
        }
    }

    /**
     * Get a hint for a question
     */
    function getHint(question) {
        return question.feedback?.incorrect || 'Try again!';
    }

    /**
     * Get revision facts for a question
     */
    function getRevisionFacts(question) {
        return question.revisionFacts || [];
    }

    // Public API
    return {
        init,
        markQuestion,
        getHint,
        getRevisionFacts,
        normalizeText
    };
})();

// Make it available globally
window.Marking = Marking;
