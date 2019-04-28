import {Node, Edge, IdType} from 'vis';
/**
 * Created by USER on 29/11/2018.
 */
export interface SaveJson {
  nodes: SaveNode[]
}

export interface SaveNode {
  lineNumber: number,
  filePath: string,
  id: string
}

export interface MatchInfo {
  line: string,
  value: string,
  lineNumber: number,
  lineStartIndex: number,
  indexInLine: number,
  id: string,
  isRegex: boolean,
  flags: string
}

export interface FileNode extends Node {
  fileContent: string,
  path: string,
}

export interface FindInFilesResponse {
  file: string,
  content: string,
  matches: MatchInfo[]
}

export interface SaveNodesResponse {
  savedId: string,
  exisitingId: string
}

export interface SearchJson {
  title: string,
  pattern: string,
  flags: string,
  path: string,
  filenamePattern: string,
  isRegex: boolean,
  isFileNameRegex: false
}

export interface ReloadRequest {
  matches: MatchInfo[],
  files: { file: string }[]
}

export const VISI_PREFIX = '/*Visi->';
export const VISI_SUFFIX = '<-Visi*/';
export const EndPoints = {
  find: '/find',
  saveToCode: '/saveToCode',
  loadFromCode: '/loadFromCode',
  clearVisiIds: '/clearVisiIds',
  rewriteVisiIds: '/rewriteVisiIds'
};


export class CreateTypes {
  public static matchInfo(line: string, value: string, lineNumber: number, lineStartIndex: number, indexInLine: number, id: string, isRegex: boolean, flags: string): MatchInfo {
    return {
      line: line,
      value: value,
      lineNumber: lineNumber,
      lineStartIndex: lineStartIndex,
      indexInLine: indexInLine,
      id: id,
      isRegex: isRegex,
      flags: flags
    };

  }

  public static createSaveNode(lineNumber: number, filePath: string, id: string) {
    return {lineNumber: lineNumber, filePath: filePath, id: id};
  }
}

