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
    if (method === 'post' && url.includes('/api/boards') && data._id === mergedBoard._id) {
         mergedBoard.title = data.title;
         // Nếu lúc tạo có gửi kèm lists (Client Generation), gán vào luôn
         if (data.lists && Array.isArray(data.lists)) {
             mergedBoard.lists = data.lists;
         }
    }

    // --- LOGIC 2: Merge Create List ---
    if (method === 'post' && url.includes(`/boards/${mergedBoard._id}/lists`) && !url.includes('/cards')) {
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

    // --- LOGIC 3: Merge Create Card ---
    // Cần regex để bắt chính xác boardId và listId từ URL
    // URL pattern: /boards/:boardId/lists/:listId/cards
    if (method === 'post' && url.includes('/cards') && !url.includes('/members') && !url.includes('/attachments')) {
        // Tìm listId trong URL. Ví dụ: .../lists/list-123/cards
        const match = url.match(/lists\/([a-zA-Z0-9-]+)\/cards/);
        
        // Kiểm tra xem request này có thuộc về board hiện tại không
        if (match && match[1] && url.includes(mergedBoard._id)) {
            const listId = match[1];
            
            if (mergedBoard.lists) {
                const targetList = mergedBoard.lists.find(l => l._id === listId);
                
                if (targetList) {
                    const newCard = {
                        _id: data._id || `temp-card-${Date.now()}`, // data._id từ client gửi lên
                        title: data.title,
                        description: data.description || '',
                        listId: listId,
                        members: [],
                        position: targetList.cards ? targetList.cards.length : 0,
                        isOffline: true 
                    };
                    
                    if (!targetList.cards) targetList.cards = [];
                    // Tránh duplicate
                    if (!targetList.cards.find(c => c._id === newCard._id)) {
                        targetList.cards.push(newCard);
                    }
                }
            }
        }
    }
    
    // --- Có thể thêm logic Merge Move Card / Delete List tại đây nếu cần ---
  }

  return mergedBoard;
};

export const mergeBoardsListWithOffline = async (boardsList) => {
    // Đảm bảo input là array
    let mergedList = Array.isArray(boardsList) ? [...boardsList] : [];
    const pendingRequests = await getPendingRequests();

    for (const req of pendingRequests) {
        // Merge create Board
        if (req.method === 'post' && req.url.includes('/api/boards')) {
             let data = req.body;
             if (typeof data === 'string') try { data = JSON.parse(data) } catch(e){}

             const newBoard = {
                 _id: data._id,
                 title: data.title,
                 // Quan trọng: Lấy lists từ request body để hiển thị số lượng task ở dashboard
                 lists: data.lists || [], 
                 members: [], 
                 ownerId: 'me',
                 isOffline: true 
             };
             
             // Chỉ thêm nếu chưa có trong danh sách (tránh duplicate nếu request chưa kịp xóa khỏi IDB)
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