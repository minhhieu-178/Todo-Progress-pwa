export const BOARD_TEMPLATES = {
  KANBAN: {
    id: 'KANBAN',
    name: 'Kanban Cơ Bản',
    description: 'Quy trình 3 bước cổ điển.',
    color: '#3b82f6',
    lists: [
      { title: 'Việc cần làm', position: 0 },
      { title: 'Đang làm', position: 1 },
      { title: 'Đã xong', position: 2 }
    ]
  },
  SCRUM: {
    id: 'SCRUM',
    name: 'Scrum Sprint',
    description: 'Dành cho đội phát triển Agile.',
    color: '#8b5cf6',
    lists: [
      { title: 'Product Backlog', position: 0 },
      { title: 'Sprint Backlog', position: 1 },
      { title: 'In Progress', position: 2 },
      { title: 'Review', position: 3 },
      { title: 'Done', position: 4 }
    ]
  },
  MARKETING: {
    id: 'MARKETING',
    name: 'Chiến dịch Marketing',
    description: 'Theo dõi nội dung và bài đăng.',
    color: '#ec4899',
    lists: [
      { title: 'Ý tưởng', position: 0 },
      { title: 'Viết nháp', position: 1 },
      { title: 'Design', position: 2 },
      { title: 'Chờ duyệt', position: 3 },
      { title: 'Đã đăng', position: 4 }
    ]
  },
};