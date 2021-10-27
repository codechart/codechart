import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AppComponent, CurrentFile } from '../app.component';
import { AceEditorComponent } from 'ng2-ace-editor';
import { Ace } from 'ace-builds';
import { Utils } from '../chart/Utils';
import { AttributesKey, ChartUtils } from '../chart/chart.utils';
import {Color} from 'vis';

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
      session.setValue('---------------NO FILE SELECTED---------------------------');
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

    setTimeout(() => {
      let sessionInfo = this.sessionInfos[this.fileData.name]
      if (sessionInfo) {
        this.editor.getEditor().getSession().addFolds(sessionInfo.folds)
      }

      this.setMode()
    }, 200);
    this.fileDisplayInfo = {
      folder: this._fileData.name ? this._fileData.name.replace(/^.*[\\\/]/, '') : '',
      file: this._fileData.name ? this._fileData.name.replace(/\w+\..*/, '') : '',
      color: (this.fileData.node && (this.fileData.node.color as Color).border) ? (this.fileData.node.color as Color).border: 'black'
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
    if (!(this.fileData && this.fileData.name && this.fileData.name.split('.').length)) return
    let split = this.fileData.name.split('.');
    if (split.length === 1) return;
    let suffix = split[split.length - 1];
    switch (suffix) {
      case 'ts':
        this.editor.setMode('typescript');
        break;
      case 'js':
        this.editor.setMode('javascript');
        break;
      case 'java':
        this.editor.setMode('java');
        break;
      case 'scala':
        this.editor.setMode('scala');
        break;
      case 'py':
        this.editor.setMode('python');
        break;
      case 'cpp':
        this.editor.setMode('c_cpp');
        break;
      case 'c':
        this.editor.setMode('c_cpp');
        break;
      case 'json':
        this.editor.setMode('json');
        break;
      case 'html':
        this.editor.setMode('html');
        break;
      case 'xml':
        this.editor.setMode('html');
        break;
      case 'css':
        this.editor.setMode('css');
        break;
      case 'scss':
        this.editor.setMode('scss');
        break;
      case 'ino':
        this.editor.setMode('c_cpp');
        break;
      default: this.editor.setMode('txt');

    }
  }

  ngOnInit() {

    // this.editor.setTheme('chrome');
    this.aceEditor = this.editor.getEditor();
    this.editor.setTheme('ambiance');
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
    this.changeFileContentFonSize(5);
  }

  decreaseFileContentFont() {
    this.changeFileContentFonSize(-5);
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
    if(lineNumber > this.aceEditor.getFirstVisibleRow() && lineNumber < this.aceEditor.getLastVisibleRow()) return
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
    if (!endRowNumber) {
      range.setEnd(startRowNumber, this.aceEditor.getSession().getLine(startRowNumber).length);
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
