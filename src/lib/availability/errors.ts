export const AVAILABILITY_GENERIC_ERROR = "ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";

// แปลง error จาก database เป็นข้อความไทย ไม่ส่งรายละเอียดภายในออกไป
export function describeAvailabilityDbError(error: { code?: string; message: string }): string {
  if (error.code === "23514") return "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่";
  if (error.code === "42501") return "คุณไม่มีสิทธิ์ทำรายการนี้";
  return AVAILABILITY_GENERIC_ERROR;
}

export function describeEventDbError(error: { code?: string; message: string }): string {
  if (error.code === "23514") return "ข้อมูลนัดหมายไม่ถูกต้อง กรุณาตรวจสอบชื่อและช่วงเวลา";
  if (error.code === "23503") return "ไม่พบกลุ่มนี้หรือข้อมูลที่อ้างอิง";
  if (error.code === "42501") return "คุณไม่มีสิทธิ์ทำรายการนี้";
  return AVAILABILITY_GENERIC_ERROR;
}
