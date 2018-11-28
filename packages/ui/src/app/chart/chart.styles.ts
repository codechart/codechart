export const ChartConsts = {
  maxTitleLength: 200,
  filePositions: {maxInRow: 3, distance: 600},
  timeForFixingNodes: 3000,
  dimColor: '#787878'
}

export const ChartStyles = {
  baseNode: {widthConstraint:{minimum: 50, maximum: 400}},
  matchNodeAfterTimeout: {physics: {fixed: true}},
  matchEdgeAfterTimeout: {},
  startNode: {d:{}},
  dimmedNode: {color: {background:ChartConsts.dimColor, border: ChartConsts.dimColor}},
  dimmedEdge: {},
  lockedNode: {},
  normalLink: {type: "link", d: {}},
  normalNode: {shape: 'box', d: {}},
  matchMatchLink: {physics: false, arrows: {to:{enabled:true}}, color:{inherit: 'to'}},
  fileNode: {color: {background: '#808000'}, font: {size: 40}, scaling:{label: true}, physics: {fixed:true}, mass:3},
  fileLink: {dashes: true, width: 0.2, d: {type: 'ofFile'}, color: "rgb(120, 120, 120)", length:100},
  nodesTypes: {
    rectangle: {fs: 15, b: 'orange', sh: 'box', d: {type: 'remark'}}
  },
  linkTypes: {
    dashedArrow: {ls: "dashed", w: 3, a1: false, a2: true},
  },
  resultNode: {sh: 'box'},
  pathNodeAttribute: {pathNodeAttribute: true},
  pathNode: {color: {background: '#00FFFF'}, font: {size:20}}
}


export const ChartStyle = {
  height: '90%',
  physics: {
    enabled: true,
    /*
     repulsion: {
     centralGravity: 0,
     springLength: 200,
     springConstant: 0.05,
     nodeDistance: 100,
     damping: 0.09
     },
     */
    barnesHut: {
      gravitationalConstant: -2000,
      centralGravity: 0.3,
      springLength: 95,
      springConstant: 0.04,
      damping: 0.09,
      avoidOverlap: 1
    },
    stabilization: {
      enabled: false,
      iterations: 20,
      updateInterval: 2,
      onlyDynamicEdges: false,
      fit: true
    },
    solver: "repulsion",
    timestep: 0.2
  },
  interaction:{
    dragNodes:true,
    dragView: true,
    hideEdgesOnDrag: false,
    hideNodesOnDrag: false,
    hover: false,
    hoverConnectedEdges: true,
    keyboard: {
      enabled: true,
      speed: {x: 10, y: 10, zoom: 0.02},
      bindToWindow: true
    },
    multiselect: true,
    navigationButtons: true,
    selectable: true,
    selectConnectedEdges: true,
    tooltipDelay: 300,
    zoomView: true
  },
  edges: {
    smooth: {
      enabled: true, type: "vertical", roundness: 0, forceDirection: "none"
    }
  }

}
