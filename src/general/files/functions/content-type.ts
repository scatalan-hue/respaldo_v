export function getMimeTypeFromExtension(extension: string): string | undefined {
  const mimeTypes: { [extension: string]: string } = {
    // MIME extensions
    pdf: 'application/pdf',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    mp4: 'video/mp4',
    ogv: 'video/ogg',
    pfx: 'application/x-pkcs12',
  };
  return mimeTypes[extension.toLowerCase()];
}
