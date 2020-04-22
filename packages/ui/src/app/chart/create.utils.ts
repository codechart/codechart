import {Edge, Node} from 'vis';
import {ChartStyles} from './chart.consts';
import {ChartWrapper} from './chart.wrapper';

import * as md5 from 'md5';
import {FileNode, FindInFilesResponse, MatchInfo} from '../types.nodejs';
import {ChartUtils} from './chart.utils';
import {Utils} from './Utils';
import {PositioningOptions} from './chart.actions';
import {Options} from '../app.component';


export class CreateUtils {

  public static getMatchNodeLabel(lineNumber, endLineNumber, label) {
    if (label.length > 100) {
      label = label.substring(0, 100) + '...';
    }
    if (endLineNumber) return `(${lineNumber}-${endLineNumber}):${label.trim()}`;
    return `(${lineNumber}):${label.trim()}`;
  }

  public static createOrUpdateMatchNode(match: MatchInfo, ofFileNodeId, chart: ChartWrapper, connectToNode: Node, layout: 'directional' | 'spread'): Array<Node | Edge> {
    const searchIndex = chart.history.getSearchCount();
    let results: Array<Node | Edge> = [];
    let matchNode: Node = ChartUtils.getSameMatch(chart, match, ofFileNodeId);
    if (matchNode === null) {
      let matchNodeId = match.id;
      let matchNodeProps = Object.assign({
        d: Object.assign(match, {ofFile: ofFileNodeId})
      }, ChartStyles.resultNode);
      let label = CreateUtils.getMatchNodeLabel(match.lineNumber, match.endLineNumber, match.line);
      if (label.length > 30) label = label.substring(0, 30) + '...';
      matchNode = chart.createNode(matchNodeId, label, matchNodeProps);
      matchNode = Utils.deepMerge(matchNode, ChartStyles.searchNode);
    } else {
      let matchAttributes = ChartUtils.getMatchAttributes(matchNode);
      if (matchAttributes.ofFile !== ofFileNodeId) {
        matchNode.x = null;
        matchNode.y = null;
        let fileEdge = chart.getItems(chart.getAllItemIds().edges).edges.find((i) => {
          return ((i.from === match.id && i.to === matchAttributes.ofFile) || (i.from === matchAttributes.ofFile && i.to === match.id));
        });
        if (fileEdge)
          chart.deleteItems({edges: [fileEdge.id], nodes: []});
        else
          console.log(`no file edge found from match ${match.id} and file node ${matchAttributes.ofFile}`);
      }
      ChartUtils.setAttributes(matchNode, match);
    }
    if (connectToNode !== null && connectToNode.id !== matchNode.id && !ChartUtils.isFileNode(connectToNode)) {
      results.push(CreateUtils.createMatchEdge(chart, connectToNode.id, matchNode.id, matchNode.label));
    }
    results.push(matchNode);
    let fileEdge = CreateUtils.createFileEdge(chart, ofFileNodeId, match.id);
    if (layout === 'spread') fileEdge.hidden = false;
    results.push(fileEdge);
    if (searchIndex) {
      // let numberingNode = chart.createNode('numbering_'+matchNode.id+'_'+searchIndex, searchIndex.toString(), ChartStyles.numberNode)
      // let numberingEdge = chart.createLink(matchNode.id, numberingNode.id, ChartStyles.numberLink)
      // results = results.concat([numberingNode, numberingEdge])
    }
    return results;
  }


  public static createFileNameNode(fileName, node: Node, color: {background, border}, chart: ChartWrapper): Array<Edge | Node> {
    let filenameNode = chart.createNode('filename_' + node.id, '', {d: {type: 'filename'}});
    filenameNode.title = fileName;
    filenameNode.x = node.x - 50;
    filenameNode.y = node.y - 50;
    filenameNode.color = {
      border: 'black',
      background: color.border,
      highlight: {
        border: 'black',
        background: 'white'
      },
      hover: {
        border: 'black',
        background: 'white'
      }
    };
    delete filenameNode['widthConstraint'];
    let filenameEdge = chart.createLink(node.id, filenameNode.id, null, {idPrefix: 'filenameEdge'});
    return [filenameEdge, filenameNode];

  }

  // if match exists, in same file - update line, line number
  // if match exists, different file - update line, line number, move to new file
  public static createId(filePath, lineNumber): string {
    return md5(filePath + lineNumber + new Date().getMilliseconds);
  }

  public static createFileEdge(chart: ChartWrapper, ofFileNodeId, matchNodeId) {
    return chart.createLink(ofFileNodeId, matchNodeId, ChartStyles.fileLink, {idPrefix: 'fileEdge'});
  }

  public static createMatchEdge(chart: ChartWrapper, nodeToConnectId, matchNodId, matchValue) {
    return chart.createLink(nodeToConnectId, matchNodId, ChartStyles.matchMatchLink, {title: matchValue, idPrefix: `match`});
  }

  public static createFileNode(file: FindInFilesResponse, chart: ChartWrapper): FileNode {
    let pathChar = file.file.indexOf('\\') != -1 ? '\\' : '/';
    let fileName = file.file.substring(file.file.lastIndexOf(pathChar), file.file.length);
    let fileNode = chart.createNode(file.file, fileName, ChartStyles.fileNode);
    fileNode.color.border = Utils.shadeColor(Utils.getRandomColor(), 95);
    return ChartUtils.setElementAttributesAndGet(Utils.deepCopy(fileNode), {fileContent: file.content, path: file.file, level: 0});
  }
}
