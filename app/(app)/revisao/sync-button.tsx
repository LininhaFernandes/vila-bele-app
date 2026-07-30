"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { triggerSyncAction } from "./actions";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

export function SyncButton() {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await triggerSyncAction();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const { created = 0, failed = 0 } = result.summary ?? {};
      if (created === 0 && failed === 0) {
        toast.info("Nenhuma notinha nova encontrada na pasta.");
      } else {
        toast.success(
          `${created} notinha(s) lida(s)${failed > 0 ? ` · ${failed} falharam` : ""}.`,
        );
      }
    });
  }

  return (
    <Button onClick={handleClick} disabled={pending} variant="outline">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Sincronizar agora
    </Button>
  );
}
