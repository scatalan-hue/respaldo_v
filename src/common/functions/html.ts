import * as cheerio from 'cheerio';
import * as htmlparser2 from 'htmlparser2';

export function replaceValuesSignElectronic(html: string, replacements: Record<string, string>): string {
  const $ = cheerio.load(html);

  // Recorre el objeto de reemplazos y actualiza los valores en el HTML
  Object.keys(replacements).forEach((selector) => {
    $(selector).text(replacements[selector]);
  });

  return $.html();
}
