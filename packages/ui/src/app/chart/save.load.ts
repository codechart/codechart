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

  public loadDataFromFindInFiles(response:FindInFilesResponse[]) {
    let matchCount = response.reduce((soFar, item)=>{return soFar + item.matches.length}, 0)
    this.app.addMessage('search results', 'found ' +  matchCount + ' matches in ' + response.length + ' files', 2000)
    console.log('find in files response', response)
    let addedNodesAndLinks = []
    response.forEach((file: FindInFilesResponse) => {
      let fileNode = CreateUtils.createFileNode(file, this.chart);
      addedNodesAndLinks.push(fileNode);

      file.matches.forEach((match: MatchInfo) => {
        let matchNodes = CreateUtils.createOrUpdateMatchNode(match, fileNode.id, this.chart, this.app.selectedNode, this.app.layout);
        addedNodesAndLinks = addedNodesAndLinks.concat(matchNodes);
      });
    });

    this.chartActions.addToChartAndPosition(addedNodesAndLinks);
    setTimeout(()=>{
      this.chart.fitToNodes(addedNodesAndLinks.filter(i=>ChartUtils.isMatchNode(i)).map(i=>i.id))
    }, 1000)

  }

  public reload() {
    let allNodes = this.chart.nodes.get();
    let reloadData: ReloadRequest = {
      matches: allNodes.filter(node => {
        return !ChartUtils.isFileNode(node);
      }).map(item => {
        return ChartUtils.getMatchAttributes(item);
      }),
      files: allNodes.filter(node => {
        return ChartUtils.isFileNode(node);
      }).map(item => {
        return {file: ChartUtils.getFilePath(item)};
      }),
      dirPath: this.app.searchJson.path
    };
    // check for duplicates - if same id was copied to different location
    let duplicates = reloadData.matches.filter((item, index) => reloadData.matches.indexOf(item) != index)
    if(duplicates.length!==0) {
      this.app.addMessage('Error', 'duplicates', 1000)
      console.log('duplicate ids in reload', duplicates)
      return
    }
    this.http.post('http://localhost:2900' + EndPoints.loadFromCode, reloadData).subscribe((response: FindInFilesResponse[]) => {
      console.log('load response', response);
      this.app.selectedNode = null;
      this.loadDataFromFindInFiles(response);
    });
  } 
  
  public saveChartToJson(filename: string) {
    let setNodesForSave =(item: Node) => {
      let itemPos = this.chart.getPosition(item.id);
      if(!itemPos) return item as Node
      item.x = itemPos.x
      item.y = itemPos.y
      return item
    }
    let jsonSavedEdges = this.chart.edges.get().map((edge: Edge) => {
      return edge
    });
    let jsonSavedNodes = this.chart.nodes.get().map((node: Node) => {
      this.chart.setNodePosition(node, this.chart.getPosition(node.id))
      return setNodesForSave(node);
    });
    let jsonContent = {nodes: jsonSavedNodes, edges: jsonSavedEdges, dirPath: this.app.searchJson.path};
    this.saveJsonToFile(jsonContent, filename)
  }

  public fullSaveToFile(filename) {
    let savedNodes: SaveNode[] = this.chart.nodes.get().map((node: Node) => {
      return CreateTypes.createSaveNode(ChartUtils.getLineNumber(node) as number, ChartUtils.getOfFile(node), node.id as string);
    });
    let saveToFileJson: SaveJson = {nodes: savedNodes, dirPath: this.app.searchJson.path};
    this.http.post('http://localhost:2900' + EndPoints.saveToCode, saveToFileJson).subscribe((saveToFileResponse: SaveNodesResponse[]) => {
      handleNodesIdsDifferentThanSavedIds(saveToFileResponse);
    });

    let handleNodesIdsDifferentThanSavedIds = (response: SaveNodesResponse[]) => {
      if (Array.isArray(response) && response.length > 0) {
        console.log('saved ids different than existing ids:', response);
      }
      this.saveChartToJson(filename);
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
    this.chart.simpleLoadFromJson(loaded);
    setTimeout(()=>{this.chart.fitToNodes(loaded.nodes.map(i=>i.id))}, 0)
  }


  public saveJsonToFile(jsonObject, filename: string) {
    let encode = (s) => {
      var out = [];
      for ( var i = 0; i < s.length; i++ ) {
        out[i] = s.charCodeAt(i);
      }
      return new Uint8Array( out );
    }

    var data = encode( JSON.stringify(jsonObject, null, 4) );

    var blob = new Blob( [ data ], {
      type: 'application/octet-stream'
    });

    let url = URL.createObjectURL( blob );
    var link = document.createElement( 'a' );
    link.setAttribute( 'href', url );
    link.setAttribute( 'download', `${filename}.json` );

    var event = document.createEvent( 'MouseEvents' );
    event.initMouseEvent( 'click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent( event );
  }
}
