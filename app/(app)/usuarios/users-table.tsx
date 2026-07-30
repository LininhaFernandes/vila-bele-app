"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateUserAction, setUserActiveAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import type { Profile, UserRole } from "@/types/database";

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Administrador",
  viewer_approver: "Visão completa",
  contributor: "Colaborador",
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
}

export function UsersTable({
  profiles,
  currentUserId,
}: {
  profiles: Profile[];
  currentUserId: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {profiles.map((p) => (
        <UserRow key={p.id} profile={p} isSelf={p.id === currentUserId} />
      ))}
    </div>
  );
}

function UserRow({ profile, isSelf }: { profile: Profile; isSelf: boolean }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.full_name);
  const [role, setRole] = useState<UserRole>(profile.role);
  const [pending, startTransition] = useTransition();

  function saveEdits() {
    startTransition(async () => {
      const result = await updateUserAction(profile.id, name, role);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Usuário atualizado.");
      setEditing(false);
    });
  }

  function toggleActive() {
    startTransition(async () => {
      const result = await setUserActiveAction(profile.id, !profile.active);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(profile.active ? "Usuário desativado." : "Usuário reativado.");
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            {initials(profile.full_name)}
          </AvatarFallback>
        </Avatar>

        {editing ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 w-40"
            />
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="h-9 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="viewer_approver">Visão completa</SelectItem>
                <SelectItem value="contributor">Colaborador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <p className="font-medium">
              {profile.full_name} {isSelf && <span className="text-muted-foreground text-xs">(você)</span>}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary">{ROLE_LABEL[profile.role]}</Badge>
              {!profile.active && <Badge variant="outline">Inativo</Badge>}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <Button size="icon" variant="ghost" disabled={pending} onClick={saveEdits}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                setEditing(false);
                setName(profile.full_name);
                setRole(profile.role);
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
            <Button
              size="sm"
              variant="outline"
              disabled={pending || isSelf}
              onClick={toggleActive}
            >
              {profile.active ? "Desativar" : "Reativar"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
