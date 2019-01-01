import {Edge, Node} from 'vis';
import {ChartStyles} from './chart.consts';
import {ChartWrapper} from './chart.wrapper';

import * as md5 from 'md5';
import {MatchInfo, CreateTypes, FindInFilesResponse} from '../types.nodejs';
import {ChartUtils} from './chart.utils';


export class CreateUtils {
  public static createMatchFromSelection(filePath, fileText, selectedText, selectionStart, chart: ChartWrapper): MatchInfo {
    if(selectedText==="") return
    let textUpToSelection = fileText.replace('\r\n', '\n').substring(0, selectionStart);
    let lines = textUpToSelection.split('\n');
    lines[lines.length-1] = lines[lines.length-1].trim()
    if(lines[lines.length-1]==="") lines.splice(-1, 1)
    let lineStartIndex = textUpToSelection.lastIndexOf('\n');
    let lineEndIndex = selectionStart;
    while (fileText.charAt(lineEndIndex) !== '\n') {
      lineEndIndex++;
    }
    let lineNumber = lines.length - 1;
    let line = fileText.substring(lineStartIndex+1, lineEndIndex);

    let existingNode = ChartUtils.getNodeByFileAndLineNumber(filePath, line, chart);
    let matchId: string = existingNode!==null ? existingNode.id as string : CreateUtils.createId(filePath, lines.length - 1);
    return CreateTypes.matchInfo(
      line,
      selectedText,
      lines.length - 1,
      lineStartIndex,
      selectionStart - lineStartIndex,
      matchId,
      false,
      'gi'
    );
  }

  public static createMatchNode(match: MatchInfo, ofFileNodeId, chart: ChartWrapper, connectToNode: Node): Array<Node | Edge> {
    let results: Array<Node | Edge> = [];
    let matchNodeId = match.id;
    let matchNodeProps = Object.assign({
      d: Object.assign(match, {ofFile: ofFileNodeId})
    }, ChartStyles.resultNode);
    results.push(chart.createNode(matchNodeId, match.line, matchNodeProps));
    results.push(CreateUtils.createFileEdge(chart, ofFileNodeId, matchNodeId));
    if (connectToNode !== null && connectToNode.id !== matchNodeId && !ChartUtils.isFileNode(connectToNode)) {
      results.push(CreateUtils.createMatchEdge(chart, connectToNode.id, matchNodeId, match.value));
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

  public static createFileNode(file: FindInFilesResponse, chart: ChartWrapper) {
    let pathChar = file.file.indexOf('\\') != -1 ? '\\' : '/';
    let fileName = file.file.substring(file.file.lastIndexOf(pathChar), file.file.length);
    let fileNode = chart.createNode(file.file, fileName, ChartStyles.fileNode);
    return ChartUtils.setElementAttributesAndGet(fileNode, {fileContent: file.content, path: file.file, level: 0});
  }
}
