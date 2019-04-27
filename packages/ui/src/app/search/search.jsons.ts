export interface PreSearchJson {
  regex: any,
  name: string
}

export class PreSeacrhJsonsUtils {
  public static getSearchStringFromText(text: string, preRegex: string) {
    return preRegex.replace('__TEXT__', text.trim());
  }
}

export const specificSearchJsons: PreSearchJson[] = [
  {
    regex: '\\s*(public|private)\\s*__TEXT__\\(',
    name: 'method decleration'
  },
  {
    regex: '\\s*[^\\.]\\s*__TEXT__\\(',
    name: 'method decleration 2'
  },
  {
    regex: '(\\.|")__TEXT__\\(.*\\)',
    name: 'method usage'
  },
  {
    regex: '\\.__TEXT__[^(]',
    name: 'variable usage'
  },
  {
    regex: '\\b__TEXT__\\b',
    name: 'exact'
  },
  {
    regex: '\\s*((public)?|(private)?)\\s+__TEXT__\\b',
    name: 'variable decleration'
  },
  {
    regex: '\\s*("?)__TEXT__("?):',
    name: 'json field decleration'
  }
];

