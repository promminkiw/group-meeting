import Link from "next/link";

export default function TaskNotFound() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 text-center">
      <h2 className="text-lg font-semibold">ไม่พบงานนี้</h2>
      <p className="mt-2 text-sm text-zinc-600">งานอาจถูกลบ หรืออยู่ในกลุ่มอื่น</p>
      <Link
        href="/"
        className="mt-5 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        กลับไปรายการกลุ่ม
      </Link>
    </div>
  );
}
