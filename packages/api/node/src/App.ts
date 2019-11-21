/* this needs to be identical in nodeJS and Angular */
export interface SaveJson { nodes: SaveNode[] }
export interface SaveNode { lineNumber: number, filePath: string, id: string }
export interface MatchInfo { line: string, value: string, lineNumber: number, endContentLine: number, lineStartIndex: number, indexInLine: number, id: string, isRegex: boolean, flags: string, ofFile: string }
export interface FindInFilesResponse { file: string, content: string, matches: MatchInfo[] }
export interface SaveNodesResponse { savedId: string, exisitingId: string }
export interface SearchJson { title: string, pattern: string, flags: string, dirPath: string, searchPath: string, filenamePattern: string, isRegex: boolean, isFileNameRegex: boolean }
export interface ReloadRequest {
    dirPath: string; matches: MatchInfo[], files: { file: string }[]
}
export const VISI_PREFIX = "Visi->"
export const VISI_SUFFIX = "<-Visi"
export const VISI_SEPARATOR = "<->"
export const EndPoints = {
    find: '/find',
    saveToCode: '/saveToCode',/*Visi->0bd86d689212220c4c3e6df05e37b658<-Visi*/
    loadFromCode: '/loadFromCode',
    clearVisiIds: '/clearVisiIds',
    rewriteVisiIds: '/rewriteVisiIds',
    getPaths: '/getPaths',
    getAllFilesInDirectory: '/getAllFilesInDirectory'
}
/******** */
export interface SavedVisiId { visiId: string, line: number } //{'filepath': SavedVisiIds[]}

import * as express from 'express'
import { Config } from './config';
import { isUndefined } from 'util';
import { ReadLine } from 'readline';
import { normalize } from 'path';
let md5 = require('md5');

class App {
    public Path = require('path');
    public fs = require('fs');

    public express

    public configFile: Config = JSON.parse(this.fs.readFileSync('config.json'))
    public allowedFileExtensions: string[]

    constructor() {
        this.express = express()
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

        router.use(bodyParser.urlencoded({ limit: '3000kb', extended: true }));
        router.use(bodyParser.json({ limit: '3000kb' }));

        router.post(EndPoints.find, (req, res) => {
            console.log(EndPoints.find, req.body)
            let body: SearchJson = req.body
            this.findInFiles(res, body.pattern, body.flags, body.dirPath, body.searchPath, body.filenamePattern, body.isRegex, body.isFileNameRegex)
        })
        router.post(EndPoints.saveToCode, (req, res) => {/*Visi->8d012c76a6b3ea1eae598fbf1851435f<-Visi*/
            console.log(EndPoints.saveToCode, req.body)
            this.saveToCode(res, req.body.nodes, req.body.dirPath)/*Visi->ba3b07bea3f84987a6916251daccb65f<-Visi*/
        })
        router.post(EndPoints.loadFromCode, (req, res) => {
            console.log(EndPoints.loadFromCode, req.body)
            this.loadFromCode(req, res)
        })
        router.post(EndPoints.clearVisiIds, (req, res) => {
            console.log(EndPoints.clearVisiIds, req.body)
            this.clearVisiIds(res, req.body)
        })
        router.post(EndPoints.rewriteVisiIds, (req, res) => {
            console.log(EndPoints.rewriteVisiIds, req.body)
            this.rewriteVisiIds(res)
        })
        router.get(EndPoints.getPaths, (req, res) => {
            res.json(JSON.parse(this.fs.readFileSync('./src/paths.json')))
        })
        router.post(EndPoints.getAllFilesInDirectory, (req, res) => {
            // List all files in a directory in Node.js recursively in a synchronous fashion
            var walkSync = function (dir, filelist) {
                var path = path || require('path');
                var fs = fs || require('fs'),
                    files = fs.readdirSync(dir);
                filelist = filelist || [];
                files.forEach(function (file) {
                    if (fs.statSync(path.join(dir, file)).isDirectory()) {
                        filelist = walkSync(path.join(dir, file), filelist);
                    }
                    else {
                        filelist.push(path.join(dir, file));
                    }
                });
                return filelist;
            };
            res.json({ files: walkSync(req.body.folder, []) })
        })

        this.express.use('/', router)
        console.log('reaady to use')
    }

    private clearVisiIds(res: express.Response, req: { path }) {
        let savedIds = {}
        let clearedFileContents = {}
        this.processDir(req.path, (filePath) => {
            let fileText = this.readFile(filePath)
            let remarks = this.getRemarksFromPath(filePath)
            if (!this.containsVisiId(fileText)) return
            let splitFile = this.splitTextToLines(fileText)
            let fileLines = splitFile.lines
            let newFileLines = []
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
                    let visiIdFirstIndex = line.indexOf(remarks[0] + VISI_PREFIX)
                    let visiIdlastIndex = line.indexOf(VISI_SUFFIX + remarks[1]) + (VISI_SUFFIX + remarks[1]).length
                    newFileLines.push(line.replace(line.substring(visiIdFirstIndex, visiIdlastIndex), ""))
                } else {
                    newFileLines.push(line)
                }
            })
            clearedFileContents[filePath] = newFileLines.join(splitFile.splitChar)
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
            let fileResults = this.getResultsFromFile(filePath, reloadRequest.dirPath,
                (line) => {
                    if (!this.containsVisiId(line)) return null
                    let id = this.getIdFromLine(line)
                    let idMatch = nodesMatch.find(match => { return (match.id === id) })
                    if (!idMatch) return null
                    let regex = this.getRegex(idMatch.value, idMatch.isRegex, idMatch.flags)
                    if (regex.exec(line)) return regex.exec(line)
                    else return line
                },
                (line) => {
                    let id = this.getIdFromLine(line)
                    let match = nodesMatch.find(match => { return (match.id === id) })
                    return { isRegex: match.isRegex, flags: match.flags }
                })
            if (fileResults != null) {
                results.push(fileResults)
            }
            else {
                let partialFilePath = filePath.substring(this.Path.dirname(reloadRequest.dirPath).length, filePath.length)
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
        this.processDir(reloadRequest.dirPath, loadMatchesFromFile)
        res.json(results)
    }

    private splitTextToLines(text: string): { lines: string[], splitChar: string } {
        let splitChar
        if (text.indexOf('\r\n') !== -1) splitChar = '\r\n'
        else splitChar = '\n'
        return { lines: text.split(splitChar), splitChar: splitChar }
    }

    private getRemarksFromPath(path: string): string[] {
        let remarks = this.configFile.remarks[this.Path.extname(path)]
        if (!remarks) return this.configFile.remarks['default']
        else return remarks
    }

    private saveToCode(res: express.Response, nodes: SaveNode[], dirPath: string) {/*Visi->a25bcda36a72227aca76b0599da332b3<-Visi*/
        let nodesInFiles = {}
        let existingIds: SaveNodesResponse[] = []
        try {
            nodes.forEach(node => {
                if (isUndefined(node.filePath)) return
                if (!nodesInFiles[node.filePath]) nodesInFiles[node.filePath] = []
                nodesInFiles[node.filePath].push(node)
            })
            for (let path in nodesInFiles) {
                if (this.Path.extname(path) === ".json") continue
                let fileText = this.fs.readFileSync(this.Path.join(dirPath, path), { encoding: "UTF8" })
                let splitLines: { lines: string[], splitChar: string }
                splitLines = this.splitTextToLines(fileText)
                let remarks = this.getRemarksFromPath(path)
                nodesInFiles[path].forEach((node: SaveNode) => {
                    if (splitLines.lines[node.lineNumber].indexOf(node.id) === -1) {
                        let lineText = splitLines.lines[node.lineNumber]
                        if (this.containsVisiId(lineText)) {
                            existingIds.push({ exisitingId: this.getIdFromLine(lineText), savedId: node.id })
                            console.log('id exists in line. exstsitinf id:', path, node.lineNumber, this.getIdFromLine(lineText), node.id)
                        } else {
                            splitLines.lines[node.lineNumber] = this.addVisiIdToLine(lineText, node.id, remarks)
                            console.log('added id to:', path, node.lineNumber, node.id)
                        }
                    } else {
                        console.log('id already saved:', path, node.lineNumber, node.id)
                    }
                })
                let savedFileText = splitLines.lines.join(splitLines.splitChar)
                this.fs.writeFileSync(this.Path.join(dirPath, path), savedFileText, { flags: 'r+' })
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
        if (fileText.indexOf("\r\n") === -1) fileText.replace("\n", "\r\n")
        return fileText
    }

    private getRegex(pattern, isRegex, flags) {
        if (!isRegex) {
            pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        }
        return this.convertPatternToRexp(pattern, flags)
    }

    private getIdForFile(dirPath, searchPath) {
        if (dirPath) return searchPath.substring(dirPath.length)
        else return searchPath
    }

    private findInFiles(res: express.Response, pattern, flags, dirPath, searchPath, filenamePattern, isRegex, isFileNamePatternRegex) {
        let results = []
        try {
            let regex = this.getRegex(pattern, isRegex, flags)
            console.log('regex', regex)
            const normalizedDirPath = this.Path.normalize(dirPath)
            const normalizedSearchPath = this.Path.normalize(searchPath)
            // open file
            if (pattern === '') {
                results = [{ file: normalizedSearchPath, content: this.readFile(this.Path.join(normalizedDirPath, normalizedSearchPath)), matches: [] }]
                // search in file
            } else if (searchPath && searchPath!=='') {
                const fileResult = this.getResultsFromFile(this.Path.join(normalizedDirPath, normalizedSearchPath), normalizedDirPath, (line) => {
                    return line.match(regex)
                }, (line) => { return { isRegex: isRegex, flags: flags } })
                results = [fileResult]
                // search in folder
            } else {
                this.processDir(normalizedDirPath, (filePath) => {
                    if (isFileNamePatternRegex) {
                        filenamePattern = this.convertPatternToRexp(filenamePattern, 'gi')
                    }
                    if (filenamePattern && filePath.match(filenamePattern) === null) return

                    let fileResults: FindInFilesResponse
                    fileResults = this.getResultsFromFile(filePath, normalizedDirPath, (line) => {
                        return line.match(regex)
                    }, (line) => { return { isRegex: isRegex, flags: flags } })
                    console.log('search  in', filePath)
                    if (fileResults !== null) {
                        console.log('found in', filePath)
                        results.push(fileResults)
                    }
                })
            }
            //noinspection TypeScriptUnresolvedFunction
            res.json(results)
        }
        catch (ex) {
            console.log(ex.message)
            //noinspection TypeScriptUnresolvedFunction
            res.status(500).json({ message: ex.message })
        }
    }

    private getEndLineOfBlock(lines: string[], lineIndex: number, status: 'counting ()' | 'counting {}' = 'counting ()') {
        let currentLine = lines[lineIndex]
        if (status == 'counting ()') if (currentLine.indexOf('(') === -1) return undefined
        if (status == 'counting {}') if (currentLine.indexOf('{') === -1) return undefined

        let countBrackets = (open, close, count, line) => {
            let openRegex = line.match(new RegExp(`\\${open}`, 'g'))
            let openCount = !openRegex ? 0 : openRegex.length
            let closeRegex = line.match(new RegExp(`\\${close}`, 'g'))
            let closeCount = !closeRegex ? 0 : closeRegex.length
            return count + openCount - closeCount
        }
        let checkLine = (lines: string[], lineIndex, status: 'counting ()' | 'counting {}' | 'after ()' | 'finished', bracketCount, lineCount) => {
            if (status === 'finished') return undefined
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
                    lineCount = checkLine(lines, lineIndex + 1, 'counting {}', count, lineCount + 1)
                }
            }
            return lineCount
        }

        return checkLine(lines, lineIndex, status, 0, 0)
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
    private getResultsFromFile(fullPath, dirPath, regexMatchFromLine: (line) => RegExpExecArray | null, matchRegexInfo: (line) => { isRegex: boolean, flags: string }): FindInFilesResponse {
        let fileText = this.readFile(fullPath)
        let lineBreakLength = this.getLineBreakLength(fullPath)
        let fileLines = this.splitTextToLines(fileText).lines
        let tempResults: MatchInfo[] = []
        let lineStartIndex = 0
        let lineMatch: RegExpExecArray = null
        fileLines.forEach((line, lineIndex) => {
            lineMatch = regexMatchFromLine(line)
            /* condition of creating match from line*/
            if (lineMatch !== null) {
                let id
                if (this.containsVisiId(line)) {
                    id = this.getIdFromLine(line)
                }
                else {
                    id = this.createId(fullPath, lineIndex)
                }
                let endContentLine
                if (line.indexOf('(') !== -1) {
                    endContentLine = this.getEndLineOfBlock(fileLines, lineIndex)
                } else if (line.indexOf('{') !== -1) {
                    endContentLine = this.getEndLineOfBlock(fileLines, lineIndex, "counting {}")
                }
                let resultMatch = {
                    value: lineMatch[0],
                    indexInLine: lineMatch.index,
                    lineStartIndex: lineStartIndex,
                    line: line, lineNumber: lineIndex,
                    id: id,
                    isRegex: matchRegexInfo(line).isRegex,
                    flags: matchRegexInfo(line).flags,
                    endContentLine: lineIndex + endContentLine,
                    ofFile: this.getIdForFile(dirPath, fullPath)

                }
                tempResults.push(resultMatch)
            }
            lineStartIndex += line.length + lineBreakLength
            lineMatch = null
        })
        if (tempResults.length) {
            return { file: this.getIdForFile(dirPath, fullPath), content: fileText, matches: tempResults }
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
        let visiData = line.match('Visi->(.+)<-Visi')
        if (!visiData || this.addVisiIdToLine.length === 1) return null
        visiData = visiData[1].split(VISI_SEPARATOR)
        return visiData[0]
    }

    private containsVisiId(line): boolean {
        return line.indexOf(VISI_PREFIX) !== -1 && line.indexOf(VISI_SUFFIX) !== -1
    }

    private addVisiIdToLine(line, id, remarks: string[]): string {
        return line + remarks[0] + VISI_PREFIX + id + VISI_SUFFIX + remarks[1]
    }
}

export default new App().express
