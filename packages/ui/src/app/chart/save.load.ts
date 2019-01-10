import {ChartActions} from './chart.actions';
import {ChartUtils, AttributesKey} from './chart.utils';
import {ChartStyles} from './chart.consts';
import {ChartWrapper} from './chart.wrapper';
import {CreateUtils} from './create.utils';
import {AppComponent} from '../app.component';
import {Edge, IdType, Node} from 'vis';
import {
  FindInFilesResponse, MatchInfo, VISI_PREFIX, SaveNodesResponse, SaveJson,
  SaveNode, CreateTypes, EndPoints, ReloadRequest
} from '../types.nodejs';
import {HttpClient} from '@angular/common/http';


export class SaveLoad {
  private chart: ChartWrapper;
  private chartActions: ChartActions;

  constructor(private app: AppComponent, public http: HttpClient) {
  }

  initialize() {
    this.chart = this.app.chart;
    this.chartActions = this.app.chartActions;
  }

  public loadDataFromFindInFiles(response: FindInFilesResponse[]) {
    console.log('find in files response', response);
    let addedNodesAndLinks = [];
    response.forEach((file: FindInFilesResponse) => {
      let fileNode = CreateUtils.createFileNode(file, this.chart);
      addedNodesAndLinks.push(fileNode);

      file.matches.forEach((match: MatchInfo) => {
        if (match.line.indexOf(VISI_PREFIX) !== -1) {
          match.line = match.line.substring(0, match.line.indexOf(VISI_PREFIX));
        }
        let matchNodes = CreateUtils.createMatchNode(match, fileNode.id, this.chart, this.app.selectedNode as Node);
        addedNodesAndLinks = addedNodesAndLinks.concat(matchNodes);
      });
    });

    let nodesAndLinks = this.chartActions.addNodesToChart(addedNodesAndLinks);
    setTimeout(() => {
    }, 100);
  }

  public reload() {
    let allNodes = this.chart.nodes.get();
    let reloadData: ReloadRequest = {
      matches: allNodes.filter(node => {
        return !ChartUtils.isFileNode(node);
      }).map(item => {
        return ChartUtils.getAttributes(item);
      }),
      files: allNodes.filter(node => {
        return ChartUtils.isFileNode(node);
      }).map(item => {
        return {file: ChartUtils.getFilePath(item)};
      })
    };
    this.http.post('http://localhost:2900' + EndPoints.loadFromCode, reloadData).subscribe((response: FindInFilesResponse[]) => {
      console.log('load response', response);
      this.app.selectedNode = null;
      this.loadDataFromFindInFiles(response);
    });
  } 
  
  public saveChartToJson() {
    let removePhysyicsFoeSave = (item: Node | Edge) => {
      if (item.physics === undefined) return item;
      else {
        delete item.physics['fixed'];
      }
      if (Object.keys(item.physics).length === 0) {
        delete item.physics;
      }
      return item;
    };
    let jsonSavedEdges = this.chart.edges.get().map((edge: Edge) => {
      return removePhysyicsFoeSave(edge);
    });
    let jsonSavedNodes = this.chart.nodes.get().map((node: Node) => {
      return removePhysyicsFoeSave(node);
    });
    let jsonContent = {nodes: jsonSavedNodes, edges: jsonSavedEdges};
    let fileJson = 'data:text/json;charset=utf-8,' + JSON.stringify(jsonContent);
    let encodedUri = encodeURI(fileJson);
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'a' + '.json');
    document.body.appendChild(link); // Required for FF
    link.click(); // This will download the data file named "my_data.csv".
    document.body.removeChild(link);
  }

  public fullSaveToFile() {
    let savedNodes: SaveNode[] = this.chart.nodes.get().map((node: Node) => {
      return CreateTypes.createSaveNode(ChartUtils.getLineNumber(node) as number, ChartUtils.getOfFile(node), node.id as string);
    });
    let saveToFileJson: SaveJson = {nodes: savedNodes};
    this.http.post('http://localhost:2900' + EndPoints.saveToCode, saveToFileJson).subscribe((saveToFileResponse: SaveNodesResponse[]) => {
      handleNodesIdsDifferentThanSavedIds(saveToFileResponse);
    });

    let handleNodesIdsDifferentThanSavedIds = (response: SaveNodesResponse[]) => {
      if (Array.isArray(response) && response.length > 0) {
        console.log('saved ids different than existing ids:', response);
      }
      this.saveChartToJson();
      let resetIdsFuncPerhapsUseThis = (jsonResponse) => {
        jsonResponse.forEach(updatedId => {
          console.log('save response', jsonResponse);
          let currentId = updatedId.savedId;
          let node = this.chart.getItem(currentId) as Node;
          let nodePositions = this.chart.getPosition(currentId);
          node.id = updatedId.exisitingId;
          let nodeEdges = this.chart.getItems(this.chartActions.getSurroundingEdgesIds(currentId)).edges.map(edge => {
            if (edge.from === currentId) edge.from = updatedId.exisitingId;
            else edge.to = updatedId.exisitingId;
            return edge;
          });

          this.chart.deleteItems({nodes: [currentId], edges: []});
          let newNodes = ([node] as Array<Node | Edge>).concat(nodeEdges);
          console.log('deleted and added', currentId, newNodes);
          setTimeout(() => {
            this.chart.addNodesAndLinks(newNodes);
          }, 0);
        });

      };
    };
  }

  public load(loaded: { nodes: Node[], edges: Edge[] }) {
    this.chartActions.clearChart();
    console.log('loading nodes', loaded.nodes);
    this.chartActions.addNodesToChart((loaded.nodes as Array<Node | Edge>).concat(loaded.edges));
  }
}
