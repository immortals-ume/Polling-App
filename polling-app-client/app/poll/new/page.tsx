import { NewPollForm } from "@/components/NewPollForm";
import { RequireAuth } from "@/components/RequireAuth";

export default function NewPollPage() {
  return (
    <RequireAuth>
      <NewPollForm />
    </RequireAuth>
  );
}
