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
  maxTitleLength: 30,
  filePositions: { maxInRow: 3, distance: 700 },
  fileDistance: { x: 0, y: 400 },
  timeForFixingNodes: 2000,
  dimColor: '#787878',
  chartStyle: ChartStyle,
  gridBaseSize: 50,
  matchDistance: { toPreviousMatch: 4, betweenMatches: 2 },

  FileNameDistance: 1000
};

export const MatchDistance = {
  betweenMatches: () => { return ChartConsts.matchDistance.betweenMatches * ChartConsts.gridBaseSize },
  toPreviousMatch: () => { return ChartConsts.matchDistance.toPreviousMatch * ChartConsts.gridBaseSize },
}

export const chosenFunc = {
  node: function (values, id, selected, hovering) {
    values.size = values.size * 1.5
    values.borderWidth = 5
    values.borderColor = "#125D98"
  },
  edge: (values, id, selected, hovering) => {
    values.width = values.width * 1.5
    values.color = values.color
  }
}

export const CcItemStyles = {
  baseNode: {
    physics: false,
    shape: 'box',
    widthConstraint: { minimum: 50 },
    font: { align: 'left', background: "#2D2D2D", color: "#ADADAD" },
    chosen: {node: chosenFunc.node},
    borderWidth: 0
  },
  insideContentLink: {
    d: { type: ContentEdgeTypes.insideContent },
    arrows: { to: true },
    dashes: [10, 20],
    width:10,
    color: {color: '#77ACF1', opacity: 0.7}
  },
  insideSelectionLink: {
    d: { type: ContentEdgeTypes.insideSelection },
    arrows: { to: true },
    width: 20,
    color: { color: 'rgb(255, 0, 0)', opacity: 0.3 }
  },
  baseLink: {
    type: 'link', d: {}, width: 3, physics: false, length: 0, smooth: false, color: { inherit: false },
    chosen: {edge: chosenFunc.edge}
    // "smooth": {
    //   "type": "cubicBezier",
    //   "forceDirection": "horizontal",
    //   "roundness": 1
    // }
  },
  searchNode: {
    shape: 'circularImage',
    image: '/assets/nodes/code.png',
    borderWidth: 0,
    imagePadding: 20
  },
  gotoNode: { image: '/assets/nodes/push-pin.svg', size: 20, shape: 'circularImage' },
  matchMatchLink: { arrows: { to: { enabled: true, scaleFactor: 0.2 } }, width: 3 },
  dimmedLink: { width: 0.2 },
  dimmedNode: { color: { background: 'white' }, border: { color: 'white' }, font: { color: 'grey' } },
  shapeLink: {dashes:true},
  fileNode: {
    color: { border: '#ffffff', background: '#ffffff' },
    font: { size: 40, align: 'left', color: "#2D2D2D", background: undefined},    size: 100,
    scaling: { label: true },
    physics: false,
    borderWidth: 0,
    shape: 'box'
  },
  tasksNode: {
    color: { },
    font: { size: 40, align: 'left', background: "#2D2D2D", color: "#ADADAD"},
    size: 100,
    scaling: { label: true },
    physics: false,
    widthConstraint: { minimum: 50, maximum: 500 },
    shape: 'circularImage', image: '/assets/nodes/tasks.svg', imagePadding: 20,
    shapeProperties: {useBorderWithImage: true}
  },
  fileLink: { dashes: true, width: 0.2, hidden: true, d: { type: 'ofFile' } },
  suspectedSameMatchLink: { dashes: [2, 12], d: { type: 'suspectedSameMatch' } },
  nodesTypes: [{
    name: 'remark',
    details: {
      node: {
        color: {
        }, d: { type: 'remark', isCustom: true }, font: { size: 30, align: 'left' }
      },
      tooltip: 'add remark node',
      class: 'fa fa-commenting-o',
      createLinkToFile: false
    }
  },
  {
    name: 'task',
    details: {
      node: {
        color: {
        }, d: { type: 'task', isCustom: true }, font: { size: 70, align: 'left' }
      },
      tooltip: 'add task node',
      class: 'fa fa-flag',
      createLinkToFile: false
    }
  },
  {
    name: 'icon',
    details: {
      node: {
        font: { background: 'white', size: 40, align: 'left', border: { width: 1 } },
        shape: 'image',
        shapeProperties: {
          borderDashes: true, // only for borders
          borderRadius: 6,     // only for box shape
          interpolation: false,  // only for image and circularImage shapes
          useImageSize: false,  // only for image and circularImage shapes
          useBorderWithImage: false,  // only for image shape
          coordinateOrigin: 'center'  // only for image and circularImage shapes
        },
        image: '/assets/nodes/coding.svg',
        imagePadding: 20
      },
      tooltip: 'add icon node',
      class: 'fa fa-picture-o',
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
    borderWidth: 0,
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
  filenameEdge :{
    dashes: true,
    width: 1
  },
  splitNode: {shape: 'circle', font: {size:0}, widthConstraint: false, color: {background: '#9B9B9B'}},
  failedRefreshNode: { color: { background: 'red' }, shape: 'circularImage', image: '/assets/nodes/warn.svg', font: { background: 'white', size: 40, align: 'left',  border: { width: 1 } } }
};

export const NodeIcons = [
  { path: '\uf002', name: 'fa-search' },
  { code: '\uf0e7', name: 'fa-bolt' },
  { code: '\uf01e', name: 'fa-repeat' },
  { code: '\uf0a1', name: 'fa-bullhorn' },
  { code: '\uf2c3', name: 'fa-id-card-o' },
  { code: '\uf12a', name: 'fa-exclamation' }
];

export interface NodeImage { path, name }

export const NodeIconImages = [
  { path: '/assets/nodes/flash.svg', name: 'action' },
  { path: '/assets/nodes/api.svg', name: 'endpoint' },
  { path: '/assets/nodes/link.svg', name: 'usage' },
  { path: '/assets/nodes/statement.svg', name: 'declaration' },
  { path: '/assets/nodes/database.svg', name: 'database reference' },
  { path: '/assets/nodes/refresh.svg', name: 'loop' },
  { path: '/assets/nodes/audit.svg', name: 'condition' },
  { path: '/assets/nodes/circle.svg', name: 'circle' },
  { path: '/assets/nodes/coding.svg', name: 'code1' },
  { path: '/assets/nodes/code.png', name: 'code2' },
  { path: '/assets/nodes/start.svg', name: 'start' },
  { path: '/assets/nodes/finish.svg', name: 'finish' },
];

export interface NodeShape {faClass: string, visShape: string}

export const NodeShapes: NodeShape[] = [
  { faClass: "fa fa-square-o", visShape: 'box' },
  { faClass: "fa fa-circle-thin", visShape: 'circle' },
  { faClass: 'fa fa-database', visShape: 'database' },
  { faClass: 'fa fa-diamond', visShape: 'diamond' },
  { faClass: 'fa fa-dot-circle-o', visShape: 'dot' },
  { faClass: 'fa fa-star', visShape: 'star' },
  { faClass: 'fa fa-caret-up', visShape: 'triangle' },
  { faClass: 'fa fa-caret-down', visShape: 'triangleDown' }
]

export interface NodeColor { background }

export const NodeStyles: NodeColor[] = [{ background: "#ffffff"}, { background: "#1687A7"}, { background: "#E99497"}, { background: "#F3C583"},
  { background: "#F4C7AB"}, { background: "#B2B8A3"}, { background: "#CAF7E3"},
  { background: "#F6DFEB"}, { background: "#E4BAD4"}, { background: "#E93B81"}, { background: "#F5ABC9"}, { background: "#FFE5E2"},
  { background: "#C449C2"}, { background: "#FFCEAD"}, { background: "#FFF5AB"}, { background: "#867AE9"}, { background: "#EDEDD0"},
  { background: "#A6D6D6"}, { background: "#A58FAA"}, { background: "#907FA4" }];




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


