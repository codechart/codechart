import { ChartConsts, NodeColor, NodeStyles } from './chart.consts';

export class Utils {
  static getRandomColor() {
    var x = Math.floor(Math.random() * 256);
    var y = Math.floor(Math.random() * 256);
    var z = Math.floor(Math.random() * 256);
    return [x, y, z].reduce((prev, curr) => {
      // should be a padStart function, but it`s not recognized and cann`t be ignored...
      let wtf = Number(curr).toString(16)
      if (wtf.length < 2) wtf = '0' + wtf
      return prev + wtf
    }, "")

    /*
        let letters = '123456789ABCDE';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 14)];
        }
        return color;
    */
  }

  static getRandomColor_useList(dontUse: string[]): NodeColor {
    let nodeColors = NodeStyles.map(i => i)
    // return first color that not in dontUse
    for (let i = 1; i < nodeColors.length; i++) {
      if (!dontUse.find(j => j === nodeColors[i].background)) {
        return nodeColors[i]
      }
    }

    // if dontUse has all the colors in nodeColors, return random
    let index = Math.floor(Math.random() * nodeColors.length)
    nodeColors[index].background = Utils.shadeColor(nodeColors[index].background, 50)
    return nodeColors[index]
  }

  static shadeColor(color: string, percent: number) {
    try {
      let R: number = parseInt(color.substring(1, 3), 16);
      let G: number = parseInt(color.substring(3, 5), 16);
      let B: number = parseInt(color.substring(5, 7), 16);

      R = Math.floor((R * (100 + percent) / 100));
      G = Math.floor((G * (100 + percent) / 100));
      B = Math.floor((B * (100 + percent) / 100));

      R = (R < 255) ? R : 255;
      G = (G < 255) ? G : 255;
      B = (B < 255) ? B : 255;

      let RR = (R.toString(16).length < 2) ? '0' + R.toString(16) : R.toString(16);
      let GG = (G.toString(16).length < 2) ? '0' + G.toString(16) : G.toString(16);
      let BB = (B.toString(16).length < 2) ? '0' + B.toString(16) : B.toString(16);
      return '#' + RR + GG + BB;
    } catch (e) {
      console.log("error in shade color")
      return color;
    }
  }

  public static deepCopy(obj) {
    let copy;

    // Handle the 3 simple types, AND null OR undefined
    if (null == obj || 'object' !== typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (let i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.deepCopy(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (let attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = this.deepCopy(obj[attr]);
      }
      return copy;
    }

    throw new Error('Unable to copy obj! Its type isn\'t supported.');
  }

  public static deepMerge(...sources): any {
    let dummyObj = {}
    dummyObj = Utils.deepMerge1(dummyObj, ...sources)
    return dummyObj
  }

  public static deepMerge1(target, ...sources) {
    let isObject = (item) => {
      return (item && typeof item === 'object' && !Array.isArray(item));
    };
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          Utils.deepMerge1(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return Utils.deepMerge1(target, ...sources);
  }

  public static elementContainsSelection(el) {
    let isOrContains = (node, container) => {
      while (node) {
        if (node === container) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    };

    var sel;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount > 0) {
        for (var i = 0; i < sel.rangeCount; ++i) {
          if (!isOrContains(sel.getRangeAt(i).commonAncestorContainer, el)) {
            return false;
          }
        }
        return true;
      }
    } else if ((sel = window.getSelection()) && sel.type != 'Control') {
      return isOrContains(sel.createRange().parentElement(), el);
    }
    return false;
  }

  public static getEndLineOfBlock(lines: string[], lineIndex: number) {
    try {
      let currentLine = lines[lineIndex]
      let status: 'counting ()' | 'counting {}' = null
      if (currentLine.indexOf('(') !== -1) {
        status = "counting ()";
      } else if (currentLine.indexOf('{') !== -1) {
        status =  'counting {}';
      }

      if(!status) return undefined

      let countBrackets = (open, close, count, line) => {
        if (line === null || line === undefined) {
          console.error("error in counting brackets")
          return 0
        }
        let openRegex = line.match(new RegExp(`\\${open}`, 'g'))
        let openCount = !openRegex ? 0 : openRegex.length
        let closeRegex = line.match(new RegExp(`\\${close}`, 'g'))
        let closeCount = !closeRegex ? 0 : closeRegex.length
        return count + openCount - closeCount
      }
      let checkLine = (lines: string[], lineIndex, status: 'counting ()' | 'counting {}' | 'after ()' | 'finished', bracketCount, lineCount) => {
        if (status === 'finished') return undefined
        let currentLine = lines[lineIndex]
        if (currentLine === undefined || currentLine === null) {
          console.warn(`error fetching end of block after ${lines[lineIndex - 1] ? lines[lineIndex - 1] : ''}`)
          return lineCount
        }
        let count
        if (status === 'after ()') {
          if (currentLine.match(/{\s*$/) === null) {
            checkLine(null, null, 'finished', null, lineCount)
          }
          else
            status = 'counting {}'
        }
        if (status === 'counting ()') {
          count = countBrackets('(', ')', bracketCount, currentLine)
          if (count <= 0) {
            if (currentLine.match(/{/g))
              lineCount = checkLine(lines, lineIndex, 'counting {}', 0, lineCount)
            else
              lineCount = checkLine(lines, lineIndex + 1, 'after ()', 0, lineCount + 1)
          }
          else
            lineCount = checkLine(lines, lineIndex + 1, 'counting ()', 0, lineCount + 1)
        } else if (status === 'counting {}') {
          count = countBrackets('{', '}', bracketCount, currentLine)
          if (count <= 0) {
            return lineCount
          }
          else {
            lineCount = checkLine(lines, lineIndex + 1, 'counting {}', count, lineCount + 1)
          }
        }
        return lineCount
      }

      return checkLine(lines, lineIndex, status, 0, 0)
    } catch(ex) {
      console.error("could`nt find end line of block")
      console.error(ex)
      return lineIndex
    }
  }


  public static saveSelection(): Range {
    var sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      return sel.getRangeAt(0);
    }
    return null;
  }

  public static restoreSelection(range): Selection {
    if (range) {
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    return window.getSelection();
  }

  public static round(value, step) {
    step || (step = 1.0);
    var inv = 1.0 / step;
    return Math.round(value * inv) / inv;
  }

  public static onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  public static addIfNotExist(array: any[], newItem: any, type: 'push' | 'unshift' = 'push') {
    if (!array) return
    if (array.findIndex(i => i === newItem) === -1) {
      if (type == 'push') array.push(newItem)
      else array.unshift(newItem)
    }

  }

  public static copyToClipboard(text) {
    let textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");  // Security exception may be thrown by some browsers.
    }
    catch(ex) {
      console.warn("Copy to clipboard failed.", ex);
      return false;
    }
    finally {
      document.body.removeChild(textarea);
    }
  }

  public static comparePaths(path1, path2) {
    return (path1 as string).replace(/[^a-zA-Z0-9 ]/g, "").indexOf(path2.replace(/[^a-zA-Z0-9 ]/g, ""))
  }

}


