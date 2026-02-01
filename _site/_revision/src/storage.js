/**
 * STORAGE MODULE
 * Handles localStorage for personal best, stats, and game history
 */

const Storage = (function() {
    'use strict';

    const STORAGE_KEY = 'reactivity_rush_stats';

    // Default stats structure
    const defaultStats = {
        personalBest: 0,
        gamesPlayed: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        bestStreak: 0,
        lastPlayed: null,
        tagStats: {} // Track performance by tag
    };

    /**
     * Get all stats from localStorage
     */
    function getStats() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...defaultStats, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.warn('Failed to load stats from localStorage:', e);
        }
        return { ...defaultStats };
    }

    /**
     * Save stats to localStorage
     */
    function saveStats(stats) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
            return true;
        } catch (e) {
            console.warn('Failed to save stats to localStorage:', e);
            return false;
        }
    }

    /**
     * Update stats after a game
     */
    function updateAfterGame(score, correctCount, totalQuestions, streak, missedTags) {
        const stats = getStats();

        stats.gamesPlayed++;
        stats.totalCorrect += correctCount;
        stats.totalQuestions += totalQuestions;
        stats.lastPlayed = new Date().toISOString();

        // Update personal best
        if (score > stats.personalBest) {
            stats.personalBest = score;
        }

        // Update best streak
        if (streak > stats.bestStreak) {
            stats.bestStreak = streak;
        }

        // Update tag stats (for improvement tracking)
        if (missedTags && Array.isArray(missedTags)) {
            missedTags.forEach(tag => {
                if (!stats.tagStats[tag]) {
                    stats.tagStats[tag] = { missed: 0, total: 0 };
                }
                stats.tagStats[tag].missed++;
                stats.tagStats[tag].total++;
            });
        }

        saveStats(stats);
        return stats;
    }

    /**
     * Get personal best score
     */
    function getPersonalBest() {
        return getStats().personalBest;
    }

    /**
     * Get games played count
     */
    function getGamesPlayed() {
        return getStats().gamesPlayed;
    }

    /**
     * Get accuracy percentage
     */
    function getAccuracy() {
        const stats = getStats();
        if (stats.totalQuestions === 0) return 0;
        return Math.round((stats.totalCorrect / stats.totalQuestions) * 100);
    }

    /**
     * Get tags that need improvement (most frequently missed)
     */
    function getImprovementTags(limit = 5) {
        const stats = getStats();
        const tagStats = stats.tagStats;

        // Sort by missed count
        const sorted = Object.entries(tagStats)
            .sort((a, b) => b[1].missed - a[1].missed)
            .slice(0, limit)
            .map(([tag]) => tag);

        return sorted;
    }

    /**
     * Reset all stats (for testing or user request)
     */
    function resetStats() {
        saveStats({ ...defaultStats });
        return true;
    }

    /**
     * Check if this is a new personal best
     */
    function isNewPersonalBest(score) {
        return score > getPersonalBest();
    }

    // Public API
    return {
        getStats,
        saveStats,
        updateAfterGame,
        getPersonalBest,
        getGamesPlayed,
        getAccuracy,
        getImprovementTags,
        resetStats,
        isNewPersonalBest
    };
})();

// Make it available globally
window.Storage = Storage;
