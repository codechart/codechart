import {Node, Edge, IdType} from 'vis';
/**
 * Created by USER on 29/11/2018.
 */
export interface SaveJson {
  nodes: SaveNode[],
  dirPath: string
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
  endLineNumber?: number,
  id: string,
  isRegex: boolean,
  flags: string,
  endContentLine?: number
  ofFile: string | IdType
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
  searchPath: string,
  dirPath: string,
  filenamePattern: string,
  isRegex: boolean,
  isFileNameRegex: boolean,
  originalText: string
}

export interface ReloadRequest {
  matches: MatchInfo[],
  files: { file: string }[],
  dirPath: string
}

export const VISI_PREFIX = '/*Visi->';
export const VISI_SUFFIX = '<-Visi*/';
export const EndPoints = {
  find: '/find',
  saveToCode: '/saveToCode',
  loadFromCode: '/loadFromCode',
  rewriteVisiIds: '/rewriteVisiIds',
  getPaths: '/getPaths',
  clearVisiIds: '/clearVisiIds',
  getAllFilesInPath: '/getAllFilesInDirectory'
};


export class CreateTypes {
  public static createSaveNode(lineNumber: number, filePath: string, id: string) {
    return {lineNumber: lineNumber, filePath: filePath, id: id};
  }
}

