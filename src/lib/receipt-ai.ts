import Anthropic from "@anthropic-ai/sdk";
import type { Category, ReceiptType } from "@/types/database";

const client = new Anthropic();

export type ExtractedReceipt = {
  date: string;
  amount: number;
  establishment: string;
  category_guess: string;
  receipt_type: ReceiptType;
  confidence: "alta" | "media" | "baixa";
};

const RECEIPT_SCHEMA = {
  type: "object",
  properties: {
    date: {
      type: "string",
      description: "Data da compra no formato YYYY-MM-DD. Se não achar, use a data de hoje.",
    },
    amount: { type: "number", description: "Valor total pago, em reais, só o número." },
    establishment: { type: "string", description: "Nome do estabelecimento/loja." },
    category_guess: {
      type: "string",
      description: "O nome exato de uma das categorias fornecidas que melhor descreve a despesa.",
    },
    receipt_type: {
      type: "string",
      enum: ["cupom_fiscal", "nota_fiscal"],
      description: "cupom_fiscal para cupom de loja física, nota_fiscal para NF-e/NFS-e formal.",
    },
    confidence: {
      type: "string",
      enum: ["alta", "media", "baixa"],
      description: "Sua confiança na leitura dos dados acima.",
    },
  },
  required: ["date", "amount", "establishment", "category_guess", "receipt_type", "confidence"],
  additionalProperties: false,
} as const;

export async function extractReceiptData(
  fileBuffer: Buffer,
  mimeType: string,
  categories: Category[],
): Promise<ExtractedReceipt> {
  const base64 = fileBuffer.toString("base64");
  const categoryNames = categories.map((c) => c.name).join(", ");

  const contentBlock: Anthropic.Messages.ContentBlockParam =
    mimeType === "application/pdf"
      ? {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
        }
      : {
          type: "image",
          source: {
            type: "base64",
            media_type: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
            data: base64,
          },
        };

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    output_config: { format: { type: "json_schema", schema: RECEIPT_SCHEMA } },
    messages: [
      {
        role: "user",
        content: [
          contentBlock,
          {
            type: "text",
            text: `Esse é um cupom fiscal ou nota fiscal de despesas de manutenção de um sítio. Leia a imagem/PDF e extraia os dados. Escolha category_guess entre exatamente estas opções: ${categoryNames}.`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("A IA não retornou texto.");
  }
  return JSON.parse(textBlock.text) as ExtractedReceipt;
}
