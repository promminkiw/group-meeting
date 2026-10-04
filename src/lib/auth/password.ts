// ใช้ร่วมกันระหว่างฟอร์ม (client) และ server action เพราะไฟล์ "use server" export ค่าคงที่ไม่ได้
export const MIN_SIGNUP_PASSWORD_LENGTH = 8;
// login ยังรับ 6 เพราะบัญชีเดิมอาจตั้งไว้ 6-7 ตัว
export const MIN_LOGIN_PASSWORD_LENGTH = 6;
export const PASSWORD_MISMATCH_MESSAGE = "รหัสผ่านทั้งสองช่องไม่ตรงกัน";
