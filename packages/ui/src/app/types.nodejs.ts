import {Node, Edge, IdType} from 'vis';
import { NodeTypes } from './chart/chart.consts'
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

export interface BasicVisiInfo {
  type?: NodeTypes
  isHoverLabel?: boolean
}

export interface MatchInfo extends BasicVisiInfo {
  line: string,
  value?: string,
  lineNumber: number,
  indexInLine?: number,
  endLineNumber?: number,
  id: string,
  isRegex?: boolean,
  flags?: string,
  endContentLine?: number
  ofFile: string | IdType,
  selectedByUser?: boolean
}

export interface FileNode extends Node {
  d: FileInfo
}

export interface MatchNode extends Node {
  d: MatchInfo
}

export interface FileInfo extends BasicVisiInfo{
  fileContent: string,
  path: string,
}

export interface FindInFilesResponse {
  file: string,
  content: string,
  selectedByUser?: boolean,
  matches: MatchInfo[]
}

export interface SaveToCodeRequest {
  dirPath: string; files: { file: string, content: string }[]
}

export interface ReloadFilesResponse {
  file: string,
  content: string
}

export interface SaveNodesResponse {
  savedId: string,
  exisitingId: string
}

export interface SearchObject {
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
  saveToCode2: '/saveToCode2',
  saveToCode: '/saveToCode',
  loadFromCode: '/loadFromCode',
  rewriteVisiIds: '/rewriteVisiIds',
  getPaths: '/getPaths',
  clearVisiIds: '/clearVisiIds',
  getAllFilesInPath: '/getAllFilesInDirectory',
  getLanguages: '/getLanguages',
  reloadFiles: '/reloadFiles',
  createDiargam: '/diagrams/create',
  updateDiagram: '/diagrams/update',
  searchDiagram: "/diagrams/search/",
  loadDiagram: "/diagrams/",
  deleteDiagram: "/diagrams/delete/",
  approveLicense: "/approveLicense",
  addPath: '/addPath',
  checkFilesExist: '/checkFileExist',
};


export class CreateTypes {
  public static createSaveNode(lineNumber: number, filePath: string, id: string) {
    return {lineNumber: lineNumber, filePath: filePath, id: id};
  }
}

