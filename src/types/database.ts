export type UserRole = "admin" | "viewer_approver" | "contributor";

export type ReimbursementStatus = "not_applicable" | "pending" | "reimbursed";

export type ReceiptType = "cupom_fiscal" | "nota_fiscal" | "none";

export type ExpenseSource = "pasta_notinhas" | "manual" | "email_futuro";

export type ExpenseStatus = "draft" | "confirmed";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  active: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  sort_order: number;
  created_at: string;
};

export type ReimbursementBatch = {
  id: string;
  paid_at: string;
  total_amount: number;
  paid_by: string;
  notes: string | null;
  created_by: string;
  created_at: string;
};

export type Expense = {
  id: string;
  expense_date: string;
  description: string;
  establishment: string | null;
  category_id: string | null;
  amount: number;
  paid_by: string;
  reimbursement_status: ReimbursementStatus;
  reimbursed_by: string | null;
  reimbursement_batch_id: string | null;
  reimbursed_at: string | null;
  receipt_url: string | null;
  receipt_type: ReceiptType;
  source: ExpenseSource;
  status: ExpenseStatus;
  ai_suggested: Record<string, unknown> | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ExpenseWithRelations = Expense & {
  category: Category | null;
  payer: Profile | null;
  reimburser: Profile | null;
};

export type ProcessedDriveFileStatus = "processed" | "failed" | "skipped";

export type ProcessedDriveFile = {
  id: string;
  drive_file_id: string;
  file_name: string;
  status: ProcessedDriveFileStatus;
  expense_id: string | null;
  error_message: string | null;
  processed_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id" | "full_name" | "role">;
        Update: Partial<Profile>;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: Partial<Category> & Pick<Category, "name">;
        Update: Partial<Category>;
        Relationships: [];
      };
      reimbursement_batches: {
        Row: ReimbursementBatch;
        Insert: Partial<ReimbursementBatch> &
          Pick<ReimbursementBatch, "paid_at" | "total_amount" | "paid_by" | "created_by">;
        Update: Partial<ReimbursementBatch>;
        Relationships: [];
      };
      expenses: {
        Row: Expense;
        Insert: Partial<Expense> &
          Pick<Expense, "expense_date" | "description" | "amount" | "paid_by" | "created_by">;
        Update: Partial<Expense>;
        Relationships: [];
      };
      processed_drive_files: {
        Row: ProcessedDriveFile;
        Insert: Partial<ProcessedDriveFile> & Pick<ProcessedDriveFile, "drive_file_id" | "file_name" | "status">;
        Update: Partial<ProcessedDriveFile>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
