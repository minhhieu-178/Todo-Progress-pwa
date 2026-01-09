export const BOARD_TEMPLATES = {
  KANBAN: {
    key: 'KANBAN',
    title: "Quy trình Kanban",
    lists: [
      { title: 'Backlog', position: 0 },
      { title: 'Sẵn sàng làm', position: 1 },
      { title: 'Đang làm', position: 2 },
      { title: 'Đang kiểm tra', position: 3 },
      { title: 'Hoàn thành', position: 4 }
    ],
    background: '#0079bf'
  },
  AGILE: {
    key: 'AGILE',
    title: "Dự án Agile/Sprint",
    lists: [
      { title: 'Sprint Backlog', position: 0 },
      { title: 'Đang làm', position: 1 },
      { title: 'Đợi phản hồi', position: 2 },
      { title: 'Đã xong', position: 3 }
    ],
    background: '#eb5a46'
  },
  MARKETING: {
    key: 'MARKETING',
    title: "Nội dung & Marketing",
    lists: [
      { title: 'Ý tưởng', position: 0 },
      { title: 'Nghiên cứu', position: 1 },
      { title: 'Đang viết', position: 2 },
      { title: 'Chờ duyệt', position: 3 },
      { title: 'Đã đăng', position: 4 }
    ],
    background: '#61bd4f'
  },
  SALES: {
    key: 'SALES',
    title: "Quy trình bán hàng",
    lists: [
      { title: 'Tiềm năng', position: 0 },
      { title: 'Đã liên hệ', position: 1 },
      { title: 'Thương thảo', position: 2 },
      { title: 'Thành công', position: 3 },
      { title: 'Thất bại', position: 4 }
    ],
    background: '#f2d600'
  },
  EVENT: {
    key: 'EVENT',
    title: "Kế hoạch Sự kiện",
    lists: [
      { title: 'Hậu cần', position: 0 },
      { title: 'Khách mời', position: 1 },
      { title: 'Truyền thông', position: 2 },
      { title: 'Ngày diễn ra', position: 3 },
      { title: 'Kết thúc', position: 4 }
    ],
    background: '#ff78cb'
  }
};