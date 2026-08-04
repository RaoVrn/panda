import { Search, Settings, Sparkles } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export function SearchPage() {
  return (
    <PlaceholderPage
      icon={Search}
      title="Search"
      description="Search across every lesson, command and concept. Coming soon."
    />
  );
}

export function SettingsPage() {
  return (
    <PlaceholderPage
      icon={Settings}
      title="Settings"
      description="Theme, preferences and progress controls will live here."
    />
  );
}

export function AiPage() {
  return (
    <PlaceholderPage
      icon={Sparkles}
      title="Panda AI"
      description="Your personal Git teacher. Ask anything and get an answer that actually makes sense."
    />
  );
}