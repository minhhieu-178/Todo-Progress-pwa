import notification from "../models/notification.model.js";

export const createNotice = async (userId, type, message, extra = {}) => {
  try {
    await Notification.create({
      user: userId,
      type,
      message,
      ...extra, // ví dụ: taskId, workspaceId, deadline...
    });
  } catch (err) {
    console.error("Error creating notification:", err.message);
  }
};

//dùng để tạo 1 Object ngay khi có sự thay đổi bằng việc gọi API trong controller, ví dụ là thêm người vào task thì sẽ gọi
//    if (assignee && assignee.toString() !== creatorId.toString()) {
//       await createNotice(
//         assignee,
//         "task_assigned",
//         `Bạn được giao task "${title}"`,
//         { task: task._id }
//       );
//     }


//hoặc
//import { createNotice } from "../services/notice.service.js";
//await createNotice(req.user._id, "Task sắp đến hạn", "deadline");


// chưa tạo model nên còn thiếu