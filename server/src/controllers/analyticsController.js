import Board from '../models/Board.js';
import User from '../models/User.js';

const calculateStats = (boards) => {
    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    let activeTasks = 0;

    let memberStats = {};
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    boards.forEach(board => {
        const activeLists = board.lists ? board.lists.filter(l => !l._destroy) : [];

        activeLists.forEach(list => {
            const activeCards = list.cards ? list.cards.filter(c => !c._destroy) : [];

            activeCards.forEach(card => {
                totalTasks++;
                
                const isDone = (card.isCompleted === true) || (card.completed === true);
                
                let isOverdue = false;
                if (!isDone && card.dueDate) {
                    const deadlineDate = new Date(card.dueDate);
                    deadlineDate.setHours(0, 0, 0, 0);
                    
                    if (!isNaN(deadlineDate.getTime()) && deadlineDate.getTime() < todayStart.getTime()) {
                        isOverdue = true;
                    }
                }

                if (isDone) {
                    completedTasks++;
                } else if (isOverdue) {
                    overdueTasks++;
                } else {
                    activeTasks++;
                }

                if (card.members && card.members.length > 0) {
                    card.members.forEach(member => {
                        if (!memberStats[member._id]) {
                            memberStats[member._id] = { 
                                name: member.fullName || 'User', 
                                completed: 0, 
                                overdue: 0, 
                                active: 0 
                            };
                        }

                        if (isDone) memberStats[member._id].completed++;
                        else if (isOverdue) memberStats[member._id].overdue++;
                        else memberStats[member._id].active++;
                    });
                }
            });
        });
    });

    return {
        totalTasks,
        completedTasks,
        overdueTasks,
        activeTasks,
        boardsCount: boards.length,
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
                populate: {
                    path: 'cards',
                    match: { _destroy: false },
                    model: 'Card',
                    select: 'title completed isCompleted dueDate members _destroy',
                    populate: { path: 'members', select: 'fullName avatar' }
                }
            });

        if (boardId && boardId !== 'all' && boards.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bảng hoặc bạn không có quyền truy cập.' });
        }

        const stats = calculateStats(boards);

        const taskDistribution = [
            { name: 'Đã hoàn thành', value: stats.completedTasks, color: '#22c55e' },
            { name: 'Quá hạn', value: stats.overdueTasks, color: '#ef4444' },
            { name: 'Đang thực hiện', value: stats.activeTasks, color: '#6366f1' }
        ].filter(item => item.value > 0);

        const memberPerformance = Object.values(stats.memberStats)
            .sort((a, b) => (b.completed + b.overdue + b.active) - (a.completed + a.overdue + a.active))
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
                activeTasks: stats.activeTasks,
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