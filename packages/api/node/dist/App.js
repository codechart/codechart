"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
class App {
    constructor() {
        this.Path = require('path');
        this.fs = require('fs');
        this.mainPath = 'C:\\xagon\\app\\xagon-ui\\src\\app';
        this.allFiles = {};
        this.express = express();
        this.express.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', "*");
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.header('Access-Control-Allow-Headers', "*");
            res.header('Access-Control-Allow-Credentials', true);
            if (req.method === 'OPTIONS') {
                res.end();
                return;
            }
            next();
        });
        this.mountRoutes();
    }
    mountRoutes() {
        let bodyParser = require('body-parser');
        const router = express.Router();
        router.use(bodyParser.urlencoded({ limit: '3000kb', extended: true }));
        router.use(bodyParser.json({ limit: '3000kb' }));
        this.mainPath = "C:\\xagon\\app\\xagon-ui\\src";
        router.post('/find', (req, res) => {
            let body = req.body;
            this.findInFiles(res, body.pattern, body.flags, this.mainPath, body.path, body.fileExtensions);
        });
        this.express.use('/', router);
        this.loadAllFiles();
        console.log('finished loaing library');
    }
    loadAllFiles() {
        let readFile = (filePath) => {
            return this.fs.readFileSync(filePath, { encoding: "UTF8" }).replace(/\r\n/g, '\n');
        };
        try {
            let processDir = (dir) => {
                if (!this.fs.statSync(dir).isDirectory()) {
                    this.allFiles[this.Path.join(dir)] = readFile(dir);
                    return;
                }
                let files = this.fs.readdirSync(dir);
                files.forEach((file) => {
                    let currentFile = this.Path.join(dir, file);
                    if (this.fs.statSync(currentFile).isDirectory()) {
                        processDir(this.Path.join(dir, file));
                    }
                    else {
                        this.allFiles[this.Path.join(dir, file)] = readFile(currentFile);
                    }
                });
                return;
            };
            processDir(this.mainPath);
        }
        catch (ex) {
            console.log(ex);
        }
    }
    findInFiles(res, pattern, flags, mainPath, path, fileExtensions) {
        let results = [];
        let regex = this.convertPatternToRexp(pattern, flags);
        console.log('regex', regex);
        try {
            if (path !== '') {
                results.push(this.getResultsFromFile(this.Path.join(mainPath, path), regex));
            }
            else {
                Object.keys(this.allFiles).forEach(filePath => {
                    if (filePath.match(new RegExp(fileExtensions)) === null)
                        return;
                    let fileResults = this.getResultsFromFile(filePath, regex);
                    console.log('search  in', filePath);
                    if (fileResults !== null) {
                        console.log('found in', filePath);
                        results.push(fileResults);
                    }
                });
            }
            res.json(results);
        }
        catch (ex) {
            console.log(ex.message);
            res.status(500).json({ message: ex.message });
        }
    }
    getResultsFromFile(filePath, regex) {
        let data = this.allFiles[filePath];
        let tempResults = [];
        for (let match = regex.exec(data); match != null; match = regex.exec(data)) {
            let line = data.substring(data.lastIndexOf('\n', match.index) + 1, data.indexOf('\n', match.index));
            let lineNumber = data.substring(0, match.index).split('\n').length;
            tempResults.push({ value: match[0], index: match.index, line: line, lineNumber: lineNumber });
        }
        if (tempResults.length) {
            let fileName = filePath.substring(this.mainPath.length);
            return { file: fileName, content: data, matches: tempResults };
        }
        else
            return null;
    }
    convertPatternToRexp(pattern, flags) {
        return new RegExp(pattern, flags);
    }
    getMatches(data, regex) {
        return data.match(regex);
    }
}
exports.default = new App().express;
//# sourceMappingURL=App.js.map