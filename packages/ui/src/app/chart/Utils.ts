export class Utils {
  static getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  static shadeColor(color: string, percent: number) {

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

  public static deepMerge(target, ...sources) {
    let isObject = (item) => {
      return (item && typeof item === 'object' && !Array.isArray(item));
    };
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, {[key]: {}});
          Utils.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, {[key]: source[key]});
        }
      }
    }

    return Utils.deepMerge(target, ...sources);
  }

  public static getContentOfFunction(lines: string[], lineIndex: number) {
    let currentLine = lines[lineIndex];
    if (currentLine.indexOf('(') === -1) return undefined;

    let countBrackets = (open, close, count, line) => {
      let openRegex = line.match(new RegExp(`\\${open}`, 'g'));
      let openCount = !openRegex ? 0 : openRegex.length;
      let closeRegex = line.match(new RegExp(`\\${close}`, 'g'));
      let closeCount = !closeRegex ? 0 : closeRegex.length;
      return count + openCount - closeCount;
    };
    let checkLine = (lines: string[], lineIndex, status: 'counting ()' | 'counting {}' | 'after ()' | 'finished', bracketCount, lineCount) => {
      if (status === 'finished') return undefined;
      let currentLine = lines[lineIndex];
      console.log(lineCount, currentLine);
      let count;
      if (status === 'after ()') {
        if (currentLine.match(/^\s*\{/) === null) {
          checkLine(null, null, 'finished', null, lineCount);
        } else
          status = 'counting {}';
      }
      if (status === 'counting ()') {
        count = countBrackets('(', ')', bracketCount, currentLine);
        if (count <= 0) {
          if (currentLine.match('{'))
            lineCount = checkLine(lines, lineIndex, 'counting {}', 0, lineCount);
          else
            lineCount = checkLine(lines, lineIndex + 1, 'after ()', 0, lineCount + 1);
        } else
          lineCount = checkLine(lines, lineIndex + 1, 'counting ()', 0, lineCount + 1);
      } else if (status === 'counting {}') {
        count = countBrackets('{', '}', bracketCount, currentLine);
        if (count <= 0) {
          return lineCount;
        } else {
          lineCount = checkLine(lines, lineIndex + 1, 'counting {}', count, lineCount + 1);
        }
      }
      return lineCount;
    };

    return checkLine(lines, lineIndex, 'counting ()', 0, 0);
  }


}
