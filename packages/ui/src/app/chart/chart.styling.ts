import {Edge, IdType, Node} from 'vis';
import { AppComponent } from "../app.component";
import { AttributesKey, ChartUtils } from "./chart.utils";
import { ChartWrapper, VisiNodes } from "./chart.wrapper";

export class ChartStyling {
    chart: ChartWrapper;

    constructor(private appComponent: AppComponent) {}

    initialize() {
        this.chart = this.appComponent.chart
    }


    public static setCodeLinesVisible(app: AppComponent, nodes: Node[]): Node[] {
      let filterFunc =  (node: Node) => ChartUtils.isMatchNode(node) && !ChartUtils.isWasEdited(node) && !ChartUtils.isForceShowLabel(node)
      let processFunc =  (node: Node) => {
          if(app.Options.showCodeLabels) {
              if(ChartUtils.getReplaceLabel(node))  ChartUtils.setReplaceLabel(node, node.label)
          } else {
            ChartUtils.setReplaceLabel(node, node.label)
            node.label = ''
          }
          return node
      }

      nodes.forEach((node)=>{
        if(!filterFunc(node)) return
        return processFunc(node)
      })

      nodes.forEach((node)=>{
        if(!(ChartUtils.isMatchNode(node) && ChartUtils.isForceShowLabel(node))) return
        node.label = ChartUtils.getReplaceLabel(node)
        return node
      })

      return nodes
    }
}
