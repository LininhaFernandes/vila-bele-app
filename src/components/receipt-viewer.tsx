"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FileText, Expand } from "lucide-react";

export function ReceiptThumbnail({ url, isPdf }: { url: string; isPdf: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border bg-muted"
      >
        {isPdf ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <FileText className="h-10 w-10" />
            <span className="text-sm">Ver PDF da nota fiscal</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Comprovante" className="h-full w-full object-contain" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
          <Expand className="h-6 w-6 text-white" />
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl sm:max-w-3xl">
          <DialogTitle className="sr-only">Comprovante</DialogTitle>
          {isPdf ? (
            <iframe src={url} className="h-[75vh] w-full rounded-lg" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Comprovante" className="max-h-[80vh] w-full rounded-lg object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
