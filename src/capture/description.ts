const numberFormat = new Intl.NumberFormat('fr-FR');

/**
 * Texte du compteur de la description, « <nombre> / <limite> », le nombre au format français (design.md, décision 3).
 * La limite reste écrite sans séparateur des milliers, comme dans la spec : « 1 240 / 2000 ».
 */
export function formatCharacterCount(count: number, limit: number): string {
  return `${numberFormat.format(count)} / ${limit}`;
}
