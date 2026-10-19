const types: Record<string, string> = { pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };
export async function validateAttachment(file: File): Promise<void> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const expected = types[extension];
  if (!expected || file.type !== expected) throw new Error("Use um arquivo PDF, PNG, JPG ou WebP.");
  if (!file.size || file.size > 10 * 1024 * 1024) throw new Error("O arquivo deve ter até 10 MB.");
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const starts = (...values: number[]) => values.every((value, index) => bytes[index] === value);
  const valid = expected === "application/pdf" ? starts(37,80,68,70,45)
    : expected === "image/png" ? starts(137,80,78,71,13,10,26,10)
    : expected === "image/jpeg" ? starts(255,216,255)
    : starts(82,73,70,70) && [87,69,66,80].every((value,index) => bytes[index+8] === value);
  if (!valid) throw new Error("O conteúdo do arquivo não corresponde ao formato informado.");
}
export function safeAttachmentUrl(url: unknown): url is string {
  return typeof url === "string" && /^data:(application\/pdf|image\/(png|jpeg|webp));base64,[A-Za-z0-9+/=]+$/.test(url);
}
export async function validateImage(file: File): Promise<void> {
  await validateAttachment(file);
  if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) throw new Error("Use PNG, JPEG ou WebP de até 2 MB.");
  // A signature is not enough: decode before keeping the image, with a pixel budget.
  if (typeof createImageBitmap === "undefined") throw new Error("Este navegador não permite validar a imagem com segurança.");
  {
    let bitmap: ImageBitmap;
    try { bitmap = await createImageBitmap(file); } catch { throw new Error("A imagem está inválida ou corrompida."); }
    try { if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 25000000) throw new Error("A imagem deve ter no máximo 25 megapixels."); }
    finally { bitmap.close(); }
  }
}
