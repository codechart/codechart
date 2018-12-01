import {Edge, Node} from "vis";
import {ChartStyles} from "./chart.styles";
import {ChartWrapper} from "./chart.wrapper";

import * as md5 from 'md5';
import {MatchInfo, CreateTypes} from "../types.nodejs";
import {ChartUtils} from "./chart.utils";


export class CreateUtils {
  public static createMatchFromSelection(filePath, fileText, selectedText, selectionStart): MatchInfo {
    let textUpToSelection = fileText.replace('\r\n', '').substring(0, selectionStart)
    let lines = textUpToSelection.split('\n')
    let lineStartIndex = textUpToSelection.lastIndexOf('\n')
    let lineEndIndex = selectionStart
    while(fileText.charAt(lineEndIndex) !== '\n' && lineEndIndex<2000){ lineEndIndex++ }
    return CreateTypes.matchInfo(
      fileText.substring(lineStartIndex+1, lineEndIndex+2),
      selectedText,
      lines.length-1,
      lineStartIndex,
      selectionStart - lineStartIndex,
      CreateUtils.createId(filePath, lines.length - 1),
      false,
      'gi'
    )
  }

  public static createMatchNode(match: MatchInfo, ofFileNodeId, chart: ChartWrapper, connectToNode: Node): Array<Node | Edge> {
    let results: Array<Node | Edge> = []
    let matchNodeId = match.id
    let matchNodeProps = Object.assign({
      d: Object.assign(match, {ofFile: ofFileNodeId})
    }, ChartStyles.resultNode)
    results.push(chart.createNode(matchNodeId, match.line, matchNodeProps))
    results.push(CreateUtils.createFileEdge(chart, ofFileNodeId, matchNodeId))
    if (connectToNode !== null && connectToNode.id!==matchNodeId && !ChartUtils.isFileNode(connectToNode)) {
      results.push(CreateUtils.createMatchEdge(chart, connectToNode.id, matchNodeId, match.value))
    }
    return results
  }

  public static createId(filePath, lineNumber):string {
    return md5(filePath + lineNumber + new Date().getMilliseconds)
  }

  public static createFileEdge(chart: ChartWrapper, ofFileNodeId, matchNodeId) {
    return chart.createLink(ofFileNodeId, matchNodeId, ChartStyles.fileLink)
  }

  public static createMatchEdge(chart: ChartWrapper, nodeToConnectId, matchNodId, matchValue) {
    return chart.createLink(nodeToConnectId, matchNodId, ChartStyles.matchMatchLink, matchValue)
  }
}
