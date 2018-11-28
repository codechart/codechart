import {Edge, IdType, Node} from "vis";

export const AttributesKey = 'd'
export const OldStyleKey = 'oldStyle'
export class ChartUtils {
  public static isOfFile(node) {
    return ChartUtils.getAttributes(node).ofFile
  }

  public static isFileNode(item: Node | Edge) {
    if(!ChartUtils.isNode(item)) return false
    return (ChartUtils.getAttributes(item).fileContent)
  }

  public static isFileEdge(item: Node | Edge) {
    if(ChartUtils.isNode(item)) return false
    return (ChartUtils.getAttributes(item).type==='ofFile')
  }

  public static getFileNodeContent(node) {
    if(node.d!==undefined)
      return ChartUtils.getAttributes(node).fileContent
    else return null
  }

  public static getOfFile(node: Node): string {
    return ChartUtils.getAttributes(node).ofFile
  }

  public static isNode(item) {
    return this.getEdgeFrom(item) ? false : true
  }

  public static getEdgeFrom(edge: Edge): IdType {
    return edge.from
  }

  public static getEdgeTo(edge: Edge): IdType {
    return edge.to
  }

  public static filterNodes(nodesAndLinks: Array<Node | Edge>): Node[] {
    return nodesAndLinks.filter(i => {if(ChartUtils.isNode(i)) return i}) as Node[]
  }

  public static filterEdges(nodesAndLinks: Array<Node | Edge>): Edge[] {
    return nodesAndLinks.filter(i => {if(!ChartUtils.isNode(i)) return i}) as Edge[]
  }

  public static getAttributes(element: Node | Edge) {
    return element[AttributesKey]
  }

  public static saveOldStyleAndSetNewStyle(element: any, newStyle: any) {
    for(let key in newStyle) {
      element[AttributesKey][OldStyleKey] = {}
      element[AttributesKey][OldStyleKey][key] = element[key]
      element[key] = newStyle[key]
    }
    return element
  }

  public static setElementAttributesAndGet(element, newAttributes: any) {
    let newAttributesObject = Object.assign(element[AttributesKey], newAttributes)
    return Object.assign(element, {AttributesKey: newAttributesObject})
  }

}
