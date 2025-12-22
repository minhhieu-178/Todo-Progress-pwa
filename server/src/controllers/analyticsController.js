import Board from '../models/Board.js';
import User from '../models/User.js';

const normalize = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const calculateStats = (boards) => {
    let totalTasks = 0;
    let completedTasks = 0;
    
    let statusDist = { 
        completed: 0, 
        doing: 0, 
        todo: 0, 
        overdue: 0 
    };
    
    let memberStats = {};
    const now = new Date();

    boards.forEach(board => {
        const activeLists = board.lists.filter(l => !l._destroy);

        activeLists.forEach(list => {
            const listTitle = normalize(list.title || '');

            const activeCards = list.cards.filter(c => !c._destroy);

            activeCards.forEach(card => {
                totalTasks++;
                
                let isCardOverdue = card.deadline && new Date(card.deadline) < now && !card.completed;

                if (card.completed || listTitle.includes('done') || listTitle.includes('hoan thanh') || listTitle.includes('xong')) {
                    completedTasks++;
                    statusDist.completed++;
                } 
                else if (isCardOverdue) {
                    overdueTasks++;
                    statusDist.overdue++;
                } 
                else {
                    if (listTitle.includes('todo') || listTitle.includes('can lam') || listTitle.includes('backlog') || listTitle.includes('idea')) {
                        statusDist.todo++;
                    } else {
                        statusDist.doing++;
                    }
                }

                if (card.members && card.members.length > 0) {
                    card.members.forEach(member => {
                        if (!memberStats[member._id]) {
                            memberStats[member._id] = { name: member.fullName, tasks: 0, completed: 0 };
                        }
                        memberStats[member._id].tasks++;
                        if (card.completed) {
                            memberStats[member._id].completed++;
                        }
                    });
                }
            });
        });
    });

    return {
        totalTasks,
        completedTasks,
        overdueTasks,
        boardsCount: boards.length,
        statusDist,
        memberStats
    };
};

export const getAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const { boardId } = req.query;

        let query = { members: userId, _destroy: false };
        
        if (boardId && boardId !== 'all') {
            query._id = boardId;
        }

        const boards = await Board.find(query)
            .select('title lists members _destroy')
            .populate({
                path: 'lists',
                match: { _destroy: false },
                select: 'title cards _destroy',
                populate: {
                    path: 'cards',
                    match: { _destroy: false },
                    model: 'Card',
                    select: 'title completed deadline members _destroy',
                    populate: { path: 'members', select: 'fullName avatar' }
                }
            });

        if (boardId && boardId !== 'all' && boards.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bảng hoặc bạn không có quyền truy cập.' });
        }

        const stats = calculateStats(boards);

        const taskDistribution = [
            { name: 'Hoàn thành', value: stats.statusDist.completed, color: '#22c55e' }, 
            { name: 'Đang làm', value: stats.statusDist.doing, color: '#6366f1' },     
            { name: 'Cần làm', value: stats.statusDist.todo, color: '#94a3b8' },        
            { name: 'Quá hạn', value: stats.statusDist.overdue, color: '#ef4444' }    
        ].filter(item => item.value > 0);

        const memberPerformance = Object.values(stats.memberStats)
            .sort((a, b) => b.completed - a.completed)
            .slice(0, 10);

        let allBoardsList = [];
        if (!boardId || boardId === 'all') {
             allBoardsList = boards.map(b => ({ _id: b._id, title: b.title }));
        }

        res.json({
            summary: {
                totalTasks: stats.totalTasks,
                completedTasks: stats.completedTasks,
                overdueTasks: stats.overdueTasks,
                boardsCount: stats.boardsCount,
                boardName: boards.length === 1 ? boards[0].title : 'Tất cả dự án'
            },
            taskDistribution,
            memberPerformance,
            availableBoards: allBoardsList
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy thống kê' });
    }
};