import { Edge, IdType, Node } from 'vis';
import { TypeMapping } from './jsons';
import { FileId, FileNode, MatchInfo, MatchNode, VisiNode } from '../types.nodejs'
import { ChartConsts, ContentEdgeTypes, NodeTypes } from './chart.consts'
import { ChartWrapper } from './chart.wrapper';
import { Utils } from './Utils'

export const AttributesKey = 'd';
export const OldStyleKey = 'oldStyle';

export class ChartUtils {
  static setPosition(matchNode: any, fileNodePos: any) {
    throw new Error('Method not implemented.');
  }

  public static setWasEdited(item: Node | Edge): Node | Edge {
    item[AttributesKey].wasEdited = true
    return item
  }

  public static isWasEdited(item: Node | Edge) {
    return item[AttributesKey].wasEdited
  }

  public static setDragWithParent(newNode: VisiNode): VisiNode {
    newNode.d.dragWithParent = true
    return newNode
  }

  public static isDragWithParent(node: VisiNode): boolean {
    return node.d.dragWithParent
  }

  public static getElementSize(element: Node | Edge): number {
    if (ChartUtils.isFileEdge(element)) {
      return (element as Edge).width;
    } else {
      let node = (element as Node);
      if (node.font) {
        return (node.font as any).size;
      }
      return null;
    }
  }

  public static isFileNode(item: Node | Edge, excludeCustom: boolean = false): boolean {
    if (!ChartUtils.isNode(item)) return false;
    const isFileNode = ChartUtils.getMatchAttributes(item as Node) && ChartUtils.getMatchAttributes(item as Node).fileContent
    if(!excludeCustom) return isFileNode;
    else return  ChartUtils.isCustomNode(item)
  }

  public static isSearchNode(item: Node | Edge): boolean {
    if (item.id.toString().startsWith('search_')) return true;
  }

  public static isFileEdge(item: Node | Edge): boolean {
    if (ChartUtils.isNode(item)) return false;
    return item['d'].type === NodeTypes.ofFile;
  }

  public static isNode(item): boolean {
    return this.getEdgeFrom(item) || this.getEdgeTo(item) ? false : true;
  }

  public static getEdgeFrom(edge: Edge): IdType {
    return edge.from;
  }

  public static getEdgeTo(edge: Edge): IdType {
    return edge.to;
  }

  public static setNewStyleAndGet(element: any, newStyle: any) {
    for (let key of Object.keys(newStyle)) {
      element[AttributesKey][OldStyleKey] = {};
      element[AttributesKey][OldStyleKey][key] = element[key];
      element[key] = newStyle[key];
    }
    return element;
  }

  public static filterNodes(nodesAndLinks: Array<Node | Edge>): Node[] {
    return nodesAndLinks.filter(i => {
      if (ChartUtils.isNode(i)) return i;
    }) as Node[];
  }

  public static filterEdges(nodesAndLinks: Array<Node | Edge>): Edge[] {
    return nodesAndLinks.filter(i => {
      if (!ChartUtils.isNode(i)) return i;
    }) as Edge[];
  }

  public static setElementAttributesAndGet(element, newAttributes: any) {
    let newAttributesObject = Object.assign({}, element[AttributesKey], newAttributes);
    return Object.assign({}, element, { d: newAttributesObject });
  }

  public static getFileNodeContent(node) {
    if (node.d !== undefined)
      return ChartUtils.getMatchAttributes(node).fileContent;
    else return null;
  }

  public static setFileContent(node: Node, content, chart: ChartWrapper) {
    chart.updateNodeAtts([node], { fileContent: content });
  }

  public static getOfFileId(node: Node): FileId {
    return ChartUtils.getMatchAttributes(node).ofFile;
  }

  public static isSameFileId(ofFile1: FileId, ofFile2: FileId): boolean {
    let path1 = ofFile1.path.replace(/[^a-zA-Z0-9 ]/g, "")
    let path2 = ofFile2.path.replace(/[^a-zA-Z0-9 ]/g, "")
    return (path1 === path2 && ofFile1.gitUrl === ofFile2.gitUrl)
  }

  public static getSameMatch(chart: ChartWrapper, match: MatchInfo, ofFileNodeId: FileId) {
    let sameExisitingMatch = null;
    // sometimes end line number equals start line number, even though in this case end should be null. probably happens when synching code
    let isSameEndline = (match1: MatchInfo, match2: MatchInfo) => {
      if(!match1.endLineNumber && !match2.endLineNumber) return true
      if(match1.lineNumber === match1.endLineNumber && !match2.endLineNumber) return true
      if(match2.lineNumber === match2.endLineNumber && !match1.endLineNumber) return true
      return false
    }
    try {
      let exisitingMatches = chart.getItems(chart.getAllItemIds().nodes).nodes.filter(i=>ChartUtils.isMatchNode(i));
      sameExisitingMatch = exisitingMatches.find((i: MatchNode) => {
        let sameStartLine = i.d.lineNumber === match.lineNumber
        let sameEndLine = isSameEndline(i.d, match)
        let sameOfFileId = ChartUtils.isSameFileId(i.d.ofFile, ofFileNodeId)
        let samePath = ChartUtils.isSameFileId(i.d.ofFile, match.ofFile)
        return (
          (sameStartLine && sameEndLine && ( sameOfFileId || samePath))
          ||
          match.id === i.id);
      });
    } catch (ex) {
      console.log(ex);
    }
    return sameExisitingMatch ? sameExisitingMatch : null;
  }

  public static getGitUrlsInChart(chart: ChartWrapper) {
    let urls: Set<String> = new Set()
    chart.getAllFileNodes().
      filter(i=>!ChartUtils.isCustomNode(i)).
      map((i: FileNode)=>i.d.fileId.gitUrl).
      forEach((i)=>urls.add(i))
    return Array.from(urls)
  }

  public static setOfFile(node: Node, newOfFile: FileId, chart: ChartWrapper) {
    chart.updateNodeAtts([node], { ofFile: newOfFile });
  }

  public static getMatchAttributes(element: Node): MatchInfo | FileNode | any /*so I dont need to cast result. sgould split this to get File and get Match atts*/ {
    return element[AttributesKey];
  }

  public static setAttributes(element: Node, newAttributes: MatchInfo | FileNode) {
    element[AttributesKey] = newAttributes;
  }

  public static getLineNumber(node: Node) {
    return ChartUtils.getMatchAttributes(node) ? ChartUtils.getMatchAttributes(node).lineNumber : null;
  }

  public static getEndLineNumber(node: Node) {
    return ChartUtils.getMatchAttributes(node) as MatchInfo ? ChartUtils.getMatchAttributes(node).endLineNumber : null;
  }

  public static setLineNumber(node: Node, newLineNumber, chart: ChartWrapper) {
    chart.updateNodeAtts([node], { lineNumber: newLineNumber });
  }

  public static setLine(node: Node, newLine, chart: ChartWrapper) {
    chart.updateNodeAtts([node], { line: newLine });
  }

  public static getIndexInLine(item: Node | Edge) {
    return ChartUtils.getMatchAttributes(item as Node).indexInLine;
  }

  public static getStyleForTypesJson(typesJson: TypeMapping[], node: Node) {
    let nodesStyles: TypeMapping[] = typesJson.filter(type => {
      return type.item === 'node';
    });
    let types = nodesStyles.filter((type: TypeMapping) => {
      let regex = new RegExp(type.regexCondition);
      return regex.exec(ChartUtils.getLine(node)) !== null;
    });
    if (types.length > 0) return types[0].style;
    else return {};
  }

  public static getLine(node) {
    return this.getMatchAttributes(node).line;
  }

  public static getFilePath(fileNode: FileNode): string {
    return fileNode.d.fileId.path;
  }

  static isCustomNode(item: Node) {
    return item[AttributesKey] ? item[AttributesKey]['isCustom'] : false;
  }

  static isMatchNode(node: Node): boolean {
    try {
      if (ChartUtils.getOfFileId(node) && ChartUtils.getLineNumber(node) !== undefined && ChartUtils.getLineNumber(node) !== null) return true;
      else return false;
    } catch(e) {
      return false
    }
  }

  static getContentEndLine(j: Node) {
    return (ChartUtils.getMatchAttributes(j) as MatchInfo).endContentLine;
  }

  static setContentEndLine(node: Node, lineNumber) {
    (ChartUtils.getMatchAttributes(node) as MatchInfo).endContentLine = lineNumber;
  }

  static isFilenameNode(node: Node) {
    return node['d'] && node['d'].type === 'filename';
  }


  static isFilenameEdge(edge: Edge) {
    return (edge.id as string).indexOf('filename')!==-1
  }


  static isInContentEdge(edge: Edge) {
    return edge[AttributesKey].type === ContentEdgeTypes.insideContent
  }

  static setFileNodIsGrouped(node: Node, isGrouped: boolean) {
    node['d'].isGrouped = isGrouped
    return node
  }

  static getFileNodeIsGrouped(node) {
    return node['d'].isGrouped
  }

  public static getMiddlePoint = (nodes: Node[], xOrY: string, chart: ChartWrapper) => {
    return nodes.map(i => chart.getPosition(i.id)[xOrY]).reduce((soFar, current) => {
      return (current + soFar);
    }, 0) / nodes.length;
  };

  public static getFilenameNode(matchNode: Node): IdType {
    return 'filename_' + matchNode.id
  }

  static isMatchEdge(i: Edge | Node) {
    if (ChartUtils.isNode(i)) return false
    return i.id.toString().startsWith('match');
  }

  static isFailedSyncIndicator(i: Node) {
    return i.id.toString().startsWith('failed_');
  }

  static isFailedSyncIndicatorEdge(i: Edge) {
    return i.id.toString().startsWith('failed_');
  }

  static getMatchCodeLineLabel(node) {
    let matchTrimmedLabel = () => {
      let label = ChartUtils.getLine(node).trim()
      if(ChartUtils.isFailedSyncIndicator(node)) return label.match(/.{1,30}/g).join('\n')

      if(label.length>ChartConsts.maxTitleLength) label = label.substring(0, ChartConsts.maxTitleLength) + '...'
      return label
    }

    if (!ChartUtils.getLineNumber || !ChartUtils.getLine(node)) {
      console.log('error in set match line')
      return ''
    }
    let title = ChartUtils.getLineNumber(node) + (ChartUtils.getEndLineNumber(node) ? '-' + ChartUtils.getEndLineNumber(node) : '') + ':'  + matchTrimmedLabel()

    return title
  }

  static setIsCustom(node: Node): Node {
    node[AttributesKey]['isCustom'] = true
    return node
  }

  static removeOrphanEdges(edges: Edge[], chart: ChartWrapper): Edge[] {
    return edges.filter((edge: Edge) => {
      {
        try {
          if (chart.getItem(edge.from) && chart.getItem(edge.to))
            return true
          else {
            console.log(`orphaned edge ${edge.id} was deleted`);
            return false
          }
        } catch (ex) {
          console.log('exception in clearing orphan edges for save')
          return false
        }
      }
    })
  }

  static getDontDrawRectangle(node: Node) {
    return ChartUtils.getMatchAttributes(node).dontDrawRectangle;
  }

  static setDontDrawRectangle(node: Node, draw: boolean) {
    return ChartUtils.getMatchAttributes(node).dontDrawRectangle = draw;
  }

  static isGroupNode(node: VisiNode) {
    return ChartUtils.isFileNode(node) && (node.d.isCustom || node.d.type===NodeTypes.groupNode)
  }

  static isMatchOfFile(matchNode: MatchNode, fileNode: FileNode): Boolean {
    return ChartUtils.isSameFileId(matchNode.d.ofFile, fileNode.d.fileId)
  }

  public static isOfFileExists(node): boolean {
    return ChartUtils.getMatchAttributes(node).ofFile;
  }

}

