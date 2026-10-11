import { TopicGuide, topicMetadata } from "@/components/topic-guide";
export const dynamic = "force-dynamic";
export const metadata = topicMetadata("secret-santa-gifts-for-gamers");
export default function Page() { return <TopicGuide slug="secret-santa-gifts-for-gamers" />; }
