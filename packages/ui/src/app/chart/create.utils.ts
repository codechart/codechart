import { Color, Edge, IdType, Node } from 'vis'
import { CcItemStyles, NodeColor, NodeTypes } from './chart.consts';
import { ChartWrapper } from './chart.wrapper';

import * as md5 from 'md5';
import { FileId, FileNode, FindInFilesResponse, FindInFilesResponseUI, MatchInfo, MatchNode } from '../types.nodejs'
import { ChartUtils } from './chart.utils';
import { Utils } from './Utils';
import { ProjectPath } from '../app.component'
import invert from 'invert-color';


export class CreateUtils {

  public static createOrUpdateMatchNode(match: MatchInfo, fileId: FileId, chart: ChartWrapper, connectToNode: Node, additionalStyle?): Array<Node | Edge> {
    const searchIndex = chart.history.getSearchCount();
    let results: Array<Node | Edge> = [];
    let matchNode: Node = ChartUtils.getSameMatch(chart, match, fileId);
    if (matchNode === null) {
      matchNode = this.createMatchNode(match, fileId, chart, additionalStyle)
      if (connectToNode !== null && connectToNode.id !== matchNode.id && !ChartUtils.isFileNode(connectToNode)) {
        results.push(CreateUtils.createMatchEdge(chart, connectToNode.id, matchNode.id));
      }
      let fileEdge = null
      fileEdge = CreateUtils.createFileEdge(chart, CreateUtils.createFileNodeId(fileId), match.id);
      console.log(fileEdge)
      results.push(fileEdge);
    } else {
      let matchAttributes = ChartUtils.getMatchAttributes(matchNode);
      if (!ChartUtils.isSameFileId(matchAttributes.ofFile, fileId)) {
        matchNode.x = null;
        matchNode.y = null;
        let fileEdge = chart.getItems(chart.getAllItemIds().edges).edges.find((i) => {
          return ((i.from === match.id && i.to === matchAttributes.ofFile) || (i.from === matchAttributes.ofFile && i.to === match.id));
        });
        if (fileEdge)
          chart.deleteItems({ edges: [fileEdge.id], nodes: [] });
        else
          console.log(`no file edge found from match ${match.id} and file node ${matchAttributes.ofFile}`);
      }
      ChartUtils.setAttributes(matchNode, match);
    }
    let endContentLine = match.endContentLine;
    ChartUtils.setContentEndLine(matchNode, endContentLine)

    results.push(matchNode);
    console.log('results', results)
    if (searchIndex) {
      // let numberingNode = chart.createNode('numbering_'+matchNode.id+'_'+searchIndex, searchIndex.toString(), ChartStyles.numberNode)
      // let numberingEdge = chart.createLink(matchNode.id, numberingNode.id, ChartStyles.numberLink)
      // results = results.concat([numberingNode, numberingEdge])
    }
    return results;
  }


  public static createMatchNode(match: MatchInfo, ofFileNodeId, chart: ChartWrapper, additionalStyle?) {

    let matchNodeId = match.id;
    let matchNodeProps = Object.assign({
      d: Object.assign(match, { ofFile: ofFileNodeId })
    }, CcItemStyles.resultNode);
    let matchNode: Node
    matchNode = chart.createNode(matchNodeId, '', matchNodeProps);

    matchNode = Utils.deepMerge(matchNode, CcItemStyles.searchNode);
    if (additionalStyle) matchNode = Utils.deepMerge(matchNode, additionalStyle);

    return matchNode;
  }

  public static createFileNameNode(fileName, node: Node, color: Color, chart: ChartWrapper): Array<Edge | Node> {
    let myInvert = invert
    let filenameNode = chart.createNode('filename_' + node.id, '', { d: { type: 'filename' } });
    filenameNode.label = fileName;
    filenameNode.x = node.x - 50;
    filenameNode.y = node.y - 50;
    filenameNode = Utils.deepMerge(filenameNode, CcItemStyles.filenameNode);
    filenameNode.color = { background: color.border, border: myInvert(color.background) }
    filenameNode.font = { color: myInvert(color.border, true) }
    filenameNode = ChartUtils.setDragWithParent(filenameNode)
    delete filenameNode['widthConstraint'];
    let filenameEdge = chart.createLink(node.id, filenameNode.id, CcItemStyles.filenameEdge, { idPrefix: 'filenameEdge' });
    filenameEdge.physics = false
    filenameEdge.smooth = false
    return [filenameEdge, filenameNode];

  }

  // if match exists, in same file - update line, line number
  // if match exists, different file - update line, line number, move to new file
  public static createMatchId(fileId: FileId, startLineNumber, endLineNumber): string {
    return `${fileId.path}#${fileId.gitUrl}#${startLineNumber}#${endLineNumber}`;
  }

  public static createShapeId(shapeType, id): string {
    return shapeType + id + new Date().getMilliseconds();
  }

  public static createFileEdge(chart: ChartWrapper, ofFileNodeId: string | IdType, matchNodeId: string | IdType) {
    return chart.createLink(ofFileNodeId, matchNodeId, CcItemStyles.fileLink, { idPrefix: 'fileEdge' });
  }

  public static createMatchEdge(chart: ChartWrapper, nodeToConnectId, matchNodId) {
    return chart.createLink(nodeToConnectId, matchNodId, CcItemStyles.matchMatchLink, { idPrefix: `match` });
  }

  public static createFileNode(file: FindInFilesResponseUI, chart: ChartWrapper, existingFileColors: string[], xPos, projectPath: ProjectPath): FileNode {
    let fileNodeId = this.createFileNodeId(file.fileId)

    let filePath = file.fileId.path;
    let pathChar = filePath.indexOf('\\') !== -1 ? '\\' : '/';
    let fileName = filePath.substring(file.fileId.path.lastIndexOf(pathChar), file.fileId.path.length);
    let fileNode = chart.createNode(fileNodeId, fileName, CcItemStyles.fileNode);
    fileNode.x = xPos;
    (fileNode.color as Color).border = (Utils.getRandomColor_useList(existingFileColors) as NodeColor).background;
    return ChartUtils.setElementAttributesAndGet(Utils.deepCopy(fileNode), {
      fileContent: file.content,
      fileId: Utils.deepCopy(file.fileId)
    });
  }

  public static createFileId(filePath, gitUrl): FileId {
    return {
      path: filePath,
      gitUrl: gitUrl
    }
  }


  public static createFileNodeId(fileId: FileId) {
    const replaceFunc = (str) => str.replace(/[\\\/]+/g, '+').replace(/[^a-zA-Z\+\.\:\d\s]/g, '*')
    return replaceFunc(fileId.path) + '#' + (fileId.gitUrl ? replaceFunc(fileId.gitUrl) : '')
  }

  public static createFailedSyncNode(node: MatchNode, chart, oldLineText): { node: Node, edge: Edge } {
    let failedNode = this.createMatchNode({ id: null, line: oldLineText, ofFile: ChartUtils.getOfFileId(node), lineNumber: node.d.lineNumber }, ChartUtils.getOfFileId(node), chart, CcItemStyles.failedSyncNode) as MatchNode
    failedNode.d.type = NodeTypes.failedSync
    failedNode.id = "failed_" + node.id
    failedNode = Utils.deepMerge(failedNode, CcItemStyles.failedSyncNode)
    if (oldLineText !== null && oldLineText !== undefined) {
      failedNode = Utils.deepMerge(failedNode, { d: { oldLineText: oldLineText } })
    }
    failedNode.x = (node.size ? (node.size) : 0) + node.x + 100;
    failedNode.y = (node.size ? (node.size) : 0) + node.y + 100;
    failedNode.label = oldLineText
    failedNode.d.isWasEdited = true
    let edge = chart.createLink(node.id, failedNode.id, {}, { idPrefix: 'failed' })
    edge.arrows = null
    return { node: failedNode, edge: edge }
  }
}
