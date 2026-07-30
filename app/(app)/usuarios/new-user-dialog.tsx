"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createUserAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { UserPlus, Loader2 } from "lucide-react";
import type { UserRole } from "@/types/database";

export function NewUserDialog() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<UserRole>("viewer_approver");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("role", role);
    startTransition(async () => {
      const result = await createUserAction(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Convite enviado! A pessoa recebe um e-mail para entrar.");
      setOpen(false);
      setRole("viewer_approver");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <UserPlus className="h-4 w-4" />
            Novo usuário
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar novo usuário</DialogTitle>
          <DialogDescription>
            A pessoa recebe um e-mail com um link para entrar direto, sem precisar
            criar senha.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="full_name">Nome</Label>
            <Input id="full_name" name="full_name" required placeholder="Ex: João" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="pessoa@exemplo.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Papel</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  Administrador — controle total do sistema
                </SelectItem>
                <SelectItem value="viewer_approver">
                  Visão completa — vê tudo e aprova reembolsos
                </SelectItem>
                <SelectItem value="contributor">
                  Colaborador — vê tudo e cadastra suas despesas
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar convite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
