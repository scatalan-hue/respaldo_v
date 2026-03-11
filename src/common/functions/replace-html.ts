import { IDictionary } from '../interfaces/dictionary.interface';

export function replaceHtmlWithDictionary(html: string, dictionary: IDictionary) {
  let modifiedHtml = html;

  for (const key in dictionary) {
    if (dictionary.hasOwnProperty(key)) {
      const value = dictionary[key];
      const tokenPattern = new RegExp(`\\[#${key}#\\]`, 'gi');
      modifiedHtml = modifiedHtml.replace(tokenPattern, value);
    }
  }

  return modifiedHtml as string;
}
