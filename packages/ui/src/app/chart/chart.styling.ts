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

    public static setMatchesLabelVisible(app: AppComponent, nodes: Node[]): Node[] {
      let filterFunc =  (node: Node) => ChartUtils.isMatchNode(node) && !ChartUtils.isWasEdited(node)
      let processFunc =  (node: Node) => {
          if(app.Options.showCodeLabels) {
              if(node[AttributesKey]._label)  node.label = node[AttributesKey]._label
          } else {
            node[AttributesKey]._label = node.label
            node.label = ''
          }
          return node
      }

      nodes.forEach((node)=>{
        if(!filterFunc(node)) return
        return processFunc(node)
      })

      return nodes
    }
}
