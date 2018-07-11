import {AppComponent, FindInFilesResponse} from "../app.component";

export class SearchActions {
  private app: AppComponent;
  constructor(app: AppComponent) {
    this.app = app
  }

  public searchSelectedFile() {
    let path = this.app.selectedNode.d.type === 'file' ? this.app.selectedNode.id : this.app.selectedNode.d.ofFile
    this.doSearch(Object.assign(this.app.searchJson, {path: path}))
  }

  public contentSearch() {
    let content = this.app.getNodeContent(this.app.selectedNode)
    let contentText = content.content
    let results: Array<KeyLines.Link | KeyLines.Node> = []
    let regex = new RegExp(this.app.searchJson.pattern, this.app.searchJson.flags)
    for (let match = regex.exec(contentText); match != null; match = regex.exec(contentText)) {
      let line = contentText.substring(contentText.lastIndexOf('\n', match.index) + 1, contentText.indexOf('\n', match.index))
      let indexInFileContent = match.index + content.startIndex
      let lineNumber = this.app.currentFile.content.substring(0, indexInFileContent).split('\n').length
      results = results.concat(this.app.vlaActions.createMatchNode({
          value: match[0],
          index: indexInFileContent,
          line: line,
          lineNumber: lineNumber
        },
        this.app.selectedNode.d.ofFile
      ))
    }
    this.app.vlaActions.addNodesToChart(results)

  }

  public totalSearch() {
    this.doSearch(Object.assign(this.app.searchJson, {path: ''}))
  }

  public doSearch(searchJson) {
    console.log('search: ', searchJson)
    this.app.http.post('http://localhost:2900/find', searchJson).subscribe((response: FindInFilesResponse[]) => this.app.loadDataFromFindInFiles(response))
  }

}
