import {Node, Edge, IdType} from 'vis';
import { EdgeTypes, NodeTypes } from './chart/chart.consts'
import { ProjectPath } from "./app.component";
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
  markForBottomLabel?: boolean
  dragWithParent?: boolean
  type?: NodeTypes
  isHoverLabel?: boolean
  belongsToGroup?: IdType
  isCustom?: boolean
  isWasEdited?: boolean
  isMarkedDone?: boolean
}

export interface BasicVisiEdgeInfo {
  type: EdgeTypes
}

export interface MatchInfoResponse {
  line: string,
  value?: string,
  lineNumber: number,
  indexInLine?: number,
  endLineNumber?: number,
  isRegex?: boolean,
  flags?: string,
  endContentLine?: number
}

export interface MatchInfo extends MatchInfoResponse, BasicVisiInfo {
  selectedByUser?: boolean,
  id: string,
  ofFile: FileId
}

export  interface VisiNode extends  Node {
  d: BasicVisiInfo
}

export interface VisiEdge extends Edge {
  d: BasicVisiEdgeInfo
}

export interface FileNode extends Node {
  d: FileInfo
}

export interface MatchNode extends Node {
  d: MatchInfo
}

export interface GroupNode extends FileNode {
  d: GroupInfo
}

export interface FileId {
  path: string,
  gitUrl: string
}

export interface FileInfo extends BasicVisiInfo {
  fileContent: string,
  fileId: FileId
}

export interface GroupInfo extends FileInfo {
  isCollpased: boolean
}

export interface FindInFilesResponse {
  fullLocalPath: string,
  content: string,
  matches: MatchInfoResponse[]
}

export interface FindInFilesResponseUI extends FindInFilesResponse {
  fileId: FileId,
  matches: MatchInfo[]
  selectedInSelectionDialog: boolean
}

export interface SaveToCodeRequest {
  dirPath: string; gitUrl: string, files: { file: string, content: string }[]
}

export interface ReloadFilesResponse {
  fileId: FileId,
  content: string,
  error?: string
}

export interface SaveNodesResponse {
  savedId: string,
  exisitingId: string
}

export enum SearchEnum {searchInFolder, searchInFile, getLinesFromFile, searchAroundLine, openFile}

export interface SearchRequest {
  searchObject: SearchObject,
  searchType: SearchEnum
}


export interface SearchObject {
  title: string,
  pattern: string,
  flags: string,
  searchPath: string, // used when  get file
  projectPath: ProjectPath,
  filenamePattern: string,
  isRegex: boolean,
  isFileNameRegex: boolean,
  originalText: string,
  lineNumbers: number[], // used when getting specific line
}

export interface ReloadRequest {
  matches: MatchInfoResponse[],
  filePaths: string[],
  dirPath: string,
  gitUrl: string
}

export const VISI_PREFIX = '/*Visi->';
export const VISI_SUFFIX = '<-Visi*/';
export const EndPoints = {
  find: '/find',
  isUp: '/isUp',
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
  setPaths: '/setPaths',
  checkFilesExist: '/checkFileExist',
};


export class CreateTypes {
  public static createSaveNode(lineNumber: number, fileId: FileId) {
    return {lineNumber: lineNumber, fileId: {path: fileId.path, gitUrl: fileId.gitUrl}};
  }
}


