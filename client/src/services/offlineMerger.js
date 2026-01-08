import { openDB } from 'idb';

const getPendingRequests = async () => {
  const db = await openDB('offline-requests-db', 1);
  return await db.getAll('requests');
};

export const mergeBoardDataWithOffline = async (boardData) => {
  if (!boardData) return boardData;
  
  let mergedBoard = JSON.parse(JSON.stringify(boardData));
  const pendingRequests = await getPendingRequests();

  if (pendingRequests.length === 0) return mergedBoard;

  pendingRequests.sort((a, b) => a.timestamp - b.timestamp);

  for (const req of pendingRequests) {
    const { url, method, body } = req;
    
    let data = body;
    if (typeof body === 'string') {
        try { data = JSON.parse(body); } catch(e) {}
    }

    // Merge create List
    if (method === 'post' && url.includes(`/boards/${mergedBoard._id}/lists`) && !url.includes('/cards')) {
        const newList = {
            _id: data._id || `temp-list-${Date.now()}`, 
            title: data.title,
            position: mergedBoard.lists.length,
            cards: [],
            boardId: mergedBoard._id,
            isOffline: true 
        };
        
        if (!mergedBoard.lists.find(l => l._id === newList._id)) {
            mergedBoard.lists.push(newList);
        }
    }

    // Merge create Card
    if (method === 'post' && url.includes('/cards') && !url.includes('/members') && !url.includes('/attachments')) {
        const match = url.match(/lists\/([a-zA-Z0-9-]+)\/cards/);
        if (match && match[1]) {
            const listId = match[1];
            const targetList = mergedBoard.lists.find(l => l._id === listId);
            
            if (targetList) {
                const newCard = {
                    _id: data._id || `temp-card-${Date.now()}`,
                    title: data.title,
                    description: data.description || '',
                    listId: listId,
                    members: [],
                    position: targetList.cards.length,
                    isOffline: true 
                };
                
                if (!targetList.cards.find(c => c._id === newCard._id)) {
                    targetList.cards.push(newCard);
                }
            }
        }
    }
  }

  return mergedBoard;
};

export const mergeBoardsListWithOffline = async (boardsList) => {
    let mergedList = [...boardsList];
    const pendingRequests = await getPendingRequests();

    for (const req of pendingRequests) {
        // Merge create Board
        if (req.method === 'post' && req.url.includes('/api/boards')) {
             let data = req.body;
             if (typeof data === 'string') try { data = JSON.parse(data) } catch(e){}

             const newBoard = {
                 _id: data._id,
                 title: data.title,
                 lists: [],
                 members: [], 
                 ownerId: 'me',
                 isOffline: true 
             };
             
             if (!mergedList.find(b => b._id === newBoard._id)) {
                 mergedList.unshift(newBoard);
             }
        }
        
        // Merge delete Board
        if (req.method === 'delete' && req.url.includes('/api/boards/')) {
            const boardId = req.url.split('/').pop();
            mergedList = mergedList.filter(b => b._id !== boardId);
        }
    }
    return mergedList;
};