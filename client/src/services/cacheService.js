// Helper to update Board data in Cache Storage (for Online -> Offline consistency)
import api from './api';

const CACHE_NAME = 'api-boards-cache';

// Helper to get base URL consistently
const getBaseUrl = () => {
    return (api && api.defaults && api.defaults.baseURL) 
        ? api.defaults.baseURL 
        : (import.meta.env.VITE_API_BASE_URL || '/api');
};

const getCache = async () => {
    if (!('caches' in window)) return null;
    return await caches.open(CACHE_NAME);
};

const getBoardUrl = (boardId) => {
    const base = getBaseUrl();
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
    return `${cleanBase}/boards/${boardId}`;
};

const getBoardsListUrl = () => {
    const base = getBaseUrl();
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
    return `${cleanBase}/boards`;
};

/**
 * Updates a specific board in the cache using a mutator function.
 * @param {string} boardId 
 * @param {function} mutatorFn - Function that takes (board) and returns updated board, or modifies it in place.
 */
export const updateBoardInCache = async (boardId, mutatorFn) => {
    try {
        const cache = await getCache();
        if (!cache) return;

        const url = getBoardUrl(boardId);
        const response = await cache.match(url);
        
        if (response) {
            const board = await response.json();
            const updatedBoard = mutatorFn(board) || board; // Allow return or in-place
            
            await cache.put(url, new Response(JSON.stringify(updatedBoard), {
                headers: { 'Content-Type': 'application/json' }
            }));
            console.log(`[CacheService] Updated board ${boardId}`);
        }
    } catch (error) {
        console.warn('[CacheService] Failed to update board cache:', error);
    }
};

/**
 * Updates the list of boards in the cache.
 * @param {function} mutatorFn - Function that takes (boardsList) and returns updated list.
 */
export const updateBoardsListCache = async (mutatorFn) => {
    try {
        const cache = await getCache();
        if (!cache) return;

        const url = getBoardsListUrl();
        const response = await cache.match(url);
        
        if (response) {
            const boardsList = await response.json();
            const updatedList = mutatorFn(boardsList) || boardsList;
            
            await cache.put(url, new Response(JSON.stringify(updatedList), {
                headers: { 'Content-Type': 'application/json' }
            }));
            console.log('[CacheService] Updated boards list cache');
        }
    } catch (error) {
        console.warn('[CacheService] Failed to update boards list cache:', error);
    }
};
