export type ContentEdgeTypes_type = 'inside content' | 'inside selection'
// used classes and not enums since stringed enumed produced errors. should fix
export class ContentEdgeTypes {
  static insideContent: ContentEdgeTypes_type = 'inside content';
  static insideSelection: ContentEdgeTypes_type = 'inside selection';
}

export class EdgeTypes {
  static collapseEdge = 'collapseEdge'
  static matchToMatch = 'matchToMatch'

}

export class NodeTypes {
  static ofFile = "ofFile"
  static groupNode = "group"
  static toDoNode = 'toDo'
  static boundaryNode = 'boundaryNode'
  static failedSync = 'failedSync'
  static infoNode: 'info';
  static fileNode = 'file';
  static remarkNode = 'remark';
}

export interface NodeMenuInfo {
  isDone: boolean;
  isFailed: boolean;
  isSynced: boolean;
  isSelected: boolean;
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
  gridBaseSize: 55,
  matchDistance: { toPreviousMatch: 4, betweenMatches: 4 },

  FileNameDistance: 1000,
  styleAfterLoad: true
};

export const MatchDistance = {
  betweenMatches: () => ChartConsts.matchDistance.betweenMatches * ChartConsts.gridBaseSize,
  toPreviousMatch: () => ChartConsts.matchDistance.toPreviousMatch * ChartConsts.gridBaseSize,
}

export const chosenFunc = {
  node: function (values, id, selected, hovering) {
    values.size = values.size * 1.5
    values.borderWidth = 5
    values.borderColor = "#125D98"
  },
  edge: (values, id, selected, hovering) => {
    values.width = values.width * 2.5
    values.shadow = true
    values.shadowSize = 5
    values.shadowColor = "#125D98"
    values.shadowX = 0
    values.shadowY = 0
  }
}

export const CcItemStyles = {
  baseNode: {
    physics: false,
    shape: 'box',
    widthConstraint: {},
    font: { align: 'left', background: "white", color: "black", size: 20 },
    chosen: { node: chosenFunc.node },
    borderWidth: 0
  },
  insideContentLink: {
    d: { type: ContentEdgeTypes.insideContent },
    arrows: { to: true },
    dashes: [10, 20],
    width: 10,
    color: { color: '#77ACF1', opacity: 0.7 }
  },
  insideSelectionLink: {
    d: { type: ContentEdgeTypes.insideSelection },
    arrows: { to: true },
    width: 20,
    color: { color: 'rgb(255, 0, 0)', opacity: 0.3 }
  },
  baseLink: {
    type: 'link', d: {}, width: 3, physics: false, smooth: false, color: { inherit: false }, font: { color: "black", background: "white", strokeWidth: 0, size: 30 },
    chosen: { edge: chosenFunc.edge }
    // "smooth": {
    //   "type": "cubicBezier",
    //   "forceDirection": "horizontal",
    //   "roundness": 1
    // }
  },
  searchNode: {
    font: { background: "white", color: "black" },
    shape: 'dot',
    borderWidth: 2,
    widthConstraint: { maximum: 150 },
  },
  gotoNode: { image: '/assets/nodes/push-pin.svg', size: 20, shape: 'image' },
  matchMatchLink: { arrows: { to: { enabled: true } }, width: 3, d:{type: EdgeTypes.matchToMatch} },
  dimmedLink: { width: 0.2 },
  dimmedNode: { color: { background: 'white' }, border: { color: 'white' }, font: { color: 'grey' } },
  shapeLink: { dashes: true },
  fileNode: {
    color: { border: '#ffffff', background: '#ffffff' },
    font: { size: 40, align: 'left', color: "#2D2D2D", background: undefined }, size: 100,
    scaling: { label: true },
    physics: false,
    borderWidth: 0,
    shape: 'box',
    d: {type: NodeTypes.fileNode}
  },
  toDoNode: {
    color: {},
    size: 40,
    scaling: { label: true },
    physics: false,
    widthConstraint: {maximum: 500 },
    shape: 'image', image: '/assets/nodes/to-do.png', imagePadding: 20,
    shapeProperties: { useBorderWithImage: true },
    d: { dontDrawRectangle: true, type: NodeTypes.toDoNode, isMarkedDone: false },
  },
  infoNode: {
    color: {},
    size: 40,
    scaling: { label: true },
    physics: false,
    widthConstraint: {maximum: 500 },
    shape: 'image', image: '/assets/nodes/info.png', imagePadding: 20,
    d: { dontDrawRectangle: true, type: NodeTypes.infoNode },
  },
  fileLink: { dashes: true, width: 0.2, hidden: true, d: { type: NodeTypes.ofFile } },
  suspectedSameMatchLink: { dashes: [2, 12], d: { type: 'suspectedSameMatch' } },
  nodesTypes: [
    {
      name: 'start',
      details: {
        node: {
          shape: 'box',
          label: 'START',
          color: { border: "#2e8151", background: "#3DDC84" },
          font: { color: "white", background: 'none' },
          shapeProperties: { borderRadius: 6 },
          borderWidth: 4
        },
        tooltip: 'add start  node',
        class: 'fa fa-solid fa-play',
        createLinkToFile: false,
      }
    },
    {
      name: 'end',
      details: {
        node: {
          shape: 'box',
          label: 'FINISH',
          color: { border: "#E63946", background: "#FF6B6B" },
          font: { color: "white", background: 'none' },
          shapeProperties: { borderRadius: 6 },
          borderWidth: 4
        },
        tooltip: 'add finish node',
        class: 'fa fa-solid fa-flag-checkered',
        createLinkToFile: false
      },
    },
    {
      name: 'remark',
      details: {
        node: {
          shape: 'box',
          borderWidth: 1,
          color: { border: "#FFA100", background: "white" },
          shapeProperties: { borderDashes: [12, 7], borderRadius: 6 },
          font: { size: 17 },
          d: {type: NodeTypes.remarkNode}
        },
        tooltip: 'add remark node',
        class: 'fa fa-solid fa-comment',
        createLinkToFile: false
      }
    }
  ],
  linkTypes: {
    link: { style: {}, name: 'connect selected. last' }
  },
  numberNode: { physics: true, shape: 'circle', color: 'green', fixed: false, font: { align: 'center', size: 40, color: 'white' } },
  numberLink: { length: 200 },
  resultNode: { color: { background: '#f0f8ff', border: '#000000' }, shape: 'box' },
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
  filenameEdge: {
    dashes: true,
    width: 1
  },
  boundaryNode:
  {
    borderWidth: 1, size: 15, shape: 'dot', color: {
      "border": "#000000",
      "background": "#ffffff"
    }, font: {}
  }
  ,
  splitNode: { shape: 'circle', font: { size: 0 }, widthConstraint: false, color: { background: '#9B9B9B' } },
  failedSyncNode: { color: { background: 'red' }, shape: 'circularImage', image: '/assets/nodes/warn.svg', font: { background: 'white', size: 40, align: 'left', border: { width: 1 } }, widthConstraint: { maximum: 500 } }
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
  { path: '/assets/nodes/chat-bubble.png', name: 'remark' },
  { path: '/assets/nodes/to-do.png', name: 'to do' },
  { path: '/assets/nodes/flash.svg', name: 'action' },
  { path: '/assets/nodes/api.svg', name: 'endpoint' },
  { path: '/assets/nodes/link.svg', name: 'usage' },
  { path: '/assets/nodes/statement.svg', name: 'declaration' },
  { path: '/assets/nodes/database.svg', name: 'database reference' },
  { path: '/assets/nodes/refresh.svg', name: 'loop' },
  { path: '/assets/nodes/audit.svg', name: 'condition' },
  { path: '/assets/nodes/circle.svg', name: 'circle' },
  { path: '/assets/nodes/code.png', name: 'code' },
  { path: '/assets/nodes/start.svg', name: 'start' },
  { path: '/assets/nodes/finish.svg', name: 'finish' },
];

export interface NodeShape { faClass: string, visShape: string }

export const NodeShapes: NodeShape[] = [
  { faClass: "fa fa-solid fa-square", visShape: 'box' },
  { faClass: 'fa fa-solid fa-diamond', visShape: 'diamond' },
  { faClass: 'fa fa-solid fa-circle-dot', visShape: 'dot' },
  { faClass: 'fa fa-star', visShape: 'star' },
  { faClass: 'fa fa-caret-up', visShape: 'triangle' },
  { faClass: 'fa fa-caret-down', visShape: 'triangleDown' }
]

export interface NodeColor { background }

export const NodeStyles: NodeColor[] = [
  { background: "#ffffff" }, { background: "#1687A7" }, { background: "#E99497" }, { background: "#F3C583" },
  { background: "#F4C7AB" }, { background: "#B2B8A3" }, { background: "#CAF7E3" }, { background: "#F6DFEB" },
  // { background: "#E4BAD4"}, { background: "#E93B81"}, { background: "#F5ABC9"}, { background: "#FFE5E2"},
  // { background: "#C449C2"}, { background: "#FFCEAD"}, { background: "#FFF5AB"}, { background: "#867AE9"},
  { background: "#EDEDD0" }, { background: "#A6D6D6" }, { background: "#A58FAA" }, { background: "#907FA4" }
];





