export const ChartStyle = {
  height: '100%',
  physics: {
    enabled: false
  },
  interaction: {
    dragNodes: true,
    dragView: true,
    hideEdgesOnDrag: false,
    hideNodesOnDrag: false,
    hover: false,
    hoverConnectedEdges: true,
    keyboard: {
      enabled: false,
      speed: {x: 10, y: 10, zoom: 0.02},
      bindToWindow: false
    },
    multiselect: true,
    navigationButtons: true,
    selectable: true,
    selectConnectedEdges: false,
    tooltipDelay: 300,
    zoomView: true
  },
  edges: {
    smooth: {
      enabled: true, type: 'vertical', roundness: 0, forceDirection: 'none'
    }
  },
  manipulation: {
    enabled: false,
    initiallyActive: false,
    addNode: true,
    addEdge: true,
    editEdge: true,
    deleteNode: true,
    deleteEdge: true,
    controlNodeStyle:{
      // all node options are valid.
    }
  }

};

export const ChartConsts = {
  maxTitleLength: 500,
  filePositions: {maxInRow: 3, distance: 600},
  timeForFixingNodes: 2000,
  dimColor: '#787878',
  chartStyle: ChartStyle

};

export const ChartStyles = {
  baseNode: {widthConstraint: {minimum: 50, maximum:800}, font: {align: 'left', size: 40}, chosen: {node: (values, id, selected, hovering)=> {values.shadowSize = 20}}},
  startNode: {d: {}},
  lockedNode: {},
  inisdeContentLink: {dashes: [4, 20], d: {type: 'inisdeContent'}, arrows: {to: true}},
  baseLink: {type: 'link', d: {}, width: 7, chosen: {edge: (values, id, selected, hovering)=>{values.shadow = true}}},
  normalNode: {shape: 'box', d: {}, physics: false},
  matchMatchLink: {physics: false, arrows: {to: {enabled: true}}, color: {inherit: 'to'}},
  fileNode: {
    color: {border: '#ffffff', background: '#ffffff'},
    font: {size: 100},
    scaling: {label: true},
    physics: false,
    shape: 'box',
  },
  fileLink: {dashes: true, width: 0.2, hidden: true, d: {type: 'ofFile'}, color: {color: '#000000'}, length: 100, smooth: {enabled: true, type: 'cubicBezier', roundness: 1}},
  nodesTypes: {
    remark: {
      node: {color: {background: '#c1ebec'}, d: {type: 'remark', isCustom: true}},
      link: {dashes: true, physics: false, arrows: {to: {enabled: false}}, color: {inherit: 'to'}, length: 100}
    }
  },
  linkTypes: {
    link: {},
  },
  resultNode: {color: {background: '#f0f8ff', border: '#000000'}},
  pathNodeAttribute: {pathNodeAttribute: true},
  pathNode: {}
};

export const NodeColors = ['#9dab9c', '#515778', '#ffe47c', '#7c97ff', '#ff7c97', '#fd4bc9'
  , '#ff7eb9'
  , '#1e2366'
  , '#1e2366'
  , '#83804f'
  , '#4f5283'
  , '#c1ebec'
  , '#f0f8ff'
  , '#ecf0c5'
  , '#c9c5f0'
  , '#c5d7f0'
  , '#c7ddfe'
  , '#4cadad'
  , '#8fbbbc'
  , '#99d0d0'
  , '#ff4945'
  , '#fff8f9'
  , '#5b63fe'
  , '#fef65b'
  , '#5e7fba'
  , '#ff4040'
  , '#2ac940'
  , '#ff4945'];

