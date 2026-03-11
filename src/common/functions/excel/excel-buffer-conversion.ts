/**
 //El archivo que se lee como un buffer se debe convertir a un ArrayBuffer para ser procesado por ExcelJs
 */
export function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  view.set(buffer);
  return arrayBuffer;
}


