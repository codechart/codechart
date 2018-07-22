export const VlaStyles = {
  lockedNode:  {e: 2, b:'orange', ha0: {c: 'grey', w: 2, r: 35}},
  startNode: {e: 2, b: 'orange', c: 'orange', d: {}},
  normalLink: {type: "link", a1: true, c: 'rgb(155,155,155)', w: 5, ls: "solid", u: "", d: {}},
  normalNode: {type: "node", sh: 'box', ci: true, u: '', d: {}},
  fileNode: {"ha0": {"c": 'rgb(0,0,0)', "r": 35, "w": 1 }},
  linkResultToFile: {ls: 'dashed', a1: false, w: 0.2, d: {type: 'ofFile'}, c: "rgb(120, 120, 120)"}, 
  nodesTypes: {
    rectangle: {fs: 15, b: 'orange', sh: 'box', d:{type: 'remark'}},
    circle: {fs: 15, b: 'orange', sh: 'circle', d:{type: 'remark'}},
    w_sign: {fs: 15, b: 'orange', bw: 4, sh: 'w', d:{type: 'remark'}},
    e_sign: {fs: 15, b: 'orange', bw: 4, sh: 'e', d:{type: 'remark'}},
  },
  linkTypes: {
    dashedNonArrow: {ls: "dashed", w:3, a1: false, a2: false},
    dashedArrow: {ls: "dashed", w:3, a1: false, a2: true},
    solidNonArrow: {ls: "solid", w:3, a1: false, a2: false},
    solidArrow: {ls: "solid", w:3, a1: false, a2: true},
    dashedNonArrowSmall: {ls: "dashed", w:0.2, a1: false, a2: false},
  },
  resultNode: {sh: 'box'}
}

export class ElementsJson {
  static nodeColorJson(color){return {c: color}}
  static linkColorJson(color){return {b: color}}
  static title(title){return {t: title}}
}


export const VlaExcludedFieldsWhenSavingJson = ['id', 'id1', 'id2', 'type', 'x', 'y', 't']

export const maxTitleLength = 20

