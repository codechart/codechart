export type ContentEdgeTypes_type = 'inside content' | 'inside selection'

export class ContentEdgeTypes {
  static insideContent: ContentEdgeTypes_type = 'inside content';
  static insideSelection: ContentEdgeTypes_type = 'inside selection';
}

export const ChartStyle = {
  height: '100%',
  physics: {
    enabled: true
  },
  interaction: {
    dragNodes: true,
    dragView: true,
    hideEdgesOnDrag: false,
    hideNodesOnDrag: false,
    hover: true,
    keyboard: {
      enabled: false,
      speed: { x: 10, y: 10, zoom: 0.02 },
      bindToWindow: false
    },
    multiselect: true,
    navigationButtons: true,
    selectable: true,
    selectConnectedEdges: false,
    zoomView: true
  },
  manipulation: {
    enabled: false,
    initiallyActive: false,
    addNode: true,
    addEdge: true,
    editEdge: true,
    deleteNode: true,
    deleteEdge: true,
    controlNodeStyle: {
      // all node options are valid.
    }
  }

};

export const ChartConsts = {
  maxTitleLength: 500,
  filePositions: { maxInRow: 3, distance: 700 },
  fileDistance: { x: 0, y: 400 },
  timeForFixingNodes: 2000,
  dimColor: '#787878',
  chartStyle: ChartStyle,
  matchDistance: { toPreviousMatch: 600, betweenMatches: 200 },
  FileNameDistance: 1000
};

export const chosenFunc = {
  node: (values, id, selected, hovering) => {
    values.shadowSize = 20;
    values.size = values.size * 1.5
    values.borderSize = 10
    values.color = 'white'
  }
}

export const ChartStyles = {
  baseNode: {
    physics: false,
    shape: 'box',
    widthConstraint: { minimum: 50, maximum: 800 },
    font: { align: 'left' },
    chosen: chosenFunc,
    borderWidth: 3
  },
  startNode: { d: {} },
  lockedNode: {},
  insideContentLink: {
    d: { type: ContentEdgeTypes.insideContent },
    arrows: { to: true },
    width: 40,
    color: { color: 'rgb(255, 255, 0)', opacity: 0.3 }
  },
  insideSelectionLink: {
    d: { type: ContentEdgeTypes.insideSelection },
    arrows: { to: true },
    width: 20,
    color: { color: 'rgb(255, 0, 0)', opacity: 0.3 }
  },
  baseLink: {
    type: 'link', d: {}, width: 2, chosen: {
      edge: (values, id, selected, hovering) => {
        values.shadow = true, values.width = values.width * 1.5;
      }
    }, physics: false, length: 0, smooth: false
    // "smooth": {
    //   "type": "cubicBezier",
    //   "forceDirection": "horizontal",
    //   "roundness": 1
    // }
  },
  searchNode: {
    font: { background: 'white', size: 40, align: 'left', strokeWidth: 1 },
    shape: 'circularImage',
    image: '/assets/nodes/coding.svg',
    imagePadding: 20
  },
  gotoNode: { image: '/assets/nodes/right.svg' },
  matchMatchLink: { arrows: { to: { enabled: true } }, color: { inherit: 'to' }, width: 1 },
  dimmedLink: { width: 0.2 },
  dimmedNode: { color: { background: 'white' }, border: { color: 'white' }, font: { color: 'grey' } },
  fileNode: {
    color: { border: '#ffffff', background: '#ffffff' },
    font: { size: 40, align: 'left', strokeWidth: 1, background: 'white' },
    size: 100,
    scaling: { label: true },
    physics: false,
    widthConstraint: { minimum: 50, maximum: 500 },
    shape: 'image', image: '/assets/nodes/file.svg', imagePadding: 20
  },
  fileLink: { dashes: true, width: 0.2, hidden: true, d: { type: 'ofFile' } },
  nodesTypes: [{
    name: 'remark',
    details: {
      node: { color: { background: '#FFBCB6', border: '#F73C3C'}, d: { type: 'remark', isCustom: true }, font: { size: 30, align: 'left' } },
      link: { dashes: false, arrows: { to: { enabled: false } }, color: { inherit: 'to' }, length: 100 },
      tooltip: 'add remark node',
      class: 'fa fa-commenting-o',
      createLinkToFile: false
    }
  },
  {
    name: 'match',
    details: {
      node: {
        font: { background: 'white', size: 40, align: 'left', strokeWidth: 1, border: {width: 1} },
        shape: 'circularImage',
        image: '/assets/nodes/coding.svg',
        imagePadding: 20
      },
      link: { dashes: false, arrows: { to: { enabled: false } }, color: { inherit: 'to' }, length: 100 },
      tooltip: 'add match node',
      class: 'fa fa-circle-thin',
      createLinkToFile: true
    }
  }
  ],
  linkTypes: {
    link: { style: {}, name: 'connect selected. last' }
  },
  numberNode: { physics: true, shape: 'circle', color: 'green', fixed: false, font: { align: 'center', size: 40, color: 'white' } },
  numberLink: { length: 200 },
  resultNode: { color: { background: '#f0f8ff', border: '#000000' }, shape: 'box', font: { background: 'white', size: 40 } },
  pathNodeAttribute: { pathNodeAttribute: true },
  pathNode: {},
  filenameNode: {
    color: {
      border: 'white',
      highlight: {
        border: 'black',
        background: 'white'
      },
      hover: {
        border: 'black',
        background: 'white',
        size: "40px"
      }
    }
  },
  failedRefreshNode: {color: {background: 'red'}, shape: 'circle', font:{align: 'center', size:20}}
};

export const allNodeIcons = [
  { path: '\uf002', name: 'fa-search' },
  { code: '\uf0e7', name: 'fa-bolt' },
  { code: '\uf01e', name: 'fa-repeat' },
  { code: '\uf0a1', name: 'fa-bullhorn' },
  { code: '\uf2c3', name: 'fa-id-card-o' },
  { code: '\uf12a', name: 'fa-exclamation' }
];

export const allNodeIconImages = [
  { path: '/assets/nodes/flash.svg', name: 'action' },
  { path: '/assets/nodes/api.svg', name: 'endpoint' },
  { path: '/assets/nodes/link.svg', name: 'usage' },
  { path: '/assets/nodes/statement.svg', name: 'declaration' },
  { path: '/assets/nodes/database.svg', name: 'database reference' },
  { path: '/assets/nodes/refresh.svg', name: 'loop' },
  { path: '/assets/nodes/audit.svg', name: 'condition' },
  { path: '/assets/nodes/circle.svg', name: 'circle' },
  { path: '/assets/nodes/coding.svg', name: 'code' },
];

export const NodeShapes = [
  { faClass: "fa fa-square-o", visShape: 'box' },
  { faClass: "fa fa-circle-thin", visShape: 'circle' },
  { faClass: 'fa fa-database', visShape: 'database'},
  { faClass: 'fa fa-diamond', visShape: 'diamond'},
  { faClass: 'fa fa-dot-circle-o', visShape: 'dot'},
  { faClass: 'fa fa-star', visShape: 'star'},
  { faClass: 'fa fa-caret-up', visShape: 'triangle'},
  { faClass: 'fa fa-caret-down', visShape: 'triangleDown'}
]

export const NodeStyles = [{
  background: '#FFFFFF',
  border: '#6e706e'
},{
  background: '#FFBCB6',
  border: '#F73C3C'
},{
  background: '#FFFFC6',
  border: '#EEEE08'
},{
  background: '#DDADFB',
  border: '#A31AFE'
},{
  background: '#ADFF95',
  border: '#57FE2D'
},{
  background: '#B7EFFE',
  border: '#12CFFE'
},{
  background: '#FFD695',
  border: '#FD9F16'
}];




export interface OnDemandJson {
  title: "main drop down title",
  staticFields: [
    {
      value: 1,
      etlName: 'A'
    },
    {
      value: 1,
      etlName: 'B'
    }
  ],
  inputFields: [
    {
      title: 'my date',
      etlName: 'C',
      type: 'date' | 'number' | 'text'
    },
    {
      title: 'my name',
      etlName: 'D',
      type: 'date' | 'number' | 'text'
    }
  ]
  dropDowns: [
    {
      title: 'secondary drop down title 1'
      etlFieldName: 'E',
      values: [
        {
          title: 'option 1',
          value: 10
          staticFields: [
            {
              value: 2,
              etlName: 'F'
            },
            {
              value: 2,
              etlName: 'G'
            }
          ],
          inputFields: [
            {
              title: 'my secondary date',
              etlName: 'H',
              type: 'date' | 'number' | 'text'
            },
            {
              title: 'my secondary name',
              etlName: 'I',
              type: 'date' | 'number' | 'text'
            }
          ]
        }
      ]
    }
  ]
}

export interface result {
  A: 1,
  B: 1,
  C: '01/01/2019',
  D: 'michael',
  E: 'option 1',
  F: 2,
  G: 3,
  H: '01/04/2019'
  I: 'Christian'
}


