export const VlaStyles = {
  lockedNode:  {e: 2, b:'orange', ha0: {c: 'grey', w: 2, r: 35}},
  startNode: {e: 2, b: 'orange', c: 'orange'},
  normalLink: {type: "link", a1: true, c: 'rgb(155,155,155)', w: 5, ls: "solid", u: "", d: {}},
  normalNode: {type: "node", ci: true, u: '', d: {}},
  fileNode: {"ha0": {"c": 'rgb(0,0,0)', "r": 35, "w": 1 }},
  linkResultToFile: {ls: 'dashed', a1: false, w: 0.2, d: {type: 'ofFile'}, c: "rgb(120, 120, 120)"}, 
  nodesTypes: {
    rectangle: {fs: 15, b: 'white', sh: 'box', d:{type: 'remark'}},
    circle: {fs: 15, b: 'white', sh: 'circle', d:{type: 'remark'}},
    w_sign: {fs: 15, b: 'orange', bw: 4, sh: 'w', d:{type: 'remark'}},
    e_sign: {fs: 15, b: 'orange', bw: 4, sh: 'e', d:{type: 'remark'}},
  },
  linkTypes: {
    remark: {w:0.2, a1: false, a2: false}
  },
  resultNode: {"ha0": {"c": 'rgb(0,0,0)',"r": 35, "w": 1 }}
}


export const VlaExcludedFieldsWhenSavingJson = ['id', 'id1', 'id2', 'type', 'd', 'x', 'y', 't']
