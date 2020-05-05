import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CurrentFile} from '../app.component';
import {AceEditorComponent} from 'ng2-ace-editor';
import {Ace} from 'ace-builds';

export interface AceSelectionRange {
  start: { row, column },
  end: { row, column }
}

declare var ace:any;
var Range = ace.require('ace/range').Range

@Component({
  selector: 'code-viewer',
  templateUrl: './code-viewer.component.html',
  styleUrls: ['./code-viewer.component.css']
})
export class CodeViewerComponent implements OnInit {
  @Input() showTopBar: boolean = true;
  _fileData: CurrentFile = null;
  @Input() set fileData(fileData: CurrentFile) {
    this._fileData = fileData;
    this.setMode();
  }

  get fileData() {
    return this._fileData;
  }

  @ViewChild('aceEditor') public editor: AceEditorComponent;
  @Output() public selectionChange = new EventEmitter<Ace.Selection>();
  @Output() public fontSizeChanged = new EventEmitter<number>();

  _fontSize = 20;
  @Input() set fontSize(fontSize) {
    this._fontSize = fontSize;
  }

  get fontSize() {
    return this._fontSize;
  }

  public aceEditor: Ace.Editor;
  lastAddedMarker = null;

  matchMarkers: number[] = []

  constructor() {
    window['globalCode'] = this
  }

  setMode() {
    if (!this.fileData) return;
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
      case 'css':
        this.editor.setMode('css');
        break;
      case 'scss':
        this.editor.setMode('scss');
        break;
    }
  }

  ngOnInit() {
    this.editor.setTheme('chrome');
    this.aceEditor = this.editor.getEditor();
    this.aceEditor.setAnimatedScroll(true);
    this.aceEditor.getSelection().on('changeSelection', () => {
      this.selectionChange.emit(this.aceEditor.getSelection());
    });

    this.aceEditor.setFontSize(this.fontSize as any);
    this.setMode();
    this.aceEditor.setOption('foldStyle', 'markbeginend');
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

  public scrollToLine(lineNumber) {
    this.aceEditor.scrollToLine(lineNumber, true, true, () => {
    });
  }

  public markLinesSelected(startRowNumber, endRowNumber) {

    let range = new Range(0,0,0,0)
    this.setRangeForStartEndLines(range, startRowNumber, endRowNumber);
    if (this.lastAddedMarker) {
      this.aceEditor.getSession().removeMarker(this.lastAddedMarker);
    }
    this.lastAddedMarker = this.aceEditor.getSession().addMarker(range, 'marker', 'fullLine');
  }

  setRangeForStartEndLines(range: Ace.Range, startRowNumber, endRowNumber): Ace.Range {
    if(!startRowNumber) {
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
    this.matchMarkers.forEach(i=>{
      this.aceEditor.getSession().removeMarker(i)
    })
    this.matchMarkers = []
    matches.forEach(i=>{
      let range = new Range(0,0,0,0)
      this.setRangeForStartEndLines(range, i.startRowNumber, i.endRowNumber)
      let addedMarker = this.aceEditor.getSession().addMarker(range, 'matchMarker', 'fullLine');
      this.matchMarkers.push(addedMarker)
    })
  }
}
