export const TASK_GENERIC_ERROR = "ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";

// แปลง error จาก database เป็นข้อความไทย ไม่ส่งรายละเอียดภายในออกไป
export function describeTaskDbError(error: { code?: string; message: string }): string {
  if (error.message.includes("assignee must be a member of the task group")) {
    return "ผู้รับผิดชอบต้องเป็นสมาชิกของกลุ่มนี้";
  }
  if (error.code === "23505") return "สมาชิกคนนี้เป็นผู้รับผิดชอบงานนี้อยู่แล้ว";
  if (error.code === "23514") return "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบชื่องานและรายละเอียด";
  if (error.code === "42501") return "คุณไม่มีสิทธิ์ทำรายการนี้";
  return TASK_GENERIC_ERROR;
}
