import {Edge, IdType, Node} from 'vis';
import { AppComponent } from "../app.component";
import { ChartUtils } from "./chart.utils";
import { ChartWrapper } from "./chart.wrapper";

export class ChartStyling {
    chart: ChartWrapper;

    constructor(private appComponent: AppComponent) {}

    initialize() {
        this.chart = this.appComponent.chart
    }

    setMatchNodesLabel(enabled: boolean) {
        this.chart.updateNodes({}, {
            filterFunc: (node: Node) => ChartUtils.isMatchNode(node),
            processFunc: (node: Node) => {
                if(!enabled) {
                    node['d']['_label'] = node.label
                    node.label = undefined
                } else {
                    node.label = node['d']['_label']
                    node['d']['_label'] = undefined
                }
                return node
            }
        })
    }
}