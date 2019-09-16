/* this needs to be identical in nodeJS and Angular */
export interface SaveJson { nodes: SaveNode[] }
export interface SaveNode { lineNumber: number, filePath: string, id: string }
export interface MatchInfo { line: string, value: string, lineNumber: number, endContentLine: number, lineStartIndex: number, indexInLine: number, id: string, isRegex: boolean, flags: string }
export interface FindInFilesResponse { file: string, content: string, matches: MatchInfo[] }
export interface SaveNodesResponse { savedId: string, exisitingId: string }
export interface SearchJson { title: string, pattern: string, flags: string, path: string, filenamePattern: string, isRegex: boolean, isFileNameRegex: boolean }
export interface ReloadRequest { matches: MatchInfo[], files: { file: string }[] }
export const VISI_PREFIX = "/*Visi->"
export const VISI_SUFFIX = "<-Visi*/"
export const EndPoints = {
    find: '/find',
    saveToCode: '/saveToCode',
    loadFromCode: '/loadFromCode',
    clearVisiIds: '/clearVisiIds',
    rewriteVisiIds: '/rewriteVisiIds'
}
/******** */
export interface SavedVisiId { visiId: string, line: number } //{'filepath': SavedVisiIds[]}

import * as express from 'express'
import { Config } from './config';
import { isUndefined } from 'util';
import { ReadLine } from 'readline';
let md5 = require('md5');

class App {
    public Path = require('path');
    public fs = require('fs');

    public express

    public configFile: Config = JSON.parse(this.fs.readFileSync('config.json'))
    public mainPath
    public allowedFileExtensions: string[]

    private debugText = ["public addNodesToChart(nodesAndLinks: Array<Node | Edge>): Array<Node | Edge> {","    // filter out nodes that exist","    let newNodesAndLinks = nodesAndLinks.filter((item) => {","      let itemOnChart = this.chart.getItem(item.id);","      if (itemOnChart === null) return true;","      let itemAttsChanged = (JSON.stringify(ChartUtils.getAttributes(itemOnChart)) !== JSON.stringify(ChartUtils.getAttributes(item)));","      if (itemAttsChanged) return true;","      else return false;","    });"," ","    let addedFileIndex = 0//existingFileNodesNumber;","    newNodesAndLinks.map((item: Node | Edge) => {","      if (ChartUtils.isNode(item)) {","        item = item as Node","        // file nodes","        if (ChartUtils.isFileNode(item)) {","          let allFileNodes = this.chart.getItems(this.chart.getAllItemIds().nodes).nodes.filter(i => ChartUtils.isFileNode(i))","          let largestYPos = allFileNodes.map(i => this.chart.getPositions(i.id)).map(i => i.y).filter(i => i != undefined).sort((i,j)=>{return j-i})[0]","          addedFileIndex++;","          if(this.app.layout === 'directional')","            return this.setFileNodePos(item as Node, addedFileIndex, largestYPos);","          else","            return this.setFileNodePos2(item as Node, addedFileIndex, largestYPos);","        }","        // match node","        else if (ChartUtils.getOfFile(item)) {","          let ofFileId = ChartUtils.getOfFile(item)","          let ofFileNode = this.chart.getPosition(ofFileId)","          if (!ofFileNode) {","            ofFileNode = newNodesAndLinks.find(i => i.id === ofFileId)","          }"," ","          if (item['x'] === undefined && item['y'] === undefined) {","            if(this.app.layout==='spread') {","              item['x'] = ofFileNode.x  + Math.random() * (ChartConsts.filePositions.distance/2 + ChartConsts.filePositions.distance/2) - ChartConsts.filePositions.distance/2","              item['y'] = ofFileNode.y  + Math.random() * (ChartConsts.filePositions.distance/2 + ChartConsts.filePositions.distance/2) - ChartConsts.filePositions.distance/2","            } else {","              item['x'] = this.app.selectedNode ? (this.chart.getPosition(this.app.selectedNode.id).x + ChartConsts.filePositions.distance) : 0","              item['y'] = ofFileNode.y + Math.random() * (ChartConsts.filePositions.distance - 10) - ChartConsts.filePositions.distance / 2","            }","            item.physics = false","          }","        }","      }","      return item","    })"]


    constructor() {
        this.express = express()
        this.mainPath = this.configFile.path
        this.allowedFileExtensions = this.configFile.allowedFileExtensions
        this.express.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', "*");
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.header('Access-Control-Allow-Headers', "*")
            res.header('Access-Control-Allow-Credentials', true);

            if (req.method === 'OPTIONS') {
                res.end();
                return;
            }

            next();

        });

        this.mountRoutes()
        // console.log(this.getContentOfFunction(this.debugText, 0))
    }


    private mountRoutes(): void {

        let bodyParser = require('body-parser');
        //noinspection TypeScriptUnresolvedFunction
        const router = express.Router()
        console.log("using path: " + this.mainPath)

        router.use(bodyParser.urlencoded({ limit: '3000kb', extended: true }));
        router.use(bodyParser.json({ limit: '3000kb' }));

        router.post(EndPoints.find, (req, res) => {
            console.log(EndPoints.find, req.body)
            let body: SearchJson = req.body
            this.findInFiles(res, body.pattern, body.flags, this.mainPath, body.path, body.filenamePattern, body.isRegex, body.isFileNameRegex)
        })
        router.post(EndPoints.saveToCode, (req, res) => {
            console.log(EndPoints.saveToCode, req.body)
            this.saveToCode(res, req.body.nodes)
        })
        router.post(EndPoints.loadFromCode, (req, res) => {
            console.log(EndPoints.loadFromCode, req.body)
            this.loadFromCode(req, res)
        })
        router.post(EndPoints.clearVisiIds, (req, res) => {
            console.log(EndPoints.clearVisiIds, req.body)
            this.clearVisiIds(res)
        })
        router.post(EndPoints.rewriteVisiIds, (req, res) => {
            console.log(EndPoints.rewriteVisiIds, req.body)
            this.rewriteVisiIds(res)
        })
        this.express.use('/', router)
        console.log('reaady to use')
    }

    private clearVisiIds(res: express.Response) {
        let savedIds = {}
        let clearedFileContents = {}
        this.processDir(this.mainPath, (filePath) => {
            let fileText = this.readFile(filePath)
            if (!this.containsVisiId(fileText)) return
            let fileLines = this.splitTextToLines(fileText).lines
            fileLines.forEach((line, lineIndex) => {
                if (this.containsVisiId(line)) {
                    if (savedIds[filePath] === undefined) {
                        savedIds[filePath] = []
                    }
                    let savedVisId: SavedVisiId = {
                        visiId: this.getIdFromLine(line),
                        line: lineIndex
                    }
                    savedIds[filePath].push(savedVisId)
                }
            })
            let regex = new RegExp(VISI_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
                ".*" +
                VISI_SUFFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
            clearedFileContents[filePath] = fileText.replace(regex, "")
        })
        for (let filePath in clearedFileContents) {
            this.fs.writeFileSync(filePath, clearedFileContents[filePath])
        }
        console.log('clear visiId', savedIds)
        this.fs.writeFileSync(this.configFile['savedVisiIdsPath'], JSON.stringify(savedIds))
        res.json(savedIds)
    }

    private rewriteVisiIds(res: express.Response) {
        let skippedIds = { skippedIds: [] }
        let visiIdsLocations = JSON.parse(this.fs.readFileSync(this.configFile['savedVisiIdsPath']))
        for (let filePath in visiIdsLocations) {
            let visiIds: SavedVisiId[] = visiIdsLocations[filePath]
            let fileText = this.readFile(filePath)
            let splitText = this.splitTextToLines(fileText)
            visiIds.forEach((visiId) => {
                let line = splitText.lines[visiId.line]
                if (this.containsVisiId(line)) {
                    skippedIds.skippedIds.push({ line: line, lineIndex: visiId.line, visiId: visiId, existingVisiId: this.getIdFromLine(line) })
                    return
                }
                splitText.lines[visiId.line] = splitText.lines[visiId.line] + VISI_PREFIX + visiId.visiId + VISI_SUFFIX
            })
            let textWithAddedVisiIds = splitText.lines.join(splitText.splitChar)
            this.fs.writeFileSync(filePath, textWithAddedVisiIds)
        }
        console.log('rewrite visiId', visiIdsLocations)
        res.json(skippedIds)
    }

    private loadFromCode(req: express.request, res: express.Response) {
        let reloadRequest: ReloadRequest = req.body
        let nodesMatch: MatchInfo[] = reloadRequest.matches
        let chartFilePaths: string[] = reloadRequest.files.map(i => i.file)
        if (!nodesMatch || !Array.isArray(nodesMatch) || nodesMatch.length === 0) {
            res.json({})
            return
        }
        let results: FindInFilesResponse[] = []
        let loadMatchesFromFile = (filePath) => {
            let fileResults = this.getResultsFromFile(filePath,
                (line) => {
                    if (!this.containsVisiId(line)) return null
                    let id = this.getIdFromLine(line)
                    let idMatch = nodesMatch.find(match => { return (match.id === id) })
                    let regex = this.getRegex(idMatch.value, idMatch.isRegex, idMatch.flags)
                    return regex.exec(line)
                },
                (line) => {
                    let id = this.getIdFromLine(line)
                    let match = nodesMatch.find(match => { return (match.id === id) })
                    return { isRegex: match.isRegex, flags: match.flags }
                })
            if (fileResults != null) results.push(fileResults)
            else {
                let partialFilePath = filePath.substring(this.mainPath.length, filePath.length)
                let indexOfPartialInChartFiles = chartFilePaths.indexOf(partialFilePath)
                if (indexOfPartialInChartFiles !== -1) {
                    results.push({
                        file: chartFilePaths[indexOfPartialInChartFiles],
                        content: this.readFile(filePath),
                        matches: []
                    })
                }
            }
        }
        this.processDir(this.mainPath, loadMatchesFromFile)
        res.json(results)
    }

    private splitTextToLines(text: string): { lines: string[], splitChar: string } {
        let splitChar
        if (text.indexOf('\r\n') !== -1) splitChar = '\r\n'
        else splitChar = '\n'
        return { lines: text.split(splitChar), splitChar: splitChar }
    }

    private saveToCode(res: express.Response, nodes: SaveNode[]) {
        let nodesInFiles = {}
        let existingIds: SaveNodesResponse[] = []
        try {
            nodes.forEach(node => {
                if (isUndefined(node.filePath)) return
                if (!nodesInFiles[node.filePath]) nodesInFiles[node.filePath] = []
                nodesInFiles[node.filePath].push(node)
            })
            for (let path in nodesInFiles) {
                let fileText = this.fs.readFileSync(this.Path.join(this.mainPath, path), { encoding: "UTF8" })
                let splitLines: { lines: string[], splitChar: string }
                splitLines = this.splitTextToLines(fileText)
                nodesInFiles[path].forEach((node: SaveNode) => {
                    if (splitLines.lines[node.lineNumber].indexOf(node.id) === -1) {
                        let lineText = splitLines.lines[node.lineNumber]
                        if (this.containsVisiId(lineText)) {
                            existingIds.push({ exisitingId: this.getIdFromLine(lineText), savedId: node.id })
                            console.log('id exists in line. exstsitinf id:', path, node.lineNumber, this.getIdFromLine(lineText), node.id)
                        } else {
                            splitLines.lines[node.lineNumber] = this.addVisiIdToLine(lineText, node.id)
                            console.log('added id to:', path, node.lineNumber, node.id)
                        }
                    } else {
                        console.log('id already saved:', path, node.lineNumber, node.id)
                    }
                })
                let savedFileText = splitLines.lines.join(splitLines.splitChar)
                this.fs.writeFileSync(this.Path.join(this.mainPath, path), savedFileText, { flags: 'r+' })
                console.log('saved file', path)
            }
        } catch (ex) {
            console.log(ex)
            res.error(ex);
        }
        res.json(existingIds)
    }

    private isDirectoryAllowed(dir: string): boolean {
        let isAllowed = true
        this.configFile.forbiddenFolders.forEach(forbidden => {
            if (!isAllowed) return
            if (dir.indexOf(forbidden) !== -1) {
                isAllowed = false
            }
        })
        return isAllowed
    }

    private processDir(dir: string, processFileFunc: (fullFilePath) => void) {
        if (!this.isDirectoryAllowed(dir)) return
        if (!this.fs.statSync(dir).isDirectory()) {
            processFileFunc(this.Path.join(dir))
            return
        }

        let files = this.fs.readdirSync(dir);
        files.forEach((file) => {
            let fileFullPath = this.Path.join(dir, file)
            if (this.fs.statSync(fileFullPath).isDirectory()) {
                this.processDir(fileFullPath, processFileFunc);
            } else {
                if (this.allowedFileExtensions.indexOf(this.Path.extname(fileFullPath)) == -1) {
                    return
                }
                processFileFunc(this.Path.join(fileFullPath))
            }
        });

        return;
    };

    private readFile = (filePath) => {
        console.log('added file:', filePath)
        let fileText = this.fs.readFileSync(filePath, { encoding: "UTF8" })
        if (fileText.indexOf("\r\n") !== -1) fileText.replace("\n", "\r\n")
        return fileText
    }

    private getRegex(pattern, isRegex, flags) {
        if (!isRegex) {
            pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        }
        return this.convertPatternToRexp(pattern, flags)
    }

    private findInFiles(res: express.Response, pattern, flags, mainPath, path, filenamePattern, isRegex, isFileNamePatternRegex) {
        let results = []
        try {
            let regex = this.getRegex(pattern, isRegex, flags)
            console.log('regex', regex)
            if (pattern === "") {
                res.json([])
                return
            }
            let givenPath = this.Path.normalize(path)
            let normalizedMainPath = this.Path.normalize(mainPath)
            let commonPath = givenPath.replace(normalizedMainPath, "")
            this.processDir(this.Path.join(normalizedMainPath, commonPath), (filePath) => {
                if (isFileNamePatternRegex) {
                    filenamePattern = this.convertPatternToRexp(filenamePattern, 'gi')
                }
                if (filePath.match(filenamePattern) === null) return

                let fileResults: FindInFilesResponse
                if (pattern !== '') {
                    fileResults = this.getResultsFromFile(filePath, (line) => { return regex.exec(line) }, (line) => { return { isRegex: isRegex, flags: flags } })
                } else {
                    fileResults = { file: filePath.substring(this.mainPath.length), content: this.readFile(filePath), matches: [] }
                }
                console.log('search  in', filePath)
                if (fileResults !== null) {
                    console.log('found in', filePath)
                    results.push(fileResults)
                }
            })
            //noinspection TypeScriptUnresolvedFunction
            res.json(results)
        }
        catch (ex) {
            console.log(ex.message)
            //noinspection TypeScriptUnresolvedFunction
            res.status(500).json({ message: ex.message })
        }
    }

    private getContentOfFunction(lines: string[], lineIndex: number) {
        let currentLine = lines[lineIndex]
        if (currentLine.indexOf('(') === -1) return undefined

        let countBrackets = (open, close, count, line) => { 
            let openRegex = line.match(new RegExp(`\\${open}`, 'g'))
            let openCount = !openRegex ? 0 : openRegex.length
            let closeRegex = line.match(new RegExp(`\\${close}`, 'g'))
            let closeCount = !closeRegex ? 0 : closeRegex.length
            return count + openCount - closeCount
        }
        let checkLine = (lines: string[], lineIndex, status: 'counting ()' | 'counting {}' | 'after ()' | 'finished', bracketCount, lineCount) => {
            if(status === 'finished') return undefined
            let currentLine = lines[lineIndex]
            console.log(lineCount, currentLine)
            let count
            if (status === 'after ()') {
                if (currentLine.match(/^\s*\{/) === null) {
                    checkLine(null, null, 'finished', null, lineCount)
                }
                else
                    status = 'counting {}'
            }
            if (status === 'counting ()') {
                count = countBrackets('(', ')', bracketCount, currentLine)
                if (count <= 0) {
                    if (currentLine.match('{'))
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
                    lineCount = checkLine(lines, lineIndex+1, 'counting {}', count, lineCount + 1)
                }
            }
            return lineCount
        }

        return checkLine(lines, lineIndex, 'counting ()', 0, 0)
    }

    // match blahblah(blahblah(blahblah)blahblah).blahblah(blahblah(blahblah)blahblah)....{blahblah{blahblah}blahblah}
    private getContentOfFunction_2(lines: string[], lineIndex: number) {
        let endNumber = 0
        let currentLine = lines[lineIndex]
        let currentLineIndex = lineIndex

        let i = currentLine.indexOf('(')
        if (i === -1) return
        let lineSoFar = currentLine.substring(0, i)
        // start inside '(' bracktes
        let status: 'inside brackets' | 'after brackets' | 'after dot' | 'inside quote' | 'no content' = 'inside brackets'
        let currBracket: { open: '(' | '{', close: ')' | '}' } = { open: '(', close: ')' }
        let bracketsCounter = 0
        let setStatusInsideBracket = () => { status = 'inside brackets'; bracketsCounter++ }
        let setNormalBrackets = () => { currBracket.open = '('; currBracket.close = ')'; status = 'inside brackets'; setStatusInsideBracket() }
        let setCurlyBrackets = () => { currBracket.open = '{'; currBracket.close = '}'; setStatusInsideBracket() }
        setNormalBrackets()


        for (i++; i && i < 1000 && currentLine; i++) {
            // end of line
            if (i > currentLine.length) {
                currentLine = lines[++currentLineIndex]
                if (currentLine) {
                    currentLine = currentLine.replace(/('|").+('|")/g, '')
                }
                i = 0
                endNumber++
                continue
            }

            let currentChar = currentLine.charAt(i)
            lineSoFar += currentChar

            if (status === 'inside brackets') {
                if (currentChar === currBracket.close) bracketsCounter--
                else if (currentChar === currBracket.open) bracketsCounter++

                if (bracketsCounter === 0) status = 'after brackets'
            }
            else if (status === 'after brackets') {
                if (currBracket.open === '(') {
                    // ignore space after bracket
                    if (currentChar.match(/\s/)) continue

                    // match (bla) => 
                    if ((currentChar + currentLine[++i]) === '=>') continue
                    // match (bla).
                    else if (currentChar === '.') {
                        status = 'after dot'
                    }
                    // match (bla) {
                    else if (currentChar === '{') {
                        setCurlyBrackets()
                    }
                    else {
                        status = 'no content'
                        break;
                    }
                }
                else {
                    break
                }
            }
            else if (status === 'after dot') {
                // dont match (bla).\s
                if (currentChar.match(/\s/) !== null) {
                    status = 'no content';
                    break
                }
                // match (bla).bla
                else if (currentChar === '(') {
                    status = 'inside brackets'
                    setNormalBrackets()
                }
            }
        }

        if (status === 'no content') return undefined
        else return endNumber
    }

    // reload: for each line, check line id is in matches ids; if yes create match using regex of match
    // find in files: for each line, check if line has regex; if yes create match using regex
    private getResultsFromFile(filePath, regexMatchFromLine: (line) => RegExpExecArray | null, matchRegexInfo: (line) => { isRegex: boolean, flags: string }): FindInFilesResponse {
        let fileText = this.readFile(filePath)
        let lineBreakLength = this.getLineBreakLength(filePath)
        let fileLines = this.splitTextToLines(fileText).lines
        let tempResults: MatchInfo[] = []
        let lineStartIndex = 0
        fileLines.forEach((line, lineIndex) => {
            let match = regexMatchFromLine(line)
            /* condition of creating match from line*/
            if (match != null) {
                let id
                if (this.containsVisiId(line)) {
                    id = this.getIdFromLine(line)
                }
                else {
                    id = this.createId(filePath, lineIndex)
                }
                let endContentLine
                if (match[0].indexOf('(') !== -1) {
                    endContentLine = this.getContentOfFunction(fileLines, lineIndex)
                }
                let resultMatch = {
                    value: match[0],
                    indexInLine: match.index,
                    lineStartIndex: lineStartIndex,
                    line: line, lineNumber: lineIndex,
                    id: id,
                    isRegex: matchRegexInfo(line).isRegex,
                    flags: matchRegexInfo(line).flags,
                    endContentLine: lineIndex + endContentLine
                }
                tempResults.push(resultMatch)
            }
            lineStartIndex += line.length + lineBreakLength
        })
        if (tempResults.length) {
            let fileName = filePath.substring(this.mainPath.length)
            return { file: fileName, content: fileText, matches: tempResults }
        } else return null
    }

    private convertPatternToRexp(pattern, flags): RegExp {
        return new RegExp(pattern, flags)
    }

    private getLineBreakLength(fileText: string) {
        if (fileText.indexOf('/r/n') == -1) return 1
        else return 2
    }

    private getMatches(data, regex: RegExp) {
        return data.match(regex)
    }

    private createId(filePath, lineNumber): string {
        return md5(filePath + lineNumber + new Date().getMilliseconds)
    }

    private getIdFromLine(line: string) {
        return line.substring(line.indexOf(VISI_PREFIX) + VISI_PREFIX.length, line.indexOf(VISI_SUFFIX))
    }

    private containsVisiId(line): boolean {
        return line.indexOf(VISI_PREFIX) !== -1
    }

    private addVisiIdToLine(line, id): string {
        return line + VISI_PREFIX + id + VISI_SUFFIX
    }
}

export default new App().express
