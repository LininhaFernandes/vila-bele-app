"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createCategoryAction, updateCategoryAction, setCategoryActiveAction } from "./category-actions";
import { ICON_OPTIONS } from "./category-icon-options";
import { CategoryIcon } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Check, X, Loader2 } from "lucide-react";
import type { Category } from "@/types/database";

function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? "Package")}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Escolha um ícone" />
      </SelectTrigger>
      <SelectContent>
        {ICON_OPTIONS.map((opt) => (
          <SelectItem key={opt.name} value={opt.name}>
            <span className="flex items-center gap-2">
              <CategoryIcon name={opt.name} className="h-4 w-4" />
              {opt.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function NewCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [icon, setIcon] = useState("Package");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("icon", icon);
    startTransition(async () => {
      const result = await createCategoryAction(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Categoria criada!");
      setOpen(false);
      setIcon("Package");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="h-4 w-4" />
            Nova categoria
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova categoria</DialogTitle>
          <DialogDescription>Vai aparecer na lista ao cadastrar despesas.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" required placeholder="Ex: Jardinagem" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Ícone</Label>
            <IconSelect value={icon} onChange={setIcon} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar categoria
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [icon, setIcon] = useState(category.icon);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateCategoryAction(category.id, name, icon);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Categoria atualizada.");
      setEditing(false);
    });
  }

  function toggleActive() {
    startTransition(async () => {
      const result = await setCategoryActiveAction(category.id, !category.active);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(category.active ? "Categoria desativada." : "Categoria reativada.");
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <CategoryIcon name={icon} className="h-5 w-5" />
        </div>

        {editing ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 w-40" />
            <div className="w-48">
              <IconSelect value={icon} onChange={setIcon} />
            </div>
          </div>
        ) : (
          <div>
            <p className="font-medium">{category.name}</p>
            {!category.active && (
              <Badge variant="outline" className="mt-1">
                Inativa
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <Button size="icon" variant="ghost" disabled={pending} onClick={save}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                setEditing(false);
                setName(category.name);
                setIcon(category.icon);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" disabled={pending} onClick={toggleActive}>
              {category.active ? "Desativar" : "Reativar"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function CategoriesTab({ categories }: { categories: Category[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Essas categorias aparecem na hora de cadastrar uma despesa.
        </p>
        <NewCategoryDialog />
      </div>
      <div className="flex flex-col gap-3">
        {categories.map((c) => (
          <CategoryRow key={c.id} category={c} />
        ))}
      </div>
    </div>
  );
}
