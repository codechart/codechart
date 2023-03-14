import { Node, Edge, IdType } from 'vis'
import { EdgeTypes, NodeTypes } from './chart/chart.consts'
import { CCPath } from './app.component'
/**
 * Created by USER on 29/11/2018.
 */
export interface SaveJson {
  nodes: SaveNode[]
  dirPath: string
}

export interface SaveNode {
  lineNumber: number
  filePath: string
  id: string
}

export interface BasicVisiInfo {
  markForBottomLabel?: boolean
  dragWithParent?: boolean
  type?: NodeTypes
  isHoverLabel?: boolean
  belongsToGroup?: IdType
  isCustom?: boolean
}

export interface BasicVisiEdgeInfo {
  type: EdgeTypes
}

export interface MatchInfo extends BasicVisiInfo {
  line: string
  value?: string
  lineNumber: number
  indexInLine?: number
  endLineNumber?: number
  id: string
  isRegex?: boolean
  flags?: string
  endContentLine?: number
  ofFile: string | IdType
  selectedByUser?: boolean
}

export interface VisiNode extends Node {
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

export interface FileInfo extends BasicVisiInfo {
  fileContent: string
  path: string
  gitUrl: string
}

export interface GroupInfo extends FileInfo {
  isCollpased: boolean
}

export interface FindInFilesResponse {
  file: string
  content: string
  selectedByUser?: boolean
  matches: MatchInfo[]
}

export interface SaveToCodeRequest {
  path: string
  files: { file: string; content: string }[]
}

export interface ReloadFilesResponse {
  file: string
  content: string
  error?: string
}

export interface SaveNodesResponse {
  savedId: string
  exisitingId: string
}

export enum SearchEnum {
  searchInFolder,
  searchInFile,
  getLinesFromFile,
  openFile,
}

export interface SearchObject {
  title: string
  pattern: string
  flags: string
  searchPath: string // used when  get file
  folderPath: CCPath
  filenamePattern: string
  isRegex: boolean
  isFileNameRegex: boolean
  originalText: string
  lineNumbers: number[] // used when getting specific line
}

export interface SearchRequest extends SearchObject {
  searchType: SearchEnum
}

export interface ReloadRequest {
  matches: MatchInfo[]
  filePaths: string[]
  dirPath: string
  gitUrl: string
}

export const VISI_PREFIX = '/*Visi->'
export const VISI_SUFFIX = '<-Visi*/'
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
  searchDiagram: '/diagrams/search/',
  loadDiagram: '/diagrams/',
  deleteDiagram: '/diagrams/delete/',
  approveLicense: '/approveLicense',
  addPath: '/addPath',
  setPaths: '/setPaths',
  checkFilesExist: '/checkFileExist',
}

export class CreateTypes {
  public static createSaveNode(
    lineNumber: number,
    filePath: string,
    id: string
  ) {
    return { lineNumber: lineNumber, filePath: filePath, id: id }
  }
}
