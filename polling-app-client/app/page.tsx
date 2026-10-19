import { PollList } from "@/components/PollList";

export default function HomePage() {
  return <PollList source={{ type: "ALL" }} />;
}
