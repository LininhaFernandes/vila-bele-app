import * as Icons from "lucide-react";
import { Package, type LucideProps } from "lucide-react";

export function CategoryIcon({ name, ...props }: { name: string | null | undefined } & LucideProps) {
  const Icon = (name && (Icons as unknown as Record<string, Icons.LucideIcon>)[name]) || Package;
  return <Icon {...props} />;
}
