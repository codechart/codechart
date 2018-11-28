import * as express from 'express'
import { Config } from './config';
let md5 = require('md5');
const VISI_PREFIX = "Visi id: "

class App {
    public Path = require('path');
    public fs = require('fs');

    public express

    public congifFile: Config = JSON.parse(this.fs.readFileSync('config.json'))
    public mainPath
    public allowedFileExtensions: string[]
    public allFiles = {}

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
            let body = req.body
            this.findInFiles(res, body.pattern, body.flags, this.mainPath, body.path, body.fileExtensions, body.isRegex)
        })
        this.express.use('/', router)

        this.loadAllFiles()
        console.log('finished loaing library')
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


    private loadAllFiles() {
        console.log('start loading files')
        let readFileToAllMap = (fullFilePath) => {
            this.allFiles[fullFilePath] = this.readFile(fullFilePath)
        }
        try {
            this.processDir(this.mainPath, readFileToAllMap)
            console.log(this.allFiles)
        }
        catch(ex) {
            console.log(ex)
        }
    }

    private findInFiles(res: express.Response, pattern, flags, mainPath, path, fileExtensions, isRegex) {
        let results = []
        if(!isRegex) {
            pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        }
        let regex = this.convertPatternToRexp(pattern, flags)
        console.log('regex', regex)
        try {
            if(path!=='') {
                results.push(this.getResultsFromFile(this.Path.join(mainPath, path), regex))
            }
            else {
                Object.keys(this.allFiles).forEach(filePath => {
                    if (filePath.match(new RegExp(fileExtensions)) === null) return
                    let fileResults = this.getResultsFromFile(filePath, regex)
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

    private getResultsFromFile(filePath, regex): any {
        let fileText = this.allFiles[filePath]
        let fileLines: string[] = fileText.split('\n')
        let tempResults = []
        let lineStartIndex = 0
        fileLines.forEach((line, lineIndex)=>{
            let match = regex.exec(line)
            if(match!=null) {
                let visiIdIndex = line.lastIndexOf(VISI_PREFIX)
                let id
                if(visiIdIndex!==-1) 
                    id = line.substring(visiIdIndex+VISI_PREFIX.length, line.length)
                else 
                    id = this.createId(filePath, lineIndex)
                tempResults.push({value: match[0], index: match.index+lineStartIndex, line: line, lineNumber: lineIndex, id: id})
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
}

export default new App().express
