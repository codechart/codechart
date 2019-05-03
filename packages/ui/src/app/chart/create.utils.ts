import {Edge, Node} from 'vis';
import {ChartStyles} from './chart.consts';
import {ChartWrapper} from './chart.wrapper';

import * as md5 from 'md5';
import {FileNode, FindInFilesResponse, MatchInfo} from '../types.nodejs';
import {ChartUtils} from './chart.utils';
import {LayoutEnum} from '../app.component';


export class CreateUtils {

  public static getMatchNodeLabel(lineNumber, label) {
    label = label.replace(/^\(\d+\):/, '');
    if(label.length>100) {label=label.substring(0, 100)+'...'}
    return `(${lineNumber}):${label.trim()}`;
  }

  public static createMatchNode(match: MatchInfo, ofFileNodeId, chart: ChartWrapper, connectToNode: Node, layout: LayoutEnum): Array<Node | Edge> {
    let results: Array<Node | Edge> = [];
    let matchNode: Node = ChartUtils.getSameMatch(chart, match, ofFileNodeId);
    if(matchNode===null) {
      let matchNodeId = match.id;
      let matchNodeProps = Object.assign({
        d: Object.assign(match, {ofFile: ofFileNodeId})
      }, ChartStyles.resultNode);
      let label = CreateUtils.getMatchNodeLabel(match.lineNumber, match.line);
      matchNode = chart.createNode(matchNodeId, label, matchNodeProps);
    }
    results.push(matchNode);
    let fileEdge = CreateUtils.createFileEdge(chart, ofFileNodeId, match.id);
    if(layout===LayoutEnum.spread) fileEdge.width=0.2;
    results.push(fileEdge);
    if (connectToNode !== null && connectToNode.id !== match.id && !ChartUtils.isFileNode(connectToNode)) {
      results.push(CreateUtils.createMatchEdge(chart, connectToNode.id, match.id, match.value));
    }
    return results;
  }

  public static createId(filePath, lineNumber): string {
    return md5(filePath + lineNumber + new Date().getMilliseconds);
  }

  public static createFileEdge(chart: ChartWrapper, ofFileNodeId, matchNodeId) {
    return chart.createLink(ofFileNodeId, matchNodeId, ChartStyles.fileLink);
  }

  public static createMatchEdge(chart: ChartWrapper, nodeToConnectId, matchNodId, matchValue) {
    return chart.createLink(nodeToConnectId, matchNodId, ChartStyles.matchMatchLink, matchValue);
  }

  public static createFileNode(file: FindInFilesResponse, chart: ChartWrapper): FileNode {
    let pathChar = file.file.indexOf('\\') != -1 ? '\\' : '/';
    let fileName = file.file.substring(file.file.lastIndexOf(pathChar), file.file.length);
    let fileNode = chart.createNode(file.file, fileName, ChartStyles.fileNode);
    return ChartUtils.setElementAttributesAndGet(fileNode, {fileContent: file.content, path: file.file, level: 0});
  }
}
