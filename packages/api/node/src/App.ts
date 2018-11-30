/* this needs to be identical in nodeJS and Angular */
export interface SaveJson {nodes: SaveNode[]}
export interface SaveNode {lineNumber: number, filePath: string, id: string}
export interface ReloadIdMatch {lineNumber: number, path: string, line: string, index}
export interface MatchInfo {line:string, value:string, lineNumber:number, lineStartIndex: number, indexInLine:number, id: string, isRegex: boolean, flags: string}
export interface FindInFilesResponse {file:string, content:string, matches:MatchInfo[]}
export interface SaveNodesResponse {savedId: string, exisitingId: string}
export const VISI_PREFIX = "/*Visi->"
export const VISI_SUFFIX = "<-Visi*/"
/******** */

import * as express from 'express'
import { Config } from './config';
import { isUndefined } from 'util';
import { ReadLine } from 'readline';
let md5 = require('md5');

class App {
    public Path = require('path');
    public fs = require('fs');

    public express

    public congifFile: Config = JSON.parse(this.fs.readFileSync('config.json'))
    public mainPath
    public allowedFileExtensions: string[]

    constructor() {
        this.express = express()
        this.mainPath = this.congifFile.path
        this.allowedFileExtensions = this.congifFile.allowedFileExtensions
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
    }


    private mountRoutes(): void {

        let bodyParser = require('body-parser');
        //noinspection TypeScriptUnresolvedFunction
        const router = express.Router()

        router.use(bodyParser.urlencoded({limit: '3000kb', extended: true}));
        router.use(bodyParser.json({limit: '3000kb'}));

        router.post('/find', (req, res) => {
            console.log('find', req.body)
            let body = req.body
            this.findInFiles(res, body.pattern, body.flags, this.mainPath, body.path, body.fileExtensions, body.isRegex)
        })
        router.post('/saveToCode', (req, res) => {
            console.log('/saveToCode', req.body)
            this.saveToCode(res, req.body.nodes)
        })
        router.post('/loadFromCode', (req, res) => {
            console.log('/loadFromCode', req.body)
            this.loadFromCode(req, res)
        })
        this.express.use('/', router)
    }

    private loadFromCode(req: express.request, res:express.Response) {
        let nodesMatch: MatchInfo[] = req.body
        if(!nodesMatch || nodesMatch.length===0) {
            res.json({})
            return
        }
        let results: FindInFilesResponse[] = []
        let loadMatchesFromFile = (filePath) => {
            let fileResults = this.getResultsFromFile(filePath, 
                (line)=>{
                    if(!this.containsVisiId(line)) return null
                    let id = this.getIdFromLine(line)
                    let idMatch = nodesMatch.find(match=>{return (match.id===id)})
                    let regex = this.getRegex(idMatch.value, idMatch.isRegex, idMatch.flags)
                    return regex.exec(line)
                }, 
                (line)=>{
                    let id = this.getIdFromLine(line)
                    let match =  nodesMatch.find(match=>{return (match.id===id)})
                    return {isRegex: match.isRegex, flags: match.flags}
                })
            if(fileResults!=null) results.push(fileResults)
        } 
        this.processDir(this.mainPath, loadMatchesFromFile)
        res.json(results)
    }

    private saveToCode(res:express.Response, nodes: SaveNode[]) {
        let nodesInFiles = {}
        let existingIds: SaveNodesResponse[] = []
        try{
            nodes.forEach(node=>{
                if(isUndefined(node.filePath)) return
                if(!nodesInFiles[node.filePath]) nodesInFiles[node.filePath] = []
                nodesInFiles[node.filePath].push(node)
            })
            for(let path in nodesInFiles) {
                let fileText = this.fs.readFileSync(this.Path.join(this.mainPath, path), {encoding: "UTF8"})
                let splitChar
                if(fileText.indexOf('\r\n')!==-1) splitChar = '\r\n'
                else splitChar = '\n'
                
                let fileLines = fileText.split(splitChar)
                nodesInFiles[path].forEach((node: SaveNode)=> {
                    if(fileLines[node.lineNumber].indexOf(node.id)===-1) {
                        let lineText = fileLines[node.lineNumber]
                        if(this.containsVisiId(lineText)) {
                            existingIds.push({exisitingId: this.getIdFromLine(lineText), savedId: node.id})
                            console.log('id exists in line. exstsitinf id:', path, node.lineNumber, this.getIdFromLine(lineText), node.id)
                        } else {
                            fileLines[node.lineNumber] =this.addVisiIdToLine(lineText, node.id)
                            console.log('added id to:', path, node.lineNumber, node.id)
                            }
                    } else {
                        console.log('id already saved:', path, node.lineNumber, node.id)
                    }
                })
                let savedFileText = fileLines.join(splitChar)
                this.fs.writeFileSync(this.Path.join(this.mainPath, path), savedFileText, {flags: 'r+'})
                console.log('saved file', path)
            }
        } catch (ex) {
            console.log(ex)
            res.error(ex);
        }
        res.json(existingIds)
    }

    private processDir(dir, processFileFunc: (fullFilePath)=>void) {
        if(!this.fs.statSync(dir).isDirectory()) {
            processFileFunc(this.Path.join(dir))
            return
        }

        let files = this.fs.readdirSync(dir);
        files.forEach((file) => {
            let fileFullPath = this.Path.join(dir, file)
            if (this.fs.statSync(fileFullPath).isDirectory()) {
                this.processDir(fileFullPath, processFileFunc);
            } else {
                if(this.allowedFileExtensions.indexOf(this.Path.extname(fileFullPath))==-1) {
                    return
                }
                processFileFunc(this.Path.join(fileFullPath))
            }
        });

        return;
    };

    private readFile = (filePath) => {
        console.log('added file:', filePath)
        return this.fs.readFileSync(filePath, {encoding: "UTF8"}).replace(/\r\n/g, '\n')
    }

    private getRegex(pattern, isRegex, flags) {
        if(!isRegex) {
            pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        }
        return this.convertPatternToRexp(pattern, flags)
    }

    private findInFiles(res: express.Response, pattern, flags, mainPath, path, fileExtensions, isRegex) {
        let results = []
        let regex = this.getRegex(pattern, isRegex, flags)
        console.log('regex', regex)
        try {
            if(path!=='') {
                results.push(this.getResultsFromFile(this.Path.join(mainPath, path), (line)=>{return regex.exec(line)}, (line)=>{return {isRegex: isRegex, flags: flags}}))
            }
            else {
                this.processDir(this.mainPath, (filePath)=> {
                    if (filePath.match(new RegExp(fileExtensions)) === null) return
                    let fileResults = this.getResultsFromFile(filePath, (line)=>{return regex.exec(line)}, (line)=>{return {isRegex: isRegex, flags: flags}})
                    console.log('search  in', filePath)
                    if(fileResults!==null) {
                        console.log('found in', filePath)
                        results.push(fileResults)
                    }
                })
            }
            //noinspection TypeScriptUnresolvedFunction
            res.json(results)
        }
        catch(ex) {
            console.log(ex.message)
            //noinspection TypeScriptUnresolvedFunction
            res.status(500).json({message: ex.message})
        }
    }

    // reload: for each line, check line id is in matches ids; if yes create match using regex of match
    // find in files: for each line, check if line has regex; if yes create match using regex

    private getResultsFromFile(filePath, regexMatchFromLine: (line)=>RegExpExecArray | null, matchRegexInfo: (line)=> {isRegex: boolean, flags: string}): FindInFilesResponse {
        let fileText = this.readFile(filePath)
        let fileLines: string[] = fileText.split('\n')
        let tempResults: MatchInfo[] = []
        let lineStartIndex = 0
        fileLines.forEach((line, lineIndex)=>{

            let match = regexMatchFromLine(line)
            /* condition of creating match from line*/
            if(match!=null) {
                let id
                if(this.containsVisiId(line)) {
                    id = this.getIdFromLine(line)
                }
                else {
                    id = this.createId(filePath, lineIndex)
                }
                tempResults.push({
                    value: match[0], 
                    indexInLine: match.index, 
                    lineStartIndex: lineStartIndex,
                    line: line, lineNumber: lineIndex, 
                    id: id, 
                    isRegex: matchRegexInfo(line).isRegex,
                    flags: matchRegexInfo(line).flags
                })
            }
            lineStartIndex+=line.length+1
        })
        if (tempResults.length) {
            let fileName = filePath.substring(this.mainPath.length)
            return {file: fileName, content: fileText, matches: tempResults}
        } else return null
    }

    private convertPatternToRexp(pattern, flags): RegExp {
        return new RegExp(pattern, flags)
    }

    private getMatches(data, regex: RegExp) {
        return data.match(regex)
    }

    private createId(filePath, lineNumber): string {
        return md5(filePath + lineNumber + new Date().getMilliseconds)
    }

    private getIdFromLine(line: string) {
        return line.substring(line.indexOf(VISI_PREFIX)+VISI_PREFIX.length, line.indexOf(VISI_SUFFIX))
    }

    private containsVisiId(line): boolean {
        return line.indexOf(VISI_PREFIX)!==-1
    }

    private addVisiIdToLine(line, id): string {
        return line + VISI_PREFIX + id + VISI_SUFFIX
    }
}

export default new App().express
