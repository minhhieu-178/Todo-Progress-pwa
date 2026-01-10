import { openDB } from 'idb';

const getPendingRequests = async () => {
  const db = await openDB('offline-requests-db', 1);
  return await db.getAll('requests');
};

export const mergeBoardDataWithOffline = async (boardData) => {
  if (!boardData) return boardData;
  
  // Clone deep để không ảnh hưởng object gốc
  let mergedBoard = JSON.parse(JSON.stringify(boardData));
  const pendingRequests = await getPendingRequests();

  if (pendingRequests.length === 0) return mergedBoard;

  // Sắp xếp theo thời gian để replay lại hành động theo đúng thứ tự
  pendingRequests.sort((a, b) => a.timestamp - b.timestamp);

  for (const req of pendingRequests) {
    const { url, method, body } = req;
    
    // Parse body nếu nó là JSON string (do lưu trong IDB có thể bị stringify)
    let data = body;
    if (typeof body === 'string') {
        try { data = JSON.parse(body); } catch(e) {}
    }

    // --- LOGIC 1: Merge Create Board (Trường hợp boardData là object rỗng/fallback) ---
    // Nếu boardData hiện tại sơ sài, mà tìm thấy request tạo chính board này
    let pathname = '';
    try {
        pathname = new URL(url, window.location.origin).pathname;
    } catch (e) {
        pathname = url.split('?')[0];
    }

    if (
        method === 'post' &&
        (pathname === '/api/boards' || pathname === '/api/boards/') &&
        data._id === mergedBoard._id
    ) {
        mergedBoard.title = data.title;
        if (data.lists && Array.isArray(data.lists)) {
            mergedBoard.lists = data.lists;
        }
    }

    // --- LOGIC 2: Merge Create List ---
    // Match exactly: /api/boards/:boardId/lists
    {
        const partsForCreateList = pathname.split('/').filter(Boolean);
        const isCreateList = partsForCreateList.length === 4 &&
            partsForCreateList[0] === 'api' &&
            partsForCreateList[1] === 'boards' &&
            partsForCreateList[2] === mergedBoard._id &&
            partsForCreateList[3] === 'lists' &&
            method === 'post';

        if (isCreateList) {
            const newList = {
                _id: data._id || `temp-list-${Date.now()}`,
                title: data.title,
                position: mergedBoard.lists ? mergedBoard.lists.length : 0,
                cards: [],
                boardId: mergedBoard._id,
                isOffline: true
            };

            if (!mergedBoard.lists) mergedBoard.lists = [];
            if (!mergedBoard.lists.find(l => l._id === newList._id)) {
                mergedBoard.lists.push(newList);
            }
        }
    }

    // --- LOGIC 2.5: Merge Move List (reorder lists offline) ---
    // Endpoint pattern: PUT /api/boards/:boardId/lists/:listId/move  with body { newPosition }
    if (method === 'put') {
        // safe pathname parsing
        let _pathname = '';
        try {
            _pathname = new URL(url, window.location.origin).pathname;
        } catch (e) {
            _pathname = url.split('?')[0];
        }

        const _parts = _pathname.split('/').filter(Boolean);
        
        // --- LOGIC 2.5a: Update Board (title, background, etc.) ---
        // Pattern: PUT /api/boards/:boardId
        const isUpdateBoard = _parts.length === 3 && 
            _parts[0] === 'api' && 
            _parts[1] === 'boards' && 
            _parts[2] === mergedBoard._id;
            
        if (isUpdateBoard && data) {
            // Update board properties
            if (data.title) mergedBoard.title = data.title;
            if (data.background !== undefined) mergedBoard.background = data.background;
            // Add other board properties if needed
        }
        
        // Expect pattern: /api/boards/:boardId/lists/:listId/move
        const isListMove = _parts.length === 6 && _parts[0] === 'api' && _parts[1] === 'boards' && _parts[2] === mergedBoard._id && _parts[3] === 'lists' && _parts[5] === 'move';

        if (isListMove) {
            const listId = _parts[4];
            const newPos = (data && typeof data.newPosition === 'number') ? data.newPosition : null;

            if (listId && newPos !== null && Array.isArray(mergedBoard.lists)) {
                const fromIdx = mergedBoard.lists.findIndex(l => l._id === listId);
                if (fromIdx !== -1) {
                    const [moved] = mergedBoard.lists.splice(fromIdx, 1);
                    const insertIdx = Math.min(Math.max(0, newPos), mergedBoard.lists.length);
                    mergedBoard.lists.splice(insertIdx, 0, moved);
                    // normalize positions
                    mergedBoard.lists.forEach((l, i) => (l.position = i));
                }
            }
        }
    }

    // --- LOGIC 3: Merge Create Card ---
    // Match exactly: /api/boards/:boardId/lists/:listId/cards
    {
        const partsForCreateCard = pathname.split('/').filter(Boolean);
        const isCreateCard = partsForCreateCard.length === 6 &&
            partsForCreateCard[0] === 'api' &&
            partsForCreateCard[1] === 'boards' &&
            partsForCreateCard[2] === mergedBoard._id &&
            partsForCreateCard[3] === 'lists' &&
            partsForCreateCard[5] === 'cards' &&
            method === 'post';

        if (isCreateCard) {
            const listId = partsForCreateCard[4];
            if (mergedBoard.lists) {
                const targetList = mergedBoard.lists.find(l => l._id === listId);
                if (targetList) {
                    const newCard = {
                        _id: data._id || `temp-card-${Date.now()}`,
                        title: data.title,
                        description: data.description || '',
                        listId: listId,
                        members: [],
                        position: targetList.cards ? targetList.cards.length : 0,
                        isOffline: true
                    };
                    if (!targetList.cards) targetList.cards = [];
                    if (!targetList.cards.find(c => c._id === newCard._id)) {
                        targetList.cards.push(newCard);
                    }
                }
            }
        }
    }

    // --- LOGIC 4: Merge Update Card (Toggle Complete, Update Date, Move) ---
    // --- LOGIC 4: Merge Update Card (Toggle Complete, Update Date, Move) ---
    // Match patterns: PUT /api/boards/:boardId/lists/:listId/cards/:cardId or PUT /api/boards/:boardId/cards/:cardId/move
    if (method === 'put' && pathname.includes('/cards')) {
        let pathname = '';
        try {
            pathname = new URL(url, window.location.origin).pathname;
        } catch (e) {
            pathname = url.split('?')[0];
        }

        const parts = pathname.split('/').filter(Boolean);
        const cardsIdx = parts.findIndex(p => p === 'cards');
        const cardIdFromUrl =
            cardsIdx !== -1 && parts.length > cardsIdx + 1
                ? parts[cardsIdx + 1]
                : parts[parts.length - 1];

        const finalCardId = (data && data._id) ? data._id : cardIdFromUrl;

        const isMoveAction =
            data &&
            data.sourceListId &&
            data.destListId &&
            typeof data.newPosition === 'number';

        if (isMoveAction) {
            const srcList = mergedBoard.lists?.find(l => l._id === data.sourceListId);
            const dstList = mergedBoard.lists?.find(l => l._id === data.destListId);

            if (srcList && dstList) {
                let cardObj = null;

                const idx = srcList.cards?.findIndex(c => c._id === finalCardId) ?? -1;
                if (idx !== -1) cardObj = srcList.cards.splice(idx, 1)[0];

                if (!cardObj) {
                    for (const l of mergedBoard.lists) {
                        const i = l.cards?.findIndex(c => c._id === finalCardId) ?? -1;
                        if (i !== -1) {
                            cardObj = l.cards.splice(i, 1)[0];
                            break;
                        }
                    }
                }

                if (!cardObj) {
                    cardObj = { _id: finalCardId, title: data.title || 'Untitled' };
                }

                cardObj.listId = data.destListId;
                cardObj.position = data.newPosition;
                cardObj.isOffline = true;

                if (!dstList.cards) dstList.cards = [];
                dstList.cards.splice(
                    Math.min(data.newPosition, dstList.cards.length),
                    0,
                    cardObj
                );

                srcList.cards?.forEach((c, i) => (c.position = i));
                dstList.cards.forEach((c, i) => (c.position = i));
            }
        } else {
            mergedBoard.lists?.forEach(list => {
                const idx = list.cards?.findIndex(c => c._id === finalCardId) ?? -1;
                if (idx !== -1) {
                    list.cards[idx] = {
                        ...list.cards[idx],
                        ...data,
                        isOffline: true
                    };
                }
            });
        }
    }
    // --- Có thể thêm logic Merge Move Card / Delete List tại đây nếu cần ---
    // --- LOGIC 5: Merge Delete List ---
    // Detect DELETE /api/boards/:boardId/lists/:listId
    if (method === 'delete') {
        let _p = '';
        try {
            _p = new URL(url, window.location.origin).pathname;
        } catch (e) {
            _p = url.split('?')[0];
        }
        const _partsDel = _p.split('/').filter(Boolean);
        // Expect /api/boards/:boardId/lists/:listId
        if (
            _partsDel.length === 5 &&
            _partsDel[0] === 'api' &&
            _partsDel[1] === 'boards' &&
            _partsDel[2] === mergedBoard._id &&
            _partsDel[3] === 'lists'
        ) {
            const listIdToDelete = _partsDel[4];
            if (mergedBoard.lists) {
                const idx = mergedBoard.lists.findIndex(l => l._id === listIdToDelete);
                if (idx !== -1) {
                    mergedBoard.lists.splice(idx, 1);
                    // normalize positions
                    mergedBoard.lists.forEach((l, i) => (l.position = i));
                }
            }
        }
    }

    // --- LOGIC 6: Merge Delete Card ---
    // Detect DELETE /api/boards/:boardId/lists/:listId/cards/:cardId or /api/boards/:boardId/cards/:cardId
    if (method === 'delete') {
        const _p2 = pathname; // already determined earlier
        const partsDelCard = _p2.split('/').filter(Boolean);
        // Pattern A: /api/boards/:boardId/lists/:listId/cards/:cardId (length 7)
        const isDeleteCardInList = partsDelCard.length === 7 && partsDelCard[0] === 'api' && partsDelCard[1] === 'boards' && partsDelCard[2] === mergedBoard._id && partsDelCard[3] === 'lists' && partsDelCard[5] === 'cards';
        // Pattern B: /api/boards/:boardId/cards/:cardId (length 5)
        const isDeleteCard = partsDelCard.length === 5 && partsDelCard[0] === 'api' && partsDelCard[1] === 'boards' && partsDelCard[2] === mergedBoard._id && partsDelCard[3] === 'cards';

        if (isDeleteCardInList || isDeleteCard) {
            const cardIdToDelete = isDeleteCardInList ? partsDelCard[6] : partsDelCard[4];
            if (mergedBoard.lists) {
                for (const list of mergedBoard.lists) {
                    const cIdx = list.cards ? list.cards.findIndex(c => c._id === cardIdToDelete) : -1;
                    if (cIdx !== -1) {
                        list.cards.splice(cIdx, 1);
                        // normalize positions
                        if (list.cards) list.cards.forEach((c, i) => (c.position = i));
                        break;
                    }
                }
            }
        }
    }

    // --- LOGIC 7: Merge Upload Attachment ---
    // Detect POST /api/boards/:boardId/lists/:listId/cards/:cardId/attachments
    if (method === 'post' && pathname.includes('/attachments')) {
        const parts = pathname.split('/').filter(Boolean);
        const cardsIdx = parts.findIndex(p => p === 'cards');
        const isAttachment = parts[parts.length - 1] === 'attachments';

        if (cardsIdx !== -1 && isAttachment) {
            const cardId = parts[cardsIdx + 1];
            // In IDB, Form Data is stored as Object { key: value }
            const fileObj = body && body.file;

            if (fileObj) {
                const isFile = fileObj instanceof Blob || (fileObj.name && fileObj.size);

                if (isFile) {
                    const newAttachment = {
                        _id: `offline-att-${req.id || Date.now()}`,
                        name: fileObj.name || 'Unknown',
                        type: fileObj.type || '',
                        url: (fileObj instanceof Blob) ? URL.createObjectURL(fileObj) : '#',
                        uploadedAt: new Date(req.timestamp).toISOString(),
                        isOffline: true
                    };

                    if (mergedBoard.lists) {
                        for (const list of mergedBoard.lists) {
                            if (!list.cards) continue;
                            const card = list.cards.find(c => c._id === cardId);
                            if (card) {
                                if (!card.attachments) card.attachments = [];
                                // Avoid dups
                                if (!card.attachments.some(a => a._id === newAttachment._id)) {
                                    card.attachments.push(newAttachment);
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    // --- LOGIC 8: Merge Delete Attachment ---
    // DELETE /api/boards/:b/lists/:l/cards/:c/attachments/:attId
    if (method === 'delete' && pathname.includes('/attachments/')) {
        const parts = pathname.split('/').filter(Boolean);
        const attIdx = parts.findIndex(p => p === 'attachments');
        if (attIdx !== -1 && parts.length > attIdx + 1) {
            const attachmentId = parts[attIdx + 1];
            
            if (mergedBoard.lists) {
                for (const list of mergedBoard.lists) {
                    if (!list.cards) continue;
                    for (const card of list.cards) {
                        if (card.attachments) {
                            const idx = card.attachments.findIndex(a => a._id === attachmentId);
                            if (idx !== -1) {
                                card.attachments.splice(idx, 1);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
  }

  return mergedBoard;
};

export const mergeBoardsListWithOffline = async (boardsList) => {
    let mergedList = Array.isArray(boardsList) ? [...boardsList] : [];
    const pendingRequests = await getPendingRequests();

    for (const req of pendingRequests) {
        const method = req.method.toLowerCase();
        // Lấy pathname sạch (ví dụ: /api/boards)
        let pathname = '';
        try {
            pathname = new URL(req.url, window.location.origin).pathname;
        } catch (e) {
            pathname = req.url.split('?')[0];
        }

        // --- SỬA TẠI ĐÂY: Dùng pathname === thay vì .includes ---
        if (method === 'post' && (pathname === '/api/boards' || pathname === '/api/boards/')) {
             let data = req.body;
             if (typeof data === 'string') try { data = JSON.parse(data) } catch(e){}

             const newBoard = {
                 _id: data._id,
                 title: data.title,
                 lists: data.lists || [], 
                 members: [], 
                 ownerId: 'me',
                 isOffline: true 
             };
             
             if (!mergedList.find(b => b._id === newBoard._id)) {
                 mergedList.unshift(newBoard);
             }
        }
        
        // Merge update Board (title, background, etc.)
        if (method === 'put' && pathname.startsWith('/api/boards/')) {
            const parts = pathname.split('/').filter(Boolean);
            // Pattern: /api/boards/:boardId (length 3)
            if (parts.length === 3 && parts[0] === 'api' && parts[1] === 'boards') {
                const boardId = parts[2];
                let data = req.body;
                if (typeof data === 'string') try { data = JSON.parse(data) } catch(e){}
                
                const board = mergedList.find(b => b._id === boardId);
                if (board && data) {
                    if (data.title) board.title = data.title;
                    if (data.background !== undefined) board.background = data.background;
                }
            }
        }
        
        // Merge delete Board - cũng nên dùng pathname cho an toàn
        if (method === 'delete' && pathname.startsWith('/api/boards/')) {
            const boardId = pathname.split('/').pop();
            mergedList = mergedList.filter(b => b._id !== boardId);
        }
    }
    return mergedList;
};