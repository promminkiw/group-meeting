import { signInWithGoogle } from "./actions";
import { SubmitButton } from "./submit-button";

export function GoogleButton({ next }: { next: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="next" value={next} />
      <SubmitButton label="เข้าสู่ระบบด้วย Google" pendingLabel="กำลังเชื่อมต่อ Google..." />
    </form>
  );
}
