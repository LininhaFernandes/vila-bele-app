import { google } from "googleapis";

// A API da Anthropic aceita JPEG/PNG/WEBP/GIF e PDF — não HEIC (padrão de fotos do iPhone).
// Se o Rodrigo tirar foto com iPhone, o Google Fotos/Drive costuma converter para JPEG ao
// fazer upload pelo app; caso salve como .heic, o arquivo é ignorado pela sincronização.
const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !key) {
    throw new Error("Credenciais do Google Drive não configuradas.");
  }
  return new google.auth.JWT({
    email,
    key: key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

function getDriveClient() {
  return google.drive({ version: "v3", auth: getAuth() });
}

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
};

export async function listReceiptFiles(): Promise<DriveFile[]> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) throw new Error("GOOGLE_DRIVE_FOLDER_ID não configurado.");

  const drive = getDriveClient();
  const files: DriveFile[] = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType)",
      pageSize: 100,
      pageToken,
    });
    for (const f of res.data.files ?? []) {
      if (f.id && f.name && f.mimeType && SUPPORTED_MIME_TYPES.has(f.mimeType)) {
        files.push({ id: f.id, name: f.name, mimeType: f.mimeType });
      }
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return files;
}

export async function downloadFile(fileId: string): Promise<Buffer> {
  const drive = getDriveClient();
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" },
  );
  return Buffer.from(res.data as ArrayBuffer);
}

export async function renameFile(fileId: string, newName: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.update({ fileId, requestBody: { name: newName } });
}
