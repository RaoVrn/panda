import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Construction } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function PlaceholderPage({
  title,
  description,
  icon: Icon = Construction,
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Card className="flex w-full max-w-md flex-col items-center p-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft">
          <Icon className="size-6 text-accent-hover" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
        <Link to="/" className="mt-8">
          <Button variant="secondary" leftIcon={<ArrowLeft className="size-4" />}>
            Back home
          </Button>
        </Link>
      </Card>
    </div>
  );
}