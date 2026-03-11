import { PDFArray, CharCodes } from 'pdf-lib';

export default class PDFArrayCustom {
  private pdfArray: PDFArray;

  constructor(context: any) {
    this.pdfArray = PDFArray.withContext(context);
  }

  static withContext(context: any) {
    return new PDFArrayCustom(context);
  }

  clone(context?: any) {
    const clone = PDFArrayCustom.withContext(context);
    for (let idx = 0, len = this.size(); idx < len; idx++) {
      clone.push(this.get(idx));
    }
    return clone;
  }

  toString() {
    let arrayString = '[';
    for (let idx = 0, len = this.size(); idx < len; idx++) {
      arrayString += this.get(idx).toString();
      if (idx < len - 1) arrayString += ' ';
    }
    arrayString += ']';
    return arrayString;
  }

  sizeInBytes() {
    let size = 2;
    for (let idx = 0, len = this.size(); idx < len; idx++) {
      size += this.get(idx).sizeInBytes();
      if (idx < len - 1) size += 1;
    }
    return size;
  }

  copyBytesInto(buffer: Uint8Array, offset: number) {
    const initialOffset = offset;

    buffer[offset++] = CharCodes.LeftSquareBracket;
    for (let idx = 0, len = this.size(); idx < len; idx++) {
      offset += this.get(idx).copyBytesInto(buffer, offset);
      if (idx < len - 1) buffer[offset++] = CharCodes.Space;
    }
    buffer[offset++] = CharCodes.RightSquareBracket;

    return offset - initialOffset;
  }

  private size() {
    return this.pdfArray.size();
  }

  private get(idx: number) {
    return this.pdfArray.get(idx);
  }

  private push(item: any) {
    return this.pdfArray.push(item);
  }
}
