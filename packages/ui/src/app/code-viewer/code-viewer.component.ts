import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AppComponent, CurrentFile } from '../app.component';
import { AceEditorComponent } from 'ng2-ace-editor';
import { Ace } from 'ace-builds';
import { Utils } from '../chart/Utils';
import { AttributesKey, ChartUtils } from '../chart/chart.utils';
import {Color} from 'vis';
import { IdeConnect } from '../IDE/IdeConnect'

export interface AceSelectionRange {
  start: { row, column },
  end: { row, column }
}
export interface ChangeTextEvent {
  delta: Ace.Delta,
  text: string
}

declare var ace: any;
var Range = ace.require('ace/range').Range

@Component({
  selector: 'code-viewer',
  templateUrl: './code-viewer.component.html',
  styleUrls: ['./code-viewer.component.scss']
})
export class CodeViewerComponent implements OnInit {
  ideConnect: IdeConnect;

  public sessionInfos: { [key: string]: { folds: any[] } } = {}
  _fileData: CurrentFile = null;
  public fileDisplayInfo: { folder, file, color } = null
  public aceEditor: Ace.Editor;
  lastAddedMarker = null;
  _fontSize = 15;


  matchMarkers: number[] = []
  showEditor: boolean = false;


  @ViewChild('aceEditor') public editor: AceEditorComponent;

  @Output() public selectionChange = new EventEmitter<Ace.Selection>();
  @Output() public fontSizeChanged = new EventEmitter<number>();
  @Output() public textChangedEvent = new EventEmitter<ChangeTextEvent>();

  @Input() showTopBar: boolean = true;
  @Input() appComponent: AppComponent
  @Input() set fileData(fileData: CurrentFile) {
    let editor = this.editor.getEditor()
    let session = editor.getSession()
    if (!fileData) {
      this._fileData = null;
      session.setValue('No file selected, so nothing to display. Select a node on the chart to the right.....');
      editor.setReadOnly(true)
      return
    }

    editor.setReadOnly(false)
    if (this.fileData) {
      this.sessionInfos[this.fileData.name] = { folds: this.editor.getEditor().getSession().getAllFolds() }
    }
    this._fileData = Utils.deepCopy(fileData);
    session.setValue(this.fileData.content)
    //


    if (this.lastAddedMarker) {
      this.aceEditor.getSession().removeMarker(this.lastAddedMarker);
    }

    setTimeout(() => {
      let sessionInfo = this.sessionInfos[this.fileData.name]
      if (sessionInfo) {
        this.editor.getEditor().getSession().addFolds(sessionInfo.folds)
      }

      this.setMode()
    }, 200);
    this.fileDisplayInfo = {
      folder: this._fileData.isCustom ? '' : this._fileData.name.replace(/^.*[\\\/]/, ''),
      file: this._fileData.isCustom ? this._fileData.name : this._fileData.name.replace(/\w+\..*/, ''),
      color: (this.fileData.node && (this.fileData.node.color as Color).background) ? (this.fileData.node.color as Color).background: 'white'
    }

  }
  @Input() set fontSize(fontSize) {
    this._fontSize = fontSize;
  }

  @HostListener("keyup", ["$event"])
  @HostListener("keydown", ["$event"])
  @HostListener("keypress", ["$event"])


  onClick(event: any): void {
    event.stopPropagation();
  }

  get fontSize() {
    return this._fontSize;
  }
  get fileData() {
    return this._fileData;
  }

  constructor() {
    window['globalCode'] = this
  }

  setMode() {
    if(!this.fileData) return
    if (this.fileData.name && (!this.fileData.name.split('.').length || this.fileData.name.split('.').length === 1)) {
      this.editor.setMode("markdown")
      return
    }
    let split = this.fileData.name.split('.');
    let suffix = split[split.length - 1];
    let languages = new Map<string, string>([["ts", "typescript"], ["js", "javascript"], ["java", "java"], ["md", "markdown"], ["scala", "scala"], ["py", "python"],
      ["c", "c_cpp"], ["cpp", "c_cpp"], ["json", "json"], ["scala", "scala"], ["html", "html"], ["scss", "css"], ["css", "css"], ["ino", "c_cpp"], ["xml", "xml"],
      ["md", "markdown"]
    ])
    let selectedLanguage = languages.get(suffix) ? languages.get(suffix): languages.get("text")
    console.log(selectedLanguage)
    this.editor.setMode(selectedLanguage)
  }

  ngOnInit() {

    this.ideConnect = this.appComponent.ideConnect

    this.aceEditor = this.editor.getEditor();
    // this.editor.setTheme('tomorrow_night_bright');
    this.editor.setTheme('chrome');
    this.aceEditor.setAnimatedScroll(true);
    this.aceEditor.getSelection().on('changeCursor', (a, b, c) => {
      let selection = this.aceEditor.getSelection()
      if (selection.getAnchor().row == 0 && selection.getAnchor().column == 0) return
      this.selectionChange.emit(this.aceEditor.getSelection());
    });

    this.aceEditor.setFontSize(this.fontSize as any);
    this.setMode();
   this.aceEditor.setOption('foldStyle', 'markbeginend');
    this.aceEditor.setOption('scrollPastEnd', true);
    this.aceEditor.on('blur', (event) => { this.blurEvent(event) })
    this.aceEditor.on('focus', (event) => { this.focusEvent(event) })
    this.aceEditor.on("change", (event) => { this.changeText(event) })
  }

  changeText(event) {
    this.textChangedEvent.emit({delta: event, text: this.aceEditor.session.getValue()})
  }

  increaseFileContentFont() {
    this.changeFileContentFonSize(2);
  }

  decreaseFileContentFont() {
    this.changeFileContentFonSize(-2);
  }

  changeFileContentFonSize(howMuch: number) {
    this.fontSize = this.fontSize + howMuch;
    this.fontSizeChanged.emit(this.fontSize);
    this.aceEditor.setFontSize(this.fontSize as any);
  }

  blurEvent(event) {
    // console.log('blur event', event)
  }

  focusEvent(event) {
    // console.log('focus event', event)
  }

  public scrollToLine(lineNumber, scrollIfCurrentlyVisible = false) {
    lineNumber = parseInt(lineNumber+'')
    if(this.ideConnect.getIsInIde()) {
      this.ideConnect.output_goToLineInIde(lineNumber)
    }
    // if(lineNumber > this.aceEditor.getFirstVisibleRow() && lineNumber < this.aceEditor.getLastVisibleRow()) return
    this.aceEditor.scrollToLine(lineNumber, true, false, () => {
    });
  }

  public markLinesSelected(startRowNumber, endRowNumber) {

    let range = new Range(0, 0, 0, 0)
    this.setRangeForStartEndLines(range, startRowNumber, endRowNumber);
    if (this.lastAddedMarker) {
      this.aceEditor.getSession().removeMarker(this.lastAddedMarker);
    }
    this.lastAddedMarker = this.aceEditor.getSession().addMarker(range, 'marker', 'fullLine');
  }

  setRangeForStartEndLines(range: Ace.Range, startRowNumber, endRowNumber): Ace.Range {
    if (!startRowNumber) {
      console.log('no start line number')
      return
    }
    range.setStart(startRowNumber, 0);
    if (!endRowNumber || endRowNumber===startRowNumber) {
      range.setEnd(startRowNumber, 1);
    } else {
      range.setEnd(endRowNumber, 0);
    }
    return range
  }

  public markMatchesInFile(matches: { startRowNumber, endRowNumber }[]) {
    var Range = ace.require('ace/range').Range
    this.matchMarkers.forEach(i => {
      this.aceEditor.getSession().removeMarker(i)
    })
    this.matchMarkers = []
    matches.forEach(i => {
      let range = new Range(0, 0, 0, 0)
      this.setRangeForStartEndLines(range, i.startRowNumber, i.endRowNumber)
      let addedMarker = this.aceEditor.getSession().addMarker(range, 'matchMarker', 'fullLine');
      this.matchMarkers.push(addedMarker)
    })
  }

  saveFile() {
    this.appComponent.saveLoad.saveToCode([{ name: this.appComponent.currentFile.name, content: this.aceEditor.session.getValue() }])
  }
}
