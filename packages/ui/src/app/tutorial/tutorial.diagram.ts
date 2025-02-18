export const TUTORIAL_DIAGRAM = {
    "info": {
        "projectList": [
            "https://github.com/niliproject123/nili-full.git"
        ],
        "story": "Nili Demo",
        "description": "receive press from guitar -> display on HTML",
        "labels": "\\nili_arduino.ino ; \\nili_arduino.ino ; send pressed\nstring to Arduino ; \\BtReadData.java ; \\BtReadData.java ; endless loop ; \\BtReadData.java ; read\nfrom bt ; \\BtReadData.java ; send to \nother thread ; \\Commands.java ; \\Operator.java ; \\Commands.java ; \\Operator.java ; def ; route to receive \npress action ; \\Operator.java ; \\Operator.java ; receivedPressFromUser ; \\Operator.java ; \\Operator.java ; process correct/incorrect press\ninto string sent to bt ; routes events to actions ; \\Operator.java ; change state\n ; \\Operator.java ; \\Operator.java ; handle state change ; handling states ; \\Operator.java ; send press to \nbt and webview ; \\Operator.java ; \\Operator.java ; \\WebAppInterface.java ; \\WebAppInterface.java ; \\Operator.java ; \\WebAppInterface.java ; \\WebAppInterface.java ; \\WebAppInterface.java ; \\android.js ; \\android.js ; \\WebAppInterface.java ; web thread handle\nof messages ; \\Operator.java ; operator thread\nhandle messages ; \\android.js ; \\neckActions.js ; \\neckActions.js ; \\neckActions.js ; \\main.js ; \\main.js ; creation of fret elements\non html ; Arduino ; Android Java ; Android Webview ; info ; JavaScript/HTML ; \\Operator.java ; START ; FINISH ; send fret \nstate ; according \nto state",
        "fileNames": "\\nili_arduino.ino ; \\Commands.java ; \\BtReadData.java ; \\Operator.java ; \\WebAppInterface.java ; \\android.js ; \\neckActions.js ; \\main.js",
        "projects": "https://github.com/niliproject123/nili-full.git",
        "createdAt": "2024-06-09T14:10:21.579Z",
        "updatedAt": "2025-02-07T07:21:23.002Z",
        "id": "SJzmtIiSeWagRktZ"
    },
    "nodes": [
        {
            "id": "+Arduino+nili*arduino.ino#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "align": "left",
                "color": "#2D2D2D",
                "size": 40
            },
            "chosen": {},
            "borderWidth": 0,
            "color": {
                "border": "#1687A7",
                "background": "#ffffff"
            },
            "size": 100,
            "scaling": {
                "label": true
            },
            "label": "\\nili_arduino.ino",
            "d": {
                "fileContent": "// tasks :\r\n//* adapt to 12 colummns\r\n//* change output string to 01r02g\r\n\r\n///changed the line\r\n\r\n  int btStatusCharIndex = 0;\r\n  char c;\r\n  String strPreviousPressed = \"\";\r\n  String strCurrentPressed = \"\";\r\n  int statusCharArray_length = 0;\r\n  char statusCharArray[100] = {};\r\n  char btCharArray[100] = {};\r\n  char   switchBuffer[100] = {};\r\n  int led[] =          {12, 24, 20, 21, 25, 2, 3, 4, 5, 6, 7, 8, 9};   \r\n  int push_button[]  = {12, 26, 22, 23, 27, 2, 3, 4, 5, 6, 7, 8, 9};\r\n  int red[] = {6, 28, 30, 32, 34, 36, 38};\r\n  int green[] = {6, 43, 45, 47, 49, 51, 53};\r\n  int blue[] = {6, 29, 31, 33, 35, 37, 39};\r\n  int rowsSwitch[] = {6, 42, 44, 46, 48, 50, 52};\r\n\r\n\r\nvoid testLeds_white() {\r\n  for(int i=1; i<=red[0]; i++) {\r\n    digitalWrite (red[i], LOW);\r\n    digitalWrite (green[i], LOW);\r\n    digitalWrite (blue[i], LOW);\r\n  }\r\n    \r\n  for(int colIndex = 1; colIndex<=led[0]; colIndex++) {\r\n    digitalWrite (led[colIndex] , HIGH);\r\n  }\r\n\r\n\r\n  delay(600);\r\n\r\n  for(int colIndex = 1; colIndex<=led[0]; colIndex++) {\r\n    digitalWrite (led[colIndex] , LOW);\r\n  }\r\n\r\n  for(int i=1; i<=red[0]; i++) {\r\n    digitalWrite (red[i], HIGH);\r\n    digitalWrite (green[i], HIGH);\r\n    digitalWrite (blue[i], HIGH);\r\n  }\r\n}\r\n\r\n\r\nvoid testLeds() {\r\n  /*\r\n  char   buffer[100];\r\n  int colors[3][7];\r\n  for(int i=1; i<=red[0]; i++) {\r\n    colors[0][i] = red[i];\r\n    colors[1][i] = blue[i];\r\n    colors[2][i] = green[i];\r\n  }\r\n\r\n  for(int color=0; color<3; color++) {\r\n    int totalColCount = 4;\r\n\r\n    for(int row=1; row<=7; row++) {\r\n      digitalWrite (colors[color][row], LOW);\r\n    }\r\n\r\n    int colIndex = 1;\r\n    for(; colIndex<=totalColCount; colIndex++) {\r\n//      sprintf(buffer,\"col: %d\",led[colIndex-1]);\r\n//      Serial.println(buffer);\r\n      digitalWrite (led[colIndex] , HIGH);\r\n      delay(70);\r\n      digitalWrite (led[colIndex] , LOW);\r\n    }\r\n\r\n    for(int row=1; row<=7; row++) {\r\n      digitalWrite (colors[color][row], HIGH);\r\n    }\r\n  }\r\n  */\r\n}\r\n\r\n\r\n// the setup function runs once when you press reset or power the board\r\nvoid setup() {\r\n\r\n  // initialize digital pin LED_BUILTIN as an output.\r\n  // type reqd_pullup for switch\r\n\r\n  \r\n  //__ROWS__\r\n  // color green\r\n   for (int i=1; i<=green[0]; i++)\r\n  {\r\n     pinMode (  green[i] ,OUTPUT);\r\n     digitalWrite ( green[i] ,HIGH);\r\n  }\r\n  \r\n  // color red\r\n   for (int i=1; i<=red[0]; i++)\r\n  {\r\n     pinMode (  red[i] ,OUTPUT);\r\n     digitalWrite (  red[i] ,HIGH);\r\n  }\r\n  \r\n  // color blue\r\n  for (int i=1; i<=blue[0]; i++)\r\n  {\r\n     pinMode (  blue[i] ,OUTPUT);\r\n     digitalWrite (  blue[i] , HIGH);\r\n  }\r\n\r\n  //rows switch\r\n   for (int i=1; i<=rowsSwitch[0]; i++)\r\n  {\r\n     pinMode (  rowsSwitch[i] ,OUTPUT);\r\n     digitalWrite (  rowsSwitch[i] ,LOW);\r\n  }\r\n  \r\n  // __COLUMNS__\r\n  for (int i=1; i<=led[0]; i++)\r\n  {\r\n     pinMode ( led[i] , OUTPUT);\r\n     //digitalWrite (led[i], HIGH);\r\n  }\r\n\r\n  for (int i=1; i<=push_button[0]; i++)\r\n  {\r\n     pinMode ( push_button[i] , INPUT_PULLUP);\r\n  }\r\n  //pinMode ( push_button[2] , INPUT);\r\n\r\n  \r\n  \r\n  \r\n  ///////////////// INITIALIZE BLUETOOTH AND PRINT OUT /////////////////\r\n  Serial.begin (115200); // print to system out\r\n  Serial1.begin (9600);// bluetooth, pins 19,18\r\n\r\n  testLeds_white(); \r\n}\r\n\r\n// the loop function runs over and over again forever\r\nvoid loop() {\r\n\r\n  boolean isNewRead = false;\r\n  // while bluetooth is avalable\r\n  while (Serial1.available()) {\r\n    isNewRead = true;\r\n    c =  Serial1.read();\r\n    if(c=='#') {\r\n      statusCharArray_length = btStatusCharIndex;\r\n      for(int copyIndex=0; copyIndex<statusCharArray_length; copyIndex++) {\r\n        statusCharArray[copyIndex] = btCharArray[copyIndex];\r\n      }\r\n      btStatusCharIndex = 0;\r\n      continue;\r\n    }\r\n    btCharArray[btStatusCharIndex] = c;\r\n    btStatusCharIndex++;\r\n  }\r\n\r\n  if(isNewRead) {\r\n    Serial.println(statusCharArray);\r\n    isNewRead = false;\r\n  }\r\n\r\n  //////////////////////////////////// TURN ON LEDS ////////////////////////////////////\r\n \r\n  for (int i=1; i<=led[0]; i++) {pinMode (  led[i] ,OUTPUT);} ////////////////////////////////////////// because led column 2 is phisycally connected to switch column 2 (cause johsnon is manyac\r\n  for (int i=1; i<=push_button[0]; i++) {pinMode (  push_button[i] ,OUTPUT);} ////////////////////////////////////////// because led column 2 is phisycally connected to switch column 2 (cause johsnon is manyac\r\n\r\n  //turn on leds\r\n  int n;\r\n  for (int i=0; i<statusCharArray_length; i++) {\r\n    char color = statusCharArray[i];\r\n    //Serial.println(color);\r\n    i++;\r\n    if (48 <= statusCharArray[i] && statusCharArray[i] <= 57 ) // if statusCharArray[i] is digit\r\n    {\r\n      if (48 <= statusCharArray[i+1] && statusCharArray[i+1] <= 57 )\r\n      {\r\n        n = (statusCharArray[i]-48)*10 + (statusCharArray[i+1]-48);\r\n        i++;\r\n      } \r\n      else {n = (statusCharArray[i]-48);}\r\n    }\r\n    \r\n    int column;\r\n    int row;\r\n    if(n%6 == 0)\r\n    {\r\n      row = 6;\r\n      column = n/6;\r\n    }\r\n    else\r\n    {\r\n      row = n%6;\r\n      column = floor(n/6) +1;\r\n    }\r\n    \r\n    // do something different depending on the color value:\r\n    switch (color) {\r\n      case 'r':    // red\r\n        digitalWrite (  led[column] , HIGH);\r\n        digitalWrite (  red[row], LOW);\r\n        delay (1);\r\n        digitalWrite (  led[column] , LOW);\r\n        digitalWrite (  red[row], HIGH);\r\n        break;\r\n      case 'g':    // green\r\n        digitalWrite (  led[column] , HIGH);\r\n        digitalWrite (  green[row], LOW);\r\n        delay (1);\r\n        digitalWrite (  led[column] , LOW);\r\n        digitalWrite (  green[row], HIGH);\r\n        break;\r\n      case 'b':    // blue\r\n        digitalWrite (  led[column] , HIGH);\r\n        digitalWrite (  blue[row], LOW);\r\n        delay (1);\r\n        digitalWrite (  led[column] , LOW);\r\n        digitalWrite (  blue[row], HIGH);\r\n        break;\r\n      case 'w':    // white\r\n        digitalWrite (  led[column] , HIGH);\r\n        digitalWrite (  red[row], LOW);\r\n        digitalWrite (  green[row], LOW);\r\n        digitalWrite (  blue[row], LOW);\r\n        delay (1);\r\n        digitalWrite (  led[column] , LOW);\r\n        digitalWrite (  red[row], HIGH);\r\n        digitalWrite (  green[row], HIGH);\r\n        digitalWrite (  blue[row], HIGH);\r\n        break;\r\n      case 'p':    // white\r\n        digitalWrite (  led[column] , HIGH);\r\n        digitalWrite (  red[row], LOW);\r\n        digitalWrite (  blue[row], LOW);\r\n        delay (1);\r\n        digitalWrite (  led[column] , LOW);\r\n        digitalWrite (  red[row], HIGH);\r\n        digitalWrite (  blue[row], HIGH);\r\n        break;\r\n      case 'y':    // white\r\n        digitalWrite (  led[column] , HIGH);\r\n        digitalWrite (  red[row], LOW);\r\n        digitalWrite (  green[row], LOW);\r\n        delay (1);\r\n        digitalWrite (  led[column] , LOW);\r\n        digitalWrite (  red[row], HIGH);\r\n        digitalWrite (  green[row], HIGH);\r\n        break;\r\n      case 'a':    // test\r\n        digitalWrite (  led[column] , HIGH);\r\n        digitalWrite (  green[row], LOW);\r\n        digitalWrite (  blue[row], LOW);\r\n        delay (1);\r\n        digitalWrite (  led[column] , LOW);\r\n        digitalWrite (  green[row], HIGH);\r\n        digitalWrite (  blue[row], HIGH);\r\n        break;\r\n    }\r\n     \r\n  }\r\n   \r\n  //////////////////////////// CHECK PRESSED BUTTONS //////////////////////////////////\r\n  // now check which button is pressed. pushbutton's logic is inverted. It goes\r\n  // HIGH when it's open, and LOW when it's pressed.\r\n  \r\n  //turn rows switches 'off'.\r\n  for (int i=1; i<=rowsSwitch[0]; i++) {pinMode (  rowsSwitch[i] ,INPUT);}\r\n  for (int i=1; i<=led[0]; i++) {pinMode (  led[i] ,INPUT);} ////////////////////////////////////////// because led column 2 is phisycally connected to switch column 2 (cause johsnon is manyac\r\n  for (int i=1; i<=push_button[0]; i++) {pinMode (  push_button[i] ,INPUT_PULLUP);} ////////////////////////////////////////// because led column 2 is phisycally connected to switch column 2 (cause johsnon is manyac\r\n  strCurrentPressed = \"\";\r\n  \r\n  //runs on rows switches\r\n  for (int rowIndex=1; rowIndex<=rowsSwitch[0]; rowIndex++)\r\n  {    \r\n    pinMode ( rowsSwitch[rowIndex], OUTPUT);\r\n    digitalWrite ( rowsSwitch[rowIndex],LOW);\r\n    int numColumns = push_button[0];\r\n    //runs on columns.\r\n    for (int colIndex=1; colIndex<=numColumns; colIndex++)\r\n    {\r\n      //add [rowIndex,colIndex] to output string to app\r\n      if(digitalRead(push_button[colIndex])==LOW) { \r\n          int pos = (colIndex-1)*6 + rowIndex;\r\n          sprintf(switchBuffer,\"s%02d\",pos);\r\n          strCurrentPressed = strCurrentPressed + (String(switchBuffer));\r\n      }\r\n    }\r\n    pinMode ( rowsSwitch[rowIndex], INPUT);\r\n  }\r\n\r\n  \r\n  // after we have current pressed buttons we compare strCurrentPressed with strPreviousPressed\r\n  // and send strCurrentPressed to App only if there is a change from previous\r\n  if(strCurrentPressed != strPreviousPressed)\r\n  {\r\n    // send strCurrentPressed to app.\r\n    Serial1.print(strCurrentPressed + '#');\r\n    Serial.println(strCurrentPressed + '#');\r\n    strPreviousPressed = strCurrentPressed; \r\n  }\r\n}\r\n  \r\n    \r\n\r\n\r\n",
                "fileId": {
                    "path": "\\Arduino\\nili_arduino.ino",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "x": 0,
            "y": 0
        },
        {
            "id": "filename_\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\nili_arduino.ino",
            "x": 0,
            "y": 100,
            "color": {
                "background": "#1687A7",
                "border": "#000000"
            }
        },
        {
            "id": "\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "line": "    Serial.println(strCurrentPressed + '#');",
                "value": "Serial",
                "lineNumber": 301,
                "endLineNumber": null,
                "indexInLine": 4,
                "id": "\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 302,
                "ofFile": {
                    "path": "\\Arduino\\nili_arduino.ino",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "wasEdited": true
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "send pressed\nstring to Arduino",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 50,
            "y": 150
        },
        {
            "id": "+Android+app+src+main+java+com+nili+utilities+BtReadData.java#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "align": "left",
                "color": "#2D2D2D",
                "size": 40
            },
            "chosen": {},
            "borderWidth": 0,
            "color": {
                "border": "#E99497",
                "background": "#ffffff"
            },
            "size": 100,
            "scaling": {
                "label": true
            },
            "label": "\\BtReadData.java",
            "d": {
                "fileContent": "package com.nili.utilities;\r\n\r\nimport java.io.InputStream;\r\n\r\nimport android.os.Message;\r\n\r\nimport com.nili.globals.Commands;\r\nimport com.nili.main.MainActivity;\r\nimport com.nili.operator.Operator;\r\n\r\npublic class BtReadData extends Thread\r\n{\r\n\r\n\tprivate Operator operator = null;\r\n\tpublic InputStream inputStream = null;\r\n\tprivate MainActivity mainActivity = null;\r\n\tprivate boolean receivedFirst = false;\r\n    public char[] receivedChars = new char[24];\r\n\r\n\t// a new section of code that was \r\n\t// added after the diagram was made\r\n\r\n\tpublic BtReadData() {\r\n\t}\r\n\t\r\n    public void set(MainActivity mainActivity, InputStream inputStream, Operator operator) {\r\n\t\tthis.inputStream = inputStream;\r\n\t\tthis.mainActivity = mainActivity;\r\n    \tthis.operator = operator;\r\n    }\r\n    \r\n    @Override\r\n    public void run() {\r\n\t\tThread.currentThread().setName(\"Read Data Thread\");\r\n\t\t/// new code\r\n\r\n\t\twhile(true) {\r\n            if (this.inputStream != null) {\r\n                try {\r\n                \t// bug in arduino sends every message twice\r\n                \tif(!receivedFirst)\r\n                \t{\r\n                \t\treceivedChars = new char[24];\r\n                    \tint receivedChar = this.inputStream.read();\r\n                    \tif(Character.toChars(receivedChar)[0]!='+') \r\n                    \t\tcontinue;\r\n                        for(int i=0; i<24; i++)\r\n                        {\r\n                        \treceivedChars[i] = (char)this.inputStream.read();\r\n                        }\r\n                        this.inputStream.read();\r\n\r\n                        if(BtReadData.this.operator == null) return; // changed line\r\n                        \r\n\t\t\t\t\t\tMessage operatorMessage = new Message();\r\n                        operatorMessage.obj = new String(receivedChars);\r\n                        operatorMessage.arg1 = Commands.Operator.receivePress; // changed line\r\n                \t\toperator.mHandler.sendMessage(operatorMessage);\r\n                        \r\n                        //operator.receivedPressFromUser(new String(receivedChars));\r\n                \t\treceivedFirst = true;\r\n                \t}\r\n                \telse\r\n                \t\treceivedFirst = false;\r\n                } \r\n                catch (Exception e) { //if an error appear, we return to the Main activity\r\n                \tthis.mainActivity.runOnUiThread(new Runnable() {@Override public void run()\r\n                    {\r\n\t                    BtReadData.this.mainActivity.showToast(\"error reading data from bluetooth\");\r\n                    }});\r\n                    break;\r\n                }\r\n            }\r\n        }\r\n    }\r\n\tpublic void setOperator(Operator operator)  {\r\n\t\tthis.operator = operator;\r\n\t}\r\n}",
                "fileId": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "x": 500,
            "y": -200
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#36#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\BtReadData.java",
            "x": 300,
            "y": -150,
            "color": {
                "background": "#E99497",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#36#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "line": "\t\twhile(true) {",
                "value": "while",
                "lineNumber": 36,
                "endLineNumber": null,
                "indexInLine": 2,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#36#null",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 73,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "wasEdited": true
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "endless loop",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 350,
            "y": -100
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\BtReadData.java",
            "x": 300,
            "y": 100,
            "color": {
                "background": "#E99497",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "line": "                        this.inputStream.read();",
                "value": "inputStream",
                "lineNumber": 50,
                "endLineNumber": null,
                "indexInLine": 29,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 51,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "wasEdited": true
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "read\nfrom bt",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 350,
            "y": 150
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\BtReadData.java",
            "x": 550,
            "y": 100,
            "color": {
                "background": "#E99497",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "receivePress",
                "line": "                        operatorMessage.arg1 = Commands.Operator.receivePress; // changed line",
                "lineNumber": 56,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": null,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "wasEdited": true
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "send to \nother thread",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 600,
            "y": 150,
            "hidden": false
        },
        {
            "id": "+Android+app+src+main+java+com+nili+globals+Commands.java#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "align": "left",
                "color": "#2D2D2D",
                "size": 40
            },
            "chosen": {},
            "borderWidth": 0,
            "color": {
                "border": "#F3C583",
                "background": "#ffffff"
            },
            "size": 100,
            "scaling": {
                "label": true
            },
            "label": "\\Commands.java",
            "d": {
                "fileContent": "package com.nili.globals;\r\n\r\nfinal public class Commands \r\n{\r\n\tpublic final class WebApp  {\r\n\t\tpublic static final int eventPressedCorrect = 1;\r\n\t\tpublic static final int eventLiftFingers = 2;\r\n\t\tpublic static final int sendStringToJs = 4;\r\n\t\tpublic static final int eventForward = 5;\r\n\t\tpublic static final int eventBackward = 6;\r\n\t\tpublic static final int restart = 7;\r\n\t}\r\n\t\r\n\tpublic final class Operator  {\r\n\t\tpublic static final int receivePress = 1;\r\n\t\tpublic static final int addChord = 2;\r\n\t\tpublic static final int finishedAddingChords = 3;\r\n\t\tpublic static final int startAddingChords = 4;\r\n\t\tpublic static final int eventForward = 5;\r\n\t\tpublic static final int eventBackward = 6;\r\n\t\tpublic static final int strummedCorrect = 7;\r\n\t\tpublic static final int restart = 8;\r\n\t\tpublic static final int chordChangeTik = 9;\r\n\t}\r\n\t\r\n\tpublic final class ConnectionManager {\r\n\t\tpublic static final int sendToBt = 1;\r\n\t\tpublic static final int connectToBt = 2;\r\n\t\tpublic static final int lightsOn = 3;\r\n\t\tpublic static final int lightsOff = 4;\r\n\t}\r\n\r\n\tpublic final class Strumming {\r\n\t\tpublic static final int startStrumming = 1;\r\n\t\tpublic static final int stopStrumming = 2;\r\n\t}\r\n}\r\n",
                "fileId": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\globals\\Commands.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "x": 250,
            "hidden": true,
            "y": 50
        },
        {
            "id": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "align": "left",
                "color": "#2D2D2D",
                "size": 40
            },
            "chosen": {},
            "borderWidth": 0,
            "color": {
                "border": "#F4C7AB",
                "background": "#ffffff"
            },
            "size": 100,
            "scaling": {
                "label": true
            },
            "label": "\\Operator.java",
            "d": {
                "fileContent": "package com.nili.operator;\r\n\r\nimport android.content.Context;\r\nimport android.os.Handler;\r\nimport android.os.Looper;\r\nimport android.os.Message;\r\nimport android.os.PowerManager;\r\nimport android.util.Log;\r\n\r\nimport com.nili.globals.Commands;\r\nimport com.nili.globals.Globals;\r\n\r\nimport com.nili.main.MainActivity;\r\nimport com.nili.main.WebAppInterface;\r\nimport com.nili.utilities.ConnectionManager;\r\nimport com.nili.utilities.Listener;\r\nimport com.nili.utilities.Strumming;\r\nimport com.nili.utilities.Timer;\r\n\r\nimport java.util.Date;\r\n\r\n\r\npublic class Operator extends Thread\r\n{\r\n\tprivate MainActivity mainActivity;\r\n\tprivate int userState = State.WAITING_FOR_CORRECT_PRESS;\r\n\tprivate WebAppInterface \twebInterface;\r\n\tstatic public \tHandler\t\t\t\tmHandler;\r\n\r\n\tprivate Chords\t\t\t\tchords = new Chords();\r\n\tprivate Listener\t\t\tlistener = new Listener();\r\n\r\n\tprivate BtOperations btOperations;\r\n\tprivate Timer timer;\r\n\r\n\tpublic boolean tiksAvailable() {\r\n\t\treturn chords.isTiksAvailable();\r\n\t}\r\n\r\n\tprivate class UserProcessedPress {\r\n\t\tpublic String btPositions;\r\n\t\tpublic String jsPositions;\r\n\t\tpublic int pressedCorrect = 0;\r\n\t}\r\n\r\n\tstatic public class State {\r\n\t\tstatic public int WAITING_FOR_CORRECT_PRESS = 0;\r\n\t\tstatic public int WAITING_FOR_USER_LIFT = 1;\r\n\t\tstatic public int WAITING_FOR_CORRECT_STRUMM = 2;\r\n\t\tstatic public int NEW_CHORD = 3;\r\n\t\tstatic public int STRUMMED_CORRECT = 4;\r\n\t\tpublic static int PRESSED_CORRECT = 5;\r\n\t\tpublic static int USER_LIFT_FINGERS = 6;\r\n\t\tpublic static int FINISHED_SONG = 7;\r\n\t\tpublic static int CHORD_END_TIK = 8;\r\n\t}\r\n\r\n\r\n\tpublic void run() {\r\n\t\tThread.currentThread().setName(\"Operator\");\r\n\r\n\t\tLooper.prepare();\r\n\r\n\t\tmHandler = new Handler() {\r\n\t\t\tpublic void handleMessage(Message message)\r\n\t\t\t{\r\n\t\t\ttry\r\n\t\t\t\t{\r\n\t\t\t\t\tif(message.arg1== Commands.Operator.receivePress)\r\n\t\t\t\t\t\treceivedPressFromUser((String) message.obj);\r\n\t\t\t\t\telse if(message.arg1==Commands.Operator.addChord)\r\n\t\t\t\t\t\taddChordToChordList((String)message.obj);\r\n\t\t\t\t\telse if(message.arg1==Commands.Operator.finishedAddingChords)\r\n\t\t\t\t\t\tfinishedAddingChords();\r\n\t\t\t\t\telse if(message.arg1==Commands.Operator.startAddingChords)\r\n\t\t\t\t\t\tstartAddingChords();\r\n\t\t\t\t\telse if(message.arg1==Commands.Operator.eventForward)\r\n\t\t\t\t\t\teventForward();\r\n\t\t\t\t\telse if(message.arg1==Commands.Operator.eventBackward)\r\n\t\t\t\t\t\teventBackward();\r\n\t\t\t\t\telse if(message.arg1==Commands.Operator.strummedCorrect)\r\n\t\t\t\t\t\teventStrummedCorrect();\r\n\t\t\t\t\telse if(message.arg1==Commands.Operator.restart)\r\n\t\t\t\t\t\teventRestart();\r\n\t\t\t\t\telse if(message.arg1==Commands.Operator.chordChangeTik)\r\n\t\t\t\t\t\teventForward();\r\n\t\t\t\t}\r\n\t\t\t\tcatch (Exception ex)\r\n\t\t\t\t{\r\n\t\t\t\t\tex.printStackTrace();\r\n\t\t\t\t}\r\n\t\t\t}\r\n\t\t};\r\n\r\n\t\tLooper.loop();\r\n\t}\r\n\r\n\tpublic void eventChordTik() { handleStateChange(State.CHORD_END_TIK); }\r\n\r\n\tprivate void eventStrummedCorrect() {\r\n\t\thandleStateChange(State.STRUMMED_CORRECT);\r\n\t}\r\n\r\n\tprivate void eventRestart() {\r\n\t\tchords.setToFirstChord();\r\n\t\thandleStateChange(State.NEW_CHORD);\r\n\t\tmainActivity.setUiModeAndPause(mainActivity.getUiMode());\r\n\r\n\t\t// temp\r\n\t\tcreateFakePress();\r\n\t}\r\n\r\n\tprivate void eventForward() {\r\n\t\tif(!chords.goToNextChord())\r\n\t\t{\r\n\t\t\thandleStateChange(State.FINISHED_SONG);\r\n\t\t\treturn;\r\n\t\t}\r\n\r\n\t\tMessage message = new Message();\r\n\t\tmessage.arg1 = Commands.WebApp.eventForward;\r\n\t\tthis.webInterface.mHandler.sendMessage(message);\r\n\r\n\t\thandleStateChange(State.NEW_CHORD);\r\n\t}\r\n\r\n\tprivate void eventBackward() {\r\n\t\tif(!chords.goToPreviousChord()) return;\r\n\r\n\t\tMessage message = new Message();\r\n\t\tmessage.arg1 = Commands.WebApp.eventBackward;\r\n\t\tthis.webInterface.mHandler.sendMessage(message);\r\n\r\n\t\thandleStateChange(State.NEW_CHORD);\r\n\t}\r\n\r\n\tprivate void startAddingChords() {\r\n\t\tchords.reset();\r\n\t\ttimer.setActive(true);\r\n\t}\r\n\r\n\tpublic void finishedAddingChords() {\r\n\t\tif(chords.getListSize()==0)\r\n\t\t{\r\n\t\t\tbtOperations.sendStringToBt(\"000000000000000000000000\");\r\n\t\t\treturn;\r\n\t\t}\r\n\t\teventRestart();\r\n\t}\r\n\r\n\t// run by javascript\r\n\tpublic void addChordToChordList(String chordJsonString) throws Exception {\r\n\t\tchords.addChordToList(chordJsonString);\r\n\t}\r\n\r\n\tpublic void receivedPressFromUser(String receivedSwitchString) {\r\n\t\tif(chords.getListSize()==0)\r\n\t\t{\r\n\t\t\tthis.sendStringToBoth(receivedSwitchString);\r\n\t\t\treturn;\r\n\t\t}\r\n\r\n\t\tUserProcessedPress userProcessedPress;\r\n\t\t// Timed mode, don`t show pressed wrong\r\n\t\tif(mainActivity.getUiMode()==Globals.UImode.TIMED)\r\n\t\t\tuserProcessedPress = processUserPress(receivedSwitchString, false);\r\n\t\telse\r\n\t\t\tuserProcessedPress = processUserPress(receivedSwitchString, true);\r\n\r\n\r\n\t\t// waiting for user to lift fingers, user lifted fingers, auto mode\r\n\t\tif(userState == State.WAITING_FOR_USER_LIFT)\r\n\t\t{\r\n\t\t\t// timed mode\r\n\t\t\tif(mainActivity.getUiMode() == Globals.UImode.TIMED)\r\n\t\t\t\treturn;\r\n\t\t\t// auto/manual mode\r\n\t\t\t//if(receivedSwitchString.equalsIgnoreCase(Globals.emptyString))\r\n\t\t\tif(receivedSwitchString.replace(\"0\", \"\").length()<=1)\r\n\t\t\t\thandleStateChange(State.USER_LIFT_FINGERS);\r\n\t\t}\r\n\t\t// waiting for user to press full chord correct\r\n\t\telse if(userState ==State.WAITING_FOR_CORRECT_PRESS\r\n\t\t\t&&\r\n\t\t\tuserProcessedPress.pressedCorrect == chords.current().positionCount)\r\n\t\t{\r\n\t\t\thandleStateChange(State.PRESSED_CORRECT);\r\n\t\t}\r\n\t\t// send processed string to both\r\n\t\telse\r\n\t\t{\r\n\t\t\tbtOperations.sendStringToBt(userProcessedPress.btPositions);\r\n\t\t\tthis.sendStringToJs(userProcessedPress.jsPositions);\r\n\t\t}\r\n\t}\r\n\r\n\tpublic void handleStateChange(int eventType) {\r\n\t\t// new chord\r\n\t\tif (eventType == State.NEW_CHORD)\r\n\t\t{\r\n\t\t\tLog.d(\"state changed\", \"NEW CHORD\");\r\n\t\t\tSystem.out.println(\"state changed: \" +  \"NEW CHORD\");\r\n\r\n\t\t\tbtOperations.sendStringToBt(Globals.emptyString);\r\n\t\t\tbtOperations.stopStrumming();\r\n\t\t\tbtOperations.sendStringToBt(chords.current().positionString);\r\n\t\t\ttimer.setCounter(chords.getCounter());\r\n\r\n\r\n\t\t\t// set open string or not\r\n\t\t\tif(chords.isChordEmptyString(chords.current()))\r\n\t\t\t{\r\n\t\t\t\tuserState = State.WAITING_FOR_CORRECT_STRUMM;\r\n\t\t\t\tlistener.setCurrentString(chords.current().emptyStringList.get(0));\r\n\t\t\t}\r\n\t\t\telse\r\n\t\t\t\tuserState = State.WAITING_FOR_CORRECT_PRESS;\r\n\t\t}\r\n\t\t// finished song\r\n\t\telse if(eventType == State.FINISHED_SONG)\r\n\t\t{\r\n\t\t\teventRestart();\r\n\r\n\t\t\tMessage message = new Message();\r\n\t\t\tmessage.arg1 = Commands.WebApp.restart;\r\n\t\t\tthis.webInterface.mHandler.sendMessage(message);\r\n\t\t}\r\n\t\t// was waiting for user to press correct, and user pressed correct\r\n\t\telse if(userState == State.WAITING_FOR_CORRECT_PRESS\r\n\t\t\t\t&&\r\n\t\t\t\teventType == State.PRESSED_CORRECT)\r\n\t\t{\r\n\t\t\tSystem.out.println(\"state changed: \" + \"PRESSED CORRECT\");\r\n\t\t\tsendPressedCorrectToJs();\r\n\t\t\tbtOperations.sendStringToBt(Globals.emptyString);\r\n\r\n\t\t\tif(mainActivity.getUiMode()==Globals.UImode.TIMED)\r\n\t\t\t\tbtOperations.sendStringToBt(Globals.strummingPositionString(chords.current().topString));\r\n\t\t\telse if(mainActivity.getUiMode()==Globals.UImode.AUTO)\r\n\t\t\t\tif(chords.current().positionCount==1)\r\n\t\t\t\t\tbtOperations.blinkNeck(100, chords.next().positionString);\r\n\t\t\t\telse\r\n\t\t\t\t\tbtOperations.sendStringToBt(Globals.strummingPositionString(chords.current().topString));\r\n\t\t\telse if(mainActivity.getUiMode()==Globals.UImode.MANUAL)\r\n\t\t\t\tif(chords.current().positionCount==1)\r\n\t\t\t\t\tbtOperations.blinkNeck(100, Globals.emptyString);\r\n\t\t\t\telse\r\n\t\t\t\t\tbtOperations.startStrumming(chords.current());\r\n\r\n\t\t\tuserState = State.WAITING_FOR_USER_LIFT;\r\n\t\t}\r\n\t\t// waiting for strummed correct, and strummed correct\r\n\t\telse if(userState == State.WAITING_FOR_CORRECT_STRUMM && eventType == State.STRUMMED_CORRECT)\r\n\t\t{\r\n\t\t\tif(mainActivity.getUiMode()==Globals.UImode.TIMED)\r\n\t\t\t\tbtOperations.sendStringToBt(Globals.emptyString);\r\n\t\t\telse if(mainActivity.getUiMode()==Globals.UImode.AUTO)\r\n\t\t\t\teventForward();\r\n\t\t\telse if(mainActivity.getUiMode()==Globals.UImode.MANUAL)\r\n\t\t\t\tbtOperations.blinkNeck(100, Globals.emptyString);\r\n\t\t}\r\n\t\t// waiting for user to lift fingers, and user lifted fingers\r\n\t\telse if(userState == State.WAITING_FOR_USER_LIFT && eventType == State.USER_LIFT_FINGERS)\r\n\t\t{\r\n\t\t\tSystem.out.println(\"state changed: \" +  \"USER LIFTED FINGERS\");\r\n\t\t\tif(mainActivity.getUiMode()==Globals.UImode.AUTO)\r\n\t\t\t\teventForward();\r\n\t\t\telse if(mainActivity.getUiMode()==Globals.UImode.MANUAL || mainActivity.getUiMode()==Globals.UImode.TIMED)\r\n\t\t\t{\r\n\t\t\t\thandleStateChange(State.NEW_CHORD);\r\n\t\t\t\tsendEventLiftFingersToJs();\r\n\t\t\t}\r\n\t\t}\r\n\t}\r\n\r\n\tpublic UserProcessedPress processUserPress(String receivedSwitchString, boolean showWrong) {\r\n\t\tSystem.out.println(\"RECEIVE: \" + receivedSwitchString);\r\n\r\n\r\n\t\tString currentChordString = chords.current().positionString;\r\n\t\tUserProcessedPress userPress = new UserProcessedPress();\r\n\t\tuserPress.btPositions = currentChordString;\r\n\t\tuserPress.jsPositions = currentChordString;\r\n\r\n\t\tfor(int i=0; i<receivedSwitchString.length(); i++)\r\n\t\t{\r\n\t\t\t// pressed right. set char to 0\r\n\t\t\tif(receivedSwitchString.charAt(i)=='1' && currentChordString.charAt(i)=='1')\r\n\t\t\t{\r\n\t\t\t\tuserPress.btPositions = userPress.btPositions.substring(0,i) + \"0\" + userPress.btPositions.substring(i+1);\r\n\t\t\t\tuserPress.jsPositions = userPress.jsPositions.substring(0,i) + \"c\" + userPress.jsPositions.substring(i+1);\r\n\t\t\t\tuserPress.pressedCorrect++;\r\n\t\t\t}\r\n\r\n\t\t\t// pressed wrong. set char to blinkRate\r\n\t\t\tif(showWrong && receivedSwitchString.charAt(i)=='1' && currentChordString.charAt(i)=='0')\r\n\t\t\t{\r\n\t\t\t\tuserPress.btPositions = userPress.btPositions.substring(0,i) + Globals.BLINK_CHAR_RATE + userPress.btPositions.substring(i+1);\r\n\t\t\t\tuserPress.jsPositions = userPress.jsPositions.substring(0,i) + \"i\" + userPress.jsPositions.substring(i+1);\r\n\t\t\t}\r\n\t\t}\r\n\t\treturn userPress;\r\n\t}\r\n\r\n\tpublic void createFakePress() {\r\n\t\tif(1==1) return;\r\n    \ttry {\r\n\t\t\t// G chord: 000000100001010000000000\r\n\t\t\treceivedPressFromUser(\"000000100001010000000000\");\r\n\t\t\tThread.sleep(50);\r\n\t\t\treceivedPressFromUser(\"000000000000000000000000\");\r\n\t\t\tLog.d(\"a\", \"a\");\r\n\t\t} catch (Exception e) {\r\n\t\t\t// TODO Auto-generated catch block\r\n\t\t\te.printStackTrace();\r\n\t\t}\r\n\t}\r\n\r\n\tprivate void sendPressedCorrectToJs() {\r\n\t\tMessage message = new Message();\r\n\t\tmessage.arg1 = Commands.WebApp.eventPressedCorrect;\r\n\t\tthis.webInterface.mHandler.sendMessage(message);\r\n\t}\r\n\r\n\tprivate void sendEventLiftFingersToJs() {\r\n\t\tMessage message = new Message();\r\n\t\tmessage.arg1 = Commands.WebApp.eventLiftFingers;\r\n\t\tthis.webInterface.mHandler.sendMessage(message);\r\n\t}\r\n\r\n\tprivate void sendStringToJs(String positionString) {\r\n\t\tMessage message = new Message();\r\n\t\tmessage.arg1 = Commands.WebApp.sendStringToJs;\r\n\t\tmessage.obj = positionString;\r\n\t\tthis.webInterface.mHandler.sendMessage(message);\r\n\t}\r\n\t\r\n\tpublic void sendStringToBoth(String positionString) {\r\n\t\tbtOperations.sendStringToBt(positionString);\r\n\t\tsendStringToJs(positionString);\r\n\t}\r\n\t\r\n\tpublic Operator() {\r\n\t}\r\n\t\r\n\tpublic void set(ConnectionManager connectionManager, WebAppInterface webInterface, Strumming strumming, Timer timer, MainActivity mainActivity) {\r\n\t\tthis.webInterface = webInterface;\r\n\t\tthis.mainActivity = mainActivity;\r\n\t\tthis.timer = timer;\r\n\t\tthis.btOperations = new BtOperations(strumming, connectionManager);\r\n\t\tlistener.set(this);\r\n\t}\r\n}",
                "fileId": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "isGrouped": true,
                "wasEdited": true
            },
            "x": 1250,
            "hidden": false,
            "y": -100
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\globals\\Commands.java#https://github.com/niliproject123/nili-full.git#14#undefined",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\Commands.java",
            "x": 700,
            "y": -150,
            "color": {
                "background": "#F3C583",
                "border": "#000000"
            }
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\Operator.java",
            "x": 1000,
            "y": 100,
            "color": {
                "background": "#F4C7AB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\globals\\Commands.java#https://github.com/niliproject123/nili-full.git#14#undefined",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "receivePress",
                "line": "\t\tpublic static final int receivePress = 1;",
                "lineNumber": 14,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\globals\\Commands.java#https://github.com/niliproject123/nili-full.git#14#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": null,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\globals\\Commands.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "wasEdited": true
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "def",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 750,
            "y": -100
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "receivePress",
                "line": "\t\t\t\t\tif(message.arg1== Commands.Operator.receivePress)",
                "lineNumber": 68,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 69,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "isGrouped": true,
                "wasEdited": true
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "route to receive \npress action",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 1050,
            "y": 150
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\Operator.java",
            "x": 1200,
            "y": 100,
            "color": {
                "background": "#F4C7AB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "receivedPressFromUser",
                "line": "\t\t\t\t\t\treceivedPressFromUser((String) message.obj);",
                "lineNumber": 69,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 70,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 1250,
            "y": 150,
            "hidden": false
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#155#undefined",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\Operator.java",
            "x": 1400,
            "y": 100,
            "color": {
                "background": "#F4C7AB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#155#undefined",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "receivedPressFromUser",
                "line": "\tpublic void receivedPressFromUser(String receivedSwitchString) {",
                "lineNumber": 155,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#155#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 194,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "wasEdited": true
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "receivedPressFromUser",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 1450,
            "y": 150
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#165#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true,
                "wasEdited": true
            },
            "label": "\\Operator.java",
            "x": 1600,
            "y": 100,
            "color": {
                "background": "#F4C7AB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#165#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "processUserPress",
                "line": "\t\t\tuserProcessedPress = processUserPress(receivedSwitchString, false);",
                "lineNumber": 165,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#165#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 166,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "wasEdited": true
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 1650,
            "y": 150,
            "hidden": false
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#275#undefined",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true,
                "wasEdited": true
            },
            "label": "\\Operator.java",
            "x": 1800,
            "y": -150,
            "color": {
                "background": "#F4C7AB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#275#undefined",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "processUserPress",
                "line": "\tpublic UserProcessedPress processUserPress(String receivedSwitchString, boolean showWrong) {",
                "lineNumber": 275,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#275#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 302,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "wasEdited": true
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "process correct/incorrect press\ninto string sent to bt",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 1850,
            "y": -100
        },
        {
            "id": "remark_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git997",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "size": 17
            },
            "chosen": {},
            "borderWidth": 1,
            "color": {
                "border": "#FFA100",
                "background": "white"
            },
            "d": {
                "type": "remark"
            },
            "image": "/assets/nodes/chat-bubble.png",
            "imagePadding": 20,
            "shapeProperties": {
                "borderDashes": [
                    12,
                    7
                ],
                "borderRadius": 6
            },
            "label": "routes events to actions",
            "x": 1250,
            "y": -300
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\Operator.java",
            "x": 1800,
            "y": 100,
            "color": {
                "background": "#F4C7AB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "line": "\t\tif(userState == State.WAITING_FOR_USER_LIFT)",
                "value": "userState",
                "lineNumber": 171,
                "endLineNumber": null,
                "indexInLine": 5,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 180,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "wasEdited": true
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "change state\n",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 1850,
            "y": 150
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#179#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\Operator.java",
            "x": 2000,
            "y": 100,
            "color": {
                "background": "#F4C7AB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#179#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "line": "\t\t\t\thandleStateChange(State.USER_LIFT_FINGERS);",
                "value": "handleStateChange",
                "lineNumber": 179,
                "endLineNumber": null,
                "indexInLine": 4,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#179#null",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 180,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 2050,
            "y": 150
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\Operator.java",
            "x": 2200,
            "y": 100,
            "color": {
                "background": "#F4C7AB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "handleStateChange",
                "line": "\tpublic void handleStateChange(int eventType) {",
                "lineNumber": 196,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 273,
                "selectedByUser": true,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "wasEdited": true
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "handle state change",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 2250,
            "y": 150
        },
        {
            "id": "ToDo*1692188331382#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "circularImage",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 0,
            "color": {
                "border": "#B2B8A3",
                "background": "#ffffff"
            },
            "size": 40,
            "scaling": {
                "label": true
            },
            "label": "handling states",
            "d": {
                "fileContent": "This is where changing states happen\naccording to state and event, an action is made\n",
                "fileId": {
                    "path": "ToDo_1692188331382",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "isCustom": true,
                "type": "toDoNode",
                "wasEdited": true
            },
            "x": 2250,
            "image": "/assets/nodes/info.png",
            "imagePadding": 20,
            "shapeProperties": {
                "useBorderWithImage": true
            },
            "y": -200
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#158#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\Operator.java",
            "x": 1800,
            "y": 300,
            "color": {
                "background": "#F4C7AB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#158#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "sendStringToBoth",
                "line": "\t\t\tthis.sendStringToBoth(receivedSwitchString);",
                "lineNumber": 158,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#158#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 159,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "wasEdited": true
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "send press to \nbt and webview",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 1850,
            "y": 350,
            "hidden": false
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#337#undefined",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\Operator.java",
            "x": 1800,
            "y": 500,
            "color": {
                "background": "#F4C7AB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#337#undefined",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "sendStringToBoth",
                "line": "\tpublic void sendStringToBoth(String positionString) {",
                "lineNumber": 337,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#337#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 340,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 1850,
            "y": 550
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#339#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\Operator.java",
            "x": 2000,
            "y": 500,
            "color": {
                "background": "#F4C7AB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#339#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "sendStringToJs",
                "line": "\t\tsendStringToJs(positionString);",
                "lineNumber": 339,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#339#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 340,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 2050,
            "y": 550,
            "hidden": false
        },
        {
            "id": "+Android+app+src+main+java+com+nili+main+WebAppInterface.java#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "align": "left",
                "color": "#2D2D2D",
                "size": 40
            },
            "chosen": {},
            "borderWidth": 0,
            "color": {
                "border": "#B2B8A3",
                "background": "#ffffff"
            },
            "size": 100,
            "scaling": {
                "label": true
            },
            "label": "\\WebAppInterface.java",
            "d": {
                "fileContent": "package com.nili.main;\r\n\r\nimport android.os.Handler;\r\nimport android.os.Looper;\r\nimport android.os.Message;\r\nimport android.webkit.JavascriptInterface;\r\n\r\nimport com.nili.globals.Commands;\r\nimport com.nili.operator.Operator;\r\n\r\npublic class WebAppInterface extends Thread\r\n{\r\n\tprivate MainActivity\tmainActivity;\r\n\tprivate Operator operator;\r\n\tprivate String \t\t\tjsMessage;\r\n\tpublic static Handler\tmHandler;\r\n\r\n\tpublic void run() {\r\n\t\tThread.currentThread().setName(\"WebAppInterface\");\r\n\t\tLooper.prepare();\r\n\t\t\r\n\t\tmHandler = new Handler() {\r\n\t\t\tpublic void handleMessage(Message message)\r\n\t\t\t{\r\n\t\t\t\tif(message.arg1 == Commands.WebApp.eventLiftFingers)\r\n\t\t\t\t\teventLiftFingers();\r\n\t\t\t\telse if(message.arg1 == Commands.WebApp.eventPressedCorrect)\r\n\t\t\t\t\tpressedCorrect_Animation();\r\n\t\t\t\telse if(message.arg1 == Commands.WebApp.sendStringToJs)\r\n\t\t\t\t\tsendPositionStringToJs(addJsDelimeters((String)message.obj));\r\n\t\t\t\telse if(message.arg1 == Commands.WebApp.eventForward)\r\n\t\t\t\t\teventForward();\r\n\t\t\t\telse if(message.arg1 == Commands.WebApp.eventBackward)\r\n\t\t\t\t\teventBackward();\r\n\t\t\t\telse if(message.arg1 == Commands.WebApp.restart)\r\n\t\t\t\t\teventRestart();\r\n\t\t\t}\r\n\t\t};\r\n\t\t\r\n\t\tLooper.loop();\r\n\t}\r\n\t\r\n\tpublic void set(MainActivity mainActivity, Operator operator) {\r\n\t\tthis.mainActivity = mainActivity;\r\n\t\tthis.operator = operator;\r\n\t}\r\n\t\r\n\tpublic WebAppInterface() {\r\n\t}\r\n\r\n\tpublic void sendPositionStringToJs(String positionString) {\r\n\t\tsendMessageToJs(String.format(\"receivePositionStringFromAndroid(%s);\", positionString));\r\n\t}\r\n\r\n\tpublic void eventLiftFingers()  {\r\n\t\tsendMessageToJs(\"eventLiftFingers()\");\r\n\t}\r\n\r\n\r\n\tpublic void pressedCorrect_Animation() {\r\n\t\tsendMessageToJs(\"eventPressedCorrect()\");\r\n\t}\r\n\r\n\tpublic void eventRestart() {\r\n\t\tsendMessageToJs(\"eventStop()\");\r\n\t}\r\n\r\n\t//// ZVI ////\r\n\t// this function executes functions in JS\r\n\tpublic void sendMessageToJs(String message) {\r\n\t\tthis.jsMessage = message;\r\n\t\t// This will run jsMessage in JS. i.e:\r\n\t\t// if jsMessage = \"eventStop(true)\", eventStop with argument true will be executed in JS\r\n\t\t// This has to be executed in the UI thread\r\n\t\tthis.mainActivity.runOnUiThread(new Runnable() \r\n\t\t{\r\n\t\t\t@Override\r\n\t\t\tpublic void run() \r\n\t\t\t{\r\n\t\t\t\tWebAppInterface.this.mainActivity.webView.evaluateJavascript(WebAppInterface.this.jsMessage, null);\r\n\t\t\t}\r\n\t\t});\r\n\t}\r\n\r\n\r\n\t//// ZVI ////\r\n\t// this function is executed when JS calls Android.messageFromJS(\"some string\");\r\n\t@JavascriptInterface\r\n\tpublic void messageFromJs(String chordString)  {\r\n\t\tMessage operatorMessage = new Message();\r\n\t\tif(chordString.equalsIgnoreCase(\"start_chords\"))\r\n\t\t{\r\n\t\t\tthis.mainActivity.runOnUiThread(new Runnable() {\r\n\t\t\t\t@Override\r\n\t\t\t\tpublic void run() {\r\n\t\t\t\t\tWebAppInterface.this.mainActivity.setLoadingStarted();\r\n\t\t\t\t}\r\n\t\t\t});\r\n\t\t\toperatorMessage.arg1 = Commands.Operator.startAddingChords;\r\n\t\t\tthis.operator.mHandler.sendMessage(operatorMessage);\r\n\t\t\treturn;\r\n\t\t}\r\n\r\n\t\telse if(chordString.equalsIgnoreCase(\"end_chords\"))\r\n\r\n\t\t{\r\n\t\t\toperatorMessage.arg1 = Commands.Operator.finishedAddingChords;\r\n\t\t\tthis.operator.mHandler.sendMessage(operatorMessage);\r\n\t\t\tthis.mainActivity.runOnUiThread(new Runnable() {\r\n\t\t\t\t@Override\r\n\t\t\t\tpublic void run() {\r\n\t\t\t\t\tWebAppInterface.this.mainActivity.setLoadingFinished();\r\n\t\t\t\t}\r\n\t\t\t});\r\n\t\t\treturn;\r\n\t\t}\r\n\r\n\t\telse if(chordString.indexOf(\"addChord_\")!=-1)\r\n\r\n\t\t{\r\n\t\t\toperatorMessage.arg1 = Commands.Operator.addChord;\r\n\t\t\toperatorMessage.obj = chordString.split(\"_\")[1];\r\n\t\t}\r\n\r\n\t\t\tthis.operator.mHandler.sendMessage(operatorMessage);\r\n\t\t}\r\n\r\n\t\tprivate String addJsDelimeters(String string) {\r\n\t\treturn \"\\\"\" + string + \"\\\"\";\r\n\t}\r\n\r\n\tprivate void eventForward() {\r\n\t\tsendMessageToJs(\"eventForward();\");\r\n\t}\r\n\t\r\n\tprivate void eventBackward() {\r\n\t\tsendMessageToJs(\"eventBackward();\");\r\n\t}\r\n}\r\n",
                "fileId": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "x": 1750,
            "hidden": true,
            "y": 50
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\WebAppInterface.java",
            "x": 2450,
            "y": 500,
            "color": {
                "background": "#B2B8A3",
                "border": "#000000"
            }
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#330#undefined",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\Operator.java",
            "x": 2150,
            "y": 500,
            "color": {
                "background": "#F4C7AB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "sendStringToJs",
                "line": "\t\t\t\telse if(message.arg1 == Commands.WebApp.sendStringToJs)",
                "lineNumber": 28,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 29,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 2500,
            "y": 550
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#330#undefined",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "sendStringToJs",
                "line": "\tprivate void sendStringToJs(String positionString) {",
                "lineNumber": 330,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#330#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 335,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 2200,
            "y": 550
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#29#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\WebAppInterface.java",
            "x": 2650,
            "y": 500,
            "color": {
                "background": "#B2B8A3",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#29#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "sendPositionStringToJs",
                "line": "\t\t\t\t\tsendPositionStringToJs(addJsDelimeters((String)message.obj));",
                "lineNumber": 29,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#29#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 30,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 2700,
            "y": 550,
            "hidden": false
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#50#undefined",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\WebAppInterface.java",
            "x": 2850,
            "y": 500,
            "color": {
                "background": "#B2B8A3",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#50#undefined",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "sendPositionStringToJs",
                "line": "\tpublic void sendPositionStringToJs(String positionString) {",
                "lineNumber": 50,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#50#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 52,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 2900,
            "y": 550
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#51#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\WebAppInterface.java",
            "x": 3050,
            "y": 500,
            "color": {
                "background": "#B2B8A3",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#51#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "receivePositionStringFromAndroid",
                "line": "\t\tsendMessageToJs(String.format(\"receivePositionStringFromAndroid(%s);\", positionString));",
                "lineNumber": 51,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#51#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 52,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 3100,
            "y": 550,
            "hidden": false
        },
        {
            "id": "+Android+app+src+main+assets+js+android.js#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "align": "left",
                "color": "#2D2D2D",
                "size": 40
            },
            "chosen": {},
            "borderWidth": 0,
            "color": {
                "border": "#CAF7E3",
                "background": "#ffffff"
            },
            "size": 100,
            "scaling": {
                "label": true
            },
            "label": "\\android.js",
            "d": {
                "fileContent": "function eventForward()\r\n{\r\n\tconsole.log(\"eventForward: \");\r\n\tstopStrummingAnimation();\r\n\tmoveToNextChord();\r\n\tdisplayCurrentChord();\r\n}\r\n\r\nfunction eventBackward()\r\n{\r\n\tconsole.log(\"eventBackward: \");\r\n\tstopStrummingAnimation();\r\n\tmoveToPreviousChord();\r\n\tdisplayCurrentChord()\r\n}\r\n\r\nfunction eventStop()\r\n{\r\n\tconsole.log(\"eventStop();\");\r\n\tstopStrummingAnimation();\r\n\tsetCurrentChord(0);\r\n\r\n\tsetChordText();\r\n\tsetLyrics();\r\n\r\n\tsetAllNeckPositionsOff(false);\r\n\tsetFingering(currentChord.positionList);\r\n\tsetNeckPositionListOn(currentChord.positionList);\r\n}\r\n\r\nfunction eventPressedCorrect()\r\n{\r\n\tif(!checkEventIsReal()) return;\r\n\t\r\n\tconsole.log(\"eventPressedCorrect\");\r\n\r\n\tsetAllNeckPositionsOff(true);\r\n\tsetNeckPositionCorrectList(currentChord.positionList);\r\n\r\n\telement_chord.style.color = 'green';\r\n\r\n\tif(isChordTextExplicit(currentChord.text))\r\n\t\tsetStringOn(currentChord.positionList[0][1]);\r\n\telse\r\n\t\tstartStrummingAnimation(100, currentChord.topString);\r\n}\r\n\r\nfunction eventLiftFingers()\r\n{\r\n\tstopStrummingAnimation();\r\n\tdisplayCurrentChord();\r\n}\r\n\r\nfunction sendMessageToAndroid(message)\r\n{\r\n\t////// ZVI /////\r\n\t// this will execute messageFromJs in WebAppInterface object.\r\n\tconsole.log(\"send message to Android: \" + message);\r\n\tif(isAndroid)\r\n\t{\r\n\t\t//noinspection JSUnresolvedVariable,JSUnresolvedFunction\r\n\t\tAndroid.messageFromJs(message);\r\n\t}\r\n}\r\n\r\nfunction receivePositionStringFromAndroid(_positionString)\r\n{\r\n\tconsole.log(\"receivePositionStringFromAndroid: \" + _positionString);\r\n\tvar positionOnList = [];\r\n\tvar positionBlinkList = [];\r\n\tvar positionCorrectList = [];\r\n\tvar positionIncorrectList = [];\r\n\tvar fretIndex, stringIndex;\r\n\tvar positionString = _positionString;\r\n\r\n\tfor(var i=0; i<positionString.length; i++)\r\n\t{\r\n\t\tvar fretIndex =  5 - (1 + Math.floor(i/6));\r\n\t\tvar stringIndex = (6 - i%6);\r\n\t\tvar position = [fretIndex, stringIndex]; \r\n\t\tif(positionString.charAt(i)=='1')\r\n\t\t{\r\n\t\t\tpositionOnList.push(position);\r\n\r\n\t\t}\r\n\t\telse if(positionString.charAt(i)=='c')\r\n\t\t{\r\n\t\t\tpositionCorrectList.push(position);\r\n\r\n\t\t}\r\n\t\telse if(positionString.charAt(i)!='1' && positionString.charAt(i)!='0')\r\n\t\t{\r\n\t\t\t//positionBlinkList.push(position);\r\n\t\t\tpositionIncorrectList.push(position);\r\n\r\n\t\t}\r\n\t}\r\n\r\n\tsetAllNeckPositionsOff(true);\r\n\tsetNeckPositionListOn(positionOnList);\r\n\tsetNeckPositionListCorrect(positionCorrectList);\r\n\tsetNeckPositionListIncorrect(positionIncorrectList);\r\n\t//updateBlinkingList(positionBlinkList);\r\n}\r\n\r\nfunction sendChordToAndroid(chord)\r\n{\r\n\tvar jsonChord = JSON.stringify(chord);\r\n\tsendMessageToAndroid(\"addChord_\"+jsonChord.toString());\r\n}\r\n\r\n",
                "fileId": {
                    "path": "\\Android\\app\\src\\main\\assets\\js\\android.js",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "x": 2800,
            "hidden": true,
            "y": 50
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#65#undefined",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\android.js",
            "x": 3300,
            "y": 500,
            "color": {
                "background": "#CAF7E3",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#65#undefined",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "receivePositionStringFromAndroid",
                "line": "function receivePositionStringFromAndroid(_positionString)",
                "lineNumber": 65,
                "id": "\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#65#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 103,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\assets\\js\\android.js",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 3350,
            "y": 550
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#21#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\WebAppInterface.java",
            "x": 2450,
            "y": 300,
            "color": {
                "background": "#B2B8A3",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#21#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "line": "\t\tmHandler = new Handler() {",
                "value": "Handler",
                "lineNumber": 21,
                "endLineNumber": null,
                "indexInLine": 17,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#21#null",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 37,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 2500,
            "y": 350
        },
        {
            "id": "ToDo*1692189822763#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "circularImage",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 0,
            "color": {
                "border": "#F6DFEB",
                "background": "#ffffff"
            },
            "size": 40,
            "scaling": {
                "label": true
            },
            "label": "web thread handle\nof messages",
            "d": {
                "fileContent": "TODO:",
                "fileId": {
                    "path": "ToDo_1692189822763",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "isCustom": true,
                "type": "toDoNode",
                "wasEdited": true
            },
            "x": 2500,
            "image": "/assets/nodes/info.png",
            "imagePadding": 20,
            "shapeProperties": {
                "useBorderWithImage": true
            },
            "y": -100
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#63#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\Operator.java",
            "x": 1000,
            "y": -100,
            "color": {
                "background": "#F4C7AB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#63#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "line": "\t\tmHandler = new Handler() {",
                "value": "()",
                "lineNumber": 63,
                "endLineNumber": null,
                "indexInLine": 24,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#63#null",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 92,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "wasEdited": true
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "operator thread\nhandle messages",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 1050,
            "y": -50
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#99#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\android.js",
            "x": 3500,
            "y": 500,
            "color": {
                "background": "#CAF7E3",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#99#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "setNeckPositionListOn",
                "line": "\tsetNeckPositionListOn(positionOnList);",
                "lineNumber": 99,
                "id": "\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#99#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 100,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\assets\\js\\android.js",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 3550,
            "y": 550,
            "hidden": false
        },
        {
            "id": "+Android+app+src+main+assets+js+neckActions.js#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "align": "left",
                "color": "#2D2D2D",
                "size": 40
            },
            "chosen": {},
            "borderWidth": 0,
            "color": {
                "border": "#EDEDD0",
                "background": "#ffffff"
            },
            "size": 100,
            "scaling": {
                "label": true
            },
            "label": "\\neckActions.js",
            "d": {
                "fileContent": "function setStringListOn(stringList)\r\n{\r\n\tfor(var i=0; i < stringList.length; i++)\r\n\t\tsetStringOn(stringList[i]);\r\n}\r\n\r\nfunction setStringOn(string)\r\n{\r\n\t//stringElements[string].style.animation = \"vibrate 0.1s linear 0s infinite\";\r\n\tstringElements[TOTAL_NUMBER_OF_STRINGS-string].classList.add(\"strum\");\r\n}\r\n\r\nfunction setStringOff(string)\r\n{\r\n\tstringElements[TOTAL_NUMBER_OF_STRINGS-string-1].classList.remove(\"strum\");\r\n\t//stringElements[i].style.animation = \"\";\r\n}\r\n\r\nfunction setNeckPositionStringOff(string)\r\n{\r\n\tfor(var fret=1; fret<=TOTAL_NUMBER_OF_FRETS; fret++)\r\n\t\tsetNeckPositionOff(fret, string, false)\r\n}\r\n\r\nfunction setNeckPositionStringListOff(stringList)\r\n{\r\n\tfor(var i=0; i<stringList.length; i++)\r\n\t\tsetNeckPositionStringOff(stringList[i]);\r\n}\r\n\r\nfunction setNeckPositionOn(fret, string, leaveFingering)\r\n{\r\n\tif(neckFrets==null) neckFrets = document.getElementsByClassName(\"fret_table\");\r\n\tvar position = neckPositionElementArray[fret-1][6-string]; \r\n\r\n\tposition.style.opacity = \"1\";\r\n\t//position.style.zIndex = 4;\r\n\tif(leaveFingering==false) position.innerHTML = \"\";\r\n}\r\n\r\nfunction setNeckPositionOff(fret, string, leaveFingering)\r\n{\r\n\tif(neckFrets==null) neckFrets = document.getElementsByClassName(\"fret_table\");\r\n\tvar position = neckPositionElementArray[fret-1][6-string];\r\n\tposition.style.opacity = \"0.2\";\r\n\t//position.style.zIndex = 1;\r\n\tif(leaveFingering==false) position.innerHTML = \"\";\r\n\r\n\tneckPositionIncorrectElementArray[fret-1][6-string].style.opacity = '0';\r\n\tneckPositionCorrectElementArray[fret-1][6-string].style.opacity = '0';\r\n\t\r\n}\r\n\r\nfunction setNeckPositionCorrectList(positionList)\r\n{\r\n\tfor(var i=0; i<positionList.length; i++)\r\n\t\tsetNeckPositionCorrect(positionList[i][0], positionList[i][1]);\r\n}\r\n\r\nfunction setNeckPositionCorrect(fret, string)\r\n{\r\n\tvar position = neckPositionCorrectElementArray[fret-1][6-string]; \r\n\tposition.style.opacity = '1';\r\n}\r\n\r\nfunction setNeckPositionIncorrect(fret, string)\r\n{\r\n\tvar position = neckPositionIncorrectElementArray[fret-1][6-string]; \r\n\tposition.style.opacity = '1';\r\n}\r\n\r\nfunction setNeckPositionBlinkOn(fret, string, leaveFingering)\r\n{\r\n\tif(neckFrets==null) neckFrets = document.getElementsByClassName(\"fret_table\");\r\n\tvar position = neckPositionElementArray[fret-1][6-string]; \r\n\r\n\tposition.style.animation = \"blink 0.1s linear 0s infinite\";\r\n\t//position.style.zIndex = 1;\r\n\tif(leaveFingering==false) position.innerHTML = \"\";\r\n\t\r\n}\r\n\r\nfunction setNeckPositionBlinkOff(fret, string, leaveFingering)\r\n{\r\n\tif(neckFrets==null) neckFrets = document.getElementsByClassName(\"fret_table\");\r\n\tvar position = neckPositionElementArray[fret-1][6-string]; \r\n\r\n\tposition.style.animation = \"\";\r\n\t//position.style.zIndex = 1;\r\n\tif(leaveFingering==false) position.innerHTML = \"\";\r\n\t\r\n}\r\n\r\nfunction setAllNeckPositionsOff(leaveFingering)\r\n{\r\n\tif(neckPositions==null) neckPositions = document.getElementsByClassName(\"position_td\");\r\n\tfor(var fret=0; fret<=TOTAL_NUMBER_OF_FRETS; fret++)\r\n\t{\r\n\t\tfor(var string=0; string<TOTAL_NUMBER_OF_STRINGS; string++)\r\n\t\t{\r\n\t\t\t//neckPositionCorrectElementArray[fret][string].style.opacity = '0';\r\n\t\t\tsetNeckPositionOff(fret+1, string+1, leaveFingering);\r\n\t\t}\r\n\t}\r\n}\r\n\r\nfunction setAllNeckPositionsOn(leaveFingering)\r\n{\r\n\tif(neckPositions==null) neckPositions = document.getElementsByClassName(\"position_td\");\r\n\tfor(var fret=0; fret<=TOTAL_NUMBER_OF_FRETS; fret++)\r\n\t{\r\n\t\tfor(var string=0; string<TOTAL_NUMBER_OF_STRINGS; string++)\r\n\t\t{\r\n\t\t\tsetNeckPositionOn(fret+1, string+1, leaveFingering);\r\n\t\t}\r\n\t}\r\n}\r\n\r\nfunction setNeckPositionListOff(positionList)\r\n{\r\n\tfor(var i=0; i<positionList.length; i++)\r\n\t{\r\n\t\tsetNeckPositionOff(positionList[i][0], positionList[i][1])\r\n\t}\r\n}\r\n\r\nfunction setNeckPositionListOn(positionList)\r\n{\r\n\tfor(var i=0; i<positionList.length; i++)\r\n\t{\r\n\t\tif(positionList[i][0]==\"string\")\r\n\t\t\tstringElements[\r\n\t\t\t\tTOTAL_NUMBER_OF_STRINGS - positionList[i][1]\r\n\t\t\t].classList.add(\"strum\");\r\n\t\telse\r\n\t\t\tsetNeckPositionOn(positionList[i][0], positionList[i][1])\r\n\t}\r\n}\r\n\r\nfunction setNeckPositionListCorrect(positionList)\r\n{\r\n\tfor(var i=0; i<positionList.length; i++)\r\n\t{\r\n\t\tsetNeckPositionCorrect(positionList[i][0], positionList[i][1])\r\n\t}\r\n}\r\n\r\nfunction setNeckPositionListIncorrect(positionList)\r\n{\r\n\tfor(var i=0; i<positionList.length; i++)\r\n\t{\r\n\t\tsetNeckPositionIncorrect(positionList[i][0], positionList[i][1])\r\n\t}\r\n}\r\n\r\n",
                "fileId": {
                    "path": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "x": 3250,
            "hidden": true,
            "y": 50
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#126#undefined",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\neckActions.js",
            "x": 3700,
            "y": 500,
            "color": {
                "background": "#EDEDD0",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#126#undefined",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "setNeckPositionListOn",
                "line": "function setNeckPositionListOn(positionList)",
                "lineNumber": 126,
                "id": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#126#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 137,
                "selectedByUser": false,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 3750,
            "y": 550
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#131#null",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\neckActions.js",
            "x": 3900,
            "y": 500,
            "color": {
                "background": "#EDEDD0",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#131#null",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "line": "\t\t\tstringElements[",
                "value": "stringElements",
                "lineNumber": 131,
                "endLineNumber": null,
                "indexInLine": 3,
                "id": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#131#null",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": null,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 3950,
            "y": 550
        },
        {
            "id": "+Android+app+src+main+assets+main.js#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "align": "left",
                "color": "#2D2D2D",
                "size": 40
            },
            "chosen": {},
            "borderWidth": 0,
            "color": {
                "border": "#F6DFEB",
                "background": "#ffffff"
            },
            "size": 100,
            "scaling": {
                "label": true
            },
            "label": "\\main.js",
            "d": {
                "fileContent": "var TOTAL_NUMBER_OF_FRETS = 4;\r\nvar TOTAL_NUMBER_OF_STRINGS = 6;\r\n\r\nvar originalChordElementList = $(\".chord\");\r\nvar originalLyricsElementList = $(\".lyrics\");\r\nvar originalTicksElementList = $(\".tik, .tick\");\r\n\r\nvar chordList = new Array();\r\n\r\n\r\n$(\"#title\").hide();\r\n\r\nvar windowWidth = $(window).width();\r\nvar windowHeight = $(window).height();\r\n\r\nvar element_background = document.createElement('img');\r\nvar element_title = document.createElement('div');\r\nvar element_neck = document.createElement('img');\r\nvar element_bottom_stripe = document.createElement('img');\r\nvar element_chord = document.createElement('span');\r\nvar element_lyrics = document.createElement('span');\r\nvar element_logo = document.createElement('img');\r\nvar element_next = document.createElement('span');\r\nvar element_play = document.createElement('span');\r\nvar element_timer = document.createElement('span');\r\n\r\nvar isTimed = false;\r\nvar stringElements = new Array();\r\n\r\nvar currentChordIndex = 0;\r\nvar currentChord = null;\r\nvar nextChord = null;\r\nvar prevChord = null;\r\n\r\nvar neckPositions, neckFrets;\r\nvar neckPositionElementArray  = new Array()\r\nvar neckPositionCorrectElementArray  = new Array()\r\nvar neckPositionIncorrectElementArray  = new Array()\r\n\r\nvar playStrummingAnimation = false;\r\n\r\nvar isAndroid = navigator.userAgent.toLowerCase().indexOf(\"android\") > -1; //&& ua.indexOf(\"mobile\");\r\n\r\nvar blinkingList;\r\nvar isBlinkOn = false;\r\nvar BLINK_INTERVAL = 200;\r\n\r\n\r\n\r\n// 3rd         1st   controls\r\n// A     B     C     D\r\n// 123456123456123456123456\r\n// 000001000001000001000000\r\n// 100001010000000000000000\r\n// 100001000000000000000000\r\n\r\n\r\n\r\n\r\ndocument.body.onload = function()\r\n{\r\n\tloadScript('./js/consts.js');\r\n\tloadScript('./js/DisplayActions.js');\r\n\tloadScript('./js/Navigation.js');\r\n\tloadScript('./js/neckActions.js');\r\n\tloadScript('./js/chords.js');\r\n\tloadScript('./js/animation.js');\r\n\tloadScript('./js/timer.js');\r\n\tloadScript('./js/android.js');\r\n\r\n\twindow.setTimeout(initialize, 500);\r\n\t// temp\r\n\t//window.setTimeout(function(){demo = new Demo();}, 400);\r\n};\r\n\r\nfunction processChordsHtml()\r\n{\r\n\tfor(var i=0; i<originalChordElementList.length; i++)\r\n\t{\r\n\t\tchordList.push(new ChordObject());\r\n\t\tchordList[i].text = originalChordElementList[i].innerHTML;\r\n\t\tchordList[i].positionList = chordTextToPositionList(chordList[i].text);\r\n\t\tchordList[i].positionString = positionListToString(chordList[i].positionList);\r\n\t\tvar emptyStringList = chordTextToStringList(chordList[i].text);\r\n\t\temptyStringList ? chordList[i].emptyStringList = emptyStringList : chordList[i].emptyStringList = null;\r\n\t\tvar topString = chordTextTopString(chordList[i].text);\r\n\t\ttopString ? chordList[i].topString = topString : chordList[i].topString = chordList[i].positionList[0][1];\r\n\t\tchordList[i].index = i;\r\n\t}\r\n\tfor(var i=0; i<originalLyricsElementList.length; i++)\r\n\t{\r\n\t\tchordList[i].lyrics = originalLyricsElementList[i].innerHTML;\r\n\t}\r\n\tfor(var i=0; i<originalTicksElementList.length; i++)\r\n\t{\r\n\t\tchordList[i].tiks = parseInt(originalTicksElementList[i].innerHTML);\r\n\t}\r\n\tfor(var i=0; i<originalChordElementList.length; i++)\r\n\t\t$(originalChordElementList[i].remove());\r\n\tfor(var i=0; i<originalTicksElementList.length; i++)\r\n\t\t$(originalTicksElementList[i].remove());\r\n\tfor(var i=0; i<originalLyricsElementList.length; i++)\r\n\t\t$(originalLyricsElementList[i].remove());\r\n}\r\n\r\nfunction initialize()\r\n{\r\n\r\n\tprocessChordsHtml();\r\n\tsetCurrentChord(0);\r\n\t\r\n\tcreateElements();\r\n\tcreateTable();\r\n\tcreateStrings()\r\n\tcreateCorrectIncorrectTable();\r\n\tblink();\r\n\r\n\r\n\tsendMessageToAndroid(\"start_chords\");\r\n\tfor(var i=0; i<chordList.length; i++)\r\n\t\tsendChordToAndroid(chordList[i]);\r\n\r\n\tsendMessageToAndroid(\"end_chords\");\r\n\r\n\tsetTimerIncorrect();\r\n\tsetTimerHidden();\r\n\t\r\n\tif(chordList.length!=0)\r\n\t{\r\n\t\tdisplayCurrentChord();\r\n\t}\r\n}\r\n\r\nvar lastEventTime = new Date().getTime();\r\nfunction checkEventIsReal()\r\n{\r\n\tvar newEventTime = new Date().getTime();  \r\n\tif((newEventTime - lastEventTime) < 250)\r\n\t{\r\n\t\tlastEventTime = newEventTime;\r\n\t\treturn false;;\r\n\t}\r\n\tlastEventTime = newEventTime;\r\n\treturn true;\r\n}\r\n\r\nfunction updateBlinkingList(newBlinkingList)\r\n{\r\n\tif(blinkingList==null)\r\n\t{\r\n\t\tblinkingList = newBlinkingList;\r\n\t\treturn;\r\n\t}\r\n\tblinkingList = newBlinkingList;\r\n}\r\n\r\nfunction blink()\r\n{\r\n\tif(blinkingList==null)\r\n\t{\r\n\t\tsetTimeout(function(){blink();}, BLINK_INTERVAL);\r\n\t\treturn;\r\n\t}\r\n\tif(isBlinkOn)\r\n\t{\r\n\t\tsetNeckPositionListOff(blinkingList);\r\n\t\tisBlinkOn = false;\r\n\t}\r\n\telse\r\n\t{\r\n\t\tsetNeckPositionListOn(blinkingList);\r\n\t\tisBlinkOn = true;\r\n\t}\r\n\t\r\n\tsetTimeout(function(){blink();}, BLINK_INTERVAL)\r\n}\r\n\r\nfunction createTable()\r\n{\r\n\tneckPositionElementArray = new Array(TOTAL_NUMBER_OF_FRETS);\r\n\r\n\tfor(var i=0; i<=TOTAL_NUMBER_OF_FRETS; i++)\r\n\t{\r\n\t\tneckPositionElementArray[i] = new Array();\r\n\t}\r\n\t\r\n\tfor(var j=0; j<=TOTAL_NUMBER_OF_FRETS; j++)\r\n\t{\r\n\t\tvar element_neck_fret = document.createElement('table');\r\n\t\telement_neck_fret.className = \"fret_table\";\r\n\t\tfor(var i=0; i<TOTAL_NUMBER_OF_STRINGS; i++)\r\n\t\t{\r\n\t\t\telement_neck_fret.appendChild(document.createElement('tr'));\r\n\t\t\telement_neck_fret.rows[i].appendChild(document.createElement('td'));\r\n\t\t\telement_neck_fret.rows[i].cells[0].style.width = windowWidth*0.1;\r\n\t\t\telement_neck_fret.rows[i].cells[0].style.height = windowHeight*0.0515;\r\n\t\t\telement_neck_fret.rows[i].cells[0].className = \"position_td\";\r\n\r\n\t\t\tvar backgroundColor = 'white';\r\n\t\t\t// backgroundColor = \"#fffe79\";\r\n\t\t\t// backgroundColor = \"#ff7979\";\r\n\r\n\t\t\telement_neck_fret.rows[i].cells[0].style.backgroundColor = backgroundColor;\r\n\t\t\telement_neck_fret.rows[i].cells[0].style.boxShadow = \"0px 0px 10px 3px \"+ backgroundColor;\r\n\t\t\t\r\n\t\t\telement_neck_fret.rows[i].cells[0].style.fontSize = $(element_neck_fret.rows[i].cells[0]).height()*2 + \"px\";\r\n\t\t\telement_neck_fret.rows[i].cells[0].style.lineHeight = $(element_neck_fret.rows[i].cells[0]).height()*0.01+ \"px\";\r\n\t\t\t\r\n\t\t\tneckPositionElementArray[j][i] = element_neck_fret.rows[i].cells[0];\r\n\t\t\t\r\n\t\t\t//element_neck_fret.rows[i].cells[0].innerHTML = j;\r\n\t\t\t\r\n\t\t\t/*element_neck_fret.rows[i].cells[0].style.backgroundColor = randomColor();\r\n\t\t\telement_neck_fret.rows[i].cells[0].innerHTML = j+\",\"+i;*/\r\n\t\t}\r\n\t\r\n\t\tdocument.body.appendChild(element_neck_fret);\r\n\t\telement_neck_fret.style.zIndex = 1;\r\n\t\telement_neck_fret.style.borderSpacing = windowHeight*0.018;\r\n\t}\r\n\r\n\tvar neckTop = $(element_neck).position().top;\r\n\tvar neckHeight = $(element_neck).height();\r\n\tvar neckWidth = $(element_neck).width();\r\n\tfor(var i=0; i<=TOTAL_NUMBER_OF_FRETS; i++)\r\n\t{\r\n\t\t$(\".fret_table\")[i].style.left = ($($(\".fret_table\")[0]).width()/3)*(i+1)+(neckWidth/6)*i;\r\n\t\t$(\".fret_table\")[i].style.top = neckTop;\r\n\t}\r\n}\r\n\r\nfunction createCorrectIncorrectTable()\r\n{\r\n\tneckPositionCorrectElementArray = new Array();\r\n\tfor(var i=0; i<=TOTAL_NUMBER_OF_FRETS; i++)\r\n\t{\r\n\t\tneckPositionCorrectElementArray[i] = new Array()\r\n\t\tfor(var j=0; j<TOTAL_NUMBER_OF_STRINGS; j++)\r\n\t\t{\r\n\t\t\tvar correctImage = document.createElement('img');\r\n\t\t\tcorrectImage.src = './pics/v.png';\r\n\t\t\tcorrectImage.style.height = neckPositionElementArray[i][j].style.height;\r\n\t\t\tcorrectImage.style.width = neckPositionElementArray[i][j].style.width;\r\n\t\t\tcorrectImage.style.position = 'absolute';\r\n\t\t\tcorrectImage.style.left = $(neckPositionElementArray[i][j]).offset().left;\r\n\t\t\tcorrectImage.style.top = $(neckPositionElementArray[i][j]).offset().top;\r\n\t\t\tneckPositionCorrectElementArray[i][j] = correctImage; \r\n\t\t\tdocument.body.appendChild(correctImage);\r\n\t\t\tneckPositionCorrectElementArray[i][j].style.opacity = '0';\r\n\t\t}\r\n\t}\r\n\r\n\tneckPositionIncorrectElementArray = new Array();\r\n\tfor(var i=0; i<=TOTAL_NUMBER_OF_FRETS; i++)\r\n\t{\r\n\t\tneckPositionIncorrectElementArray[i] = new Array()\r\n\t\tfor(var j=0; j<TOTAL_NUMBER_OF_STRINGS; j++)\r\n\t\t{\r\n\t\t\tvar correctImage = document.createElement('img');\r\n\t\t\tcorrectImage.src = './pics/x.png';\r\n\t\t\tcorrectImage.style.height = neckPositionElementArray[i][j].style.height;\r\n\t\t\tcorrectImage.style.width = neckPositionElementArray[i][j].style.width;\r\n\t\t\tcorrectImage.style.position = 'absolute';\r\n\t\t\tcorrectImage.style.left = $(neckPositionElementArray[i][j]).offset().left;\r\n\t\t\tcorrectImage.style.top = $(neckPositionElementArray[i][j]).offset().top;\r\n\t\t\tneckPositionIncorrectElementArray[i][j] = correctImage; \r\n\t\t\tdocument.body.appendChild(correctImage);\r\n\t\t\tneckPositionIncorrectElementArray[i][j].style.opacity = '0';\r\n\t\t}\r\n\t}\r\n}\r\n\r\nfunction createStrings()\r\n{\r\n\tvar fretTable = $(\".fret_table\")[0];\r\n\tvar stringsContainerElement = document.createElement('div');\r\n\tstringsContainerElement.style.position = 'absolute';\r\n\tstringsContainerElement.style.top = $(fretTable.rows[0]).offset().top;\r\n\tstringsContainerElement.style.left = 0;\r\n\tstringsContainerElement.style.width = $(window).width();\r\n\t\r\n\tdocument.body.appendChild(stringsContainerElement);\r\n\tfor(var i=0; i<TOTAL_NUMBER_OF_STRINGS; i++)\r\n\t{\r\n\t\tstringElements[i] = document.createElement('div');\r\n\t\tstringElements[i].style.position = 'relative';\r\n\r\n\t\tstringElements[i].style.width = $(window).width();\r\n\t\tstringElements[i].style.height = $(fretTable.rows[0]).height()/9;\r\n\t\tif(i==0)\r\n\t\t\t$(stringElements[i]).css(\"margin-top\", $(fretTable).height()/20);\r\n\t\telse\r\n\t\t\t$(stringElements[i]).css(\"margin-top\", $(fretTable).height()/7);\r\n\t\tstringElements[i].style.zIndex = 1;\r\n\t\tstringElements[i].className = \"string\";\r\n\t\tstringElements[i].style.boxShadow = \"0px 5px 10px 3px black\";\r\n\t\tstringsContainerElement.appendChild(stringElements[i]);\r\n\t}\r\n\t\r\n}\r\n\r\nfunction randomColor()\r\n{\r\n\treturn Math.floor(Math.random()*16777215).toString(16);\r\n}\r\n\r\n\r\nfunction createElements()\r\n{\r\n\telement_background.src = \"./pics/back.png\";\r\n\tdocument.body.appendChild(element_background);\r\n\tsetPosition(element_background, 0, 0, 1, 1);\r\n\r\n\telement_title.innerHTML = document.getElementById('title').innerHTML;\r\n\tdocument.body.appendChild(element_title);\r\n\tsetPosition(element_title, 0.25, 0.047, 0.48, 0.16);\r\n\telement_title.className = \"text next\";\r\n\r\n\telement_neck.src = \"./pics/neck.png\";\r\n\tdocument.body.appendChild(element_neck);\r\n\tsetPosition(element_neck, 0, 0.22, 1, 0.42);\r\n\telement_neck.style.boxShadow = \"0px 5px 3px black\";\r\n\r\n\telement_bottom_stripe.src = \"./pics/bottom_stripe.png\";\r\n\tdocument.body.appendChild(element_bottom_stripe);\r\n\tsetPosition(element_bottom_stripe, 0, 0.7, 1, 0.22);\r\n\r\n\tdocument.body.appendChild(element_chord);\r\n\t//element_chord.innerHTML = $(originalChordElementList)[currentChordIndex].innerHTML;\r\n\tsetPosition(element_chord, 0.04, 0.64, 0.16, 0.28, 1.3);\r\n\telement_chord.className = \"chord\";\r\n\r\n\tdocument.body.appendChild(element_lyrics);\r\n\t//element_lyrics.innerHTML = $(originalLyricsElementList)[currentChordIndex].innerHTML;\r\n\tsetPosition(element_lyrics, 0.2, 0.67, 0.79, 0.2);\r\n\telement_lyrics.className = \"text\";\r\n\r\n\telement_logo.src = \"./pics/logo.png\";\r\n\tdocument.body.appendChild(element_logo);\r\n\tsetPosition(element_logo, 0.74, 0.047, 0.2, 0.15);\r\n\r\n\tdocument.body.appendChild(element_next);\r\n\t//element_next.innerHTML = $(originalChordElementList)[currentChordIndex+1].innerHTML;\r\n\tsetPosition(element_next, 0.1, 0.03, 0.1, 0.15, 1.3);\r\n\telement_next.className = \"next chord\";\r\n\t\r\n\telement_timer.className = 'timer';\r\n\tdocument.body.appendChild(element_timer);\r\n\tsetPosition(element_timer, 0.5, 0.1, 0.4, 0.4)\r\n\telement_timer.style.left = windowWidth/2 - $(element_timer).width()/2;\r\n\telement_timer.style.visibility = 'hidden';\r\n\r\n\telement_timer.style.visibility = '';\r\n\telement_timer.innerHTML = '1';\r\n\r\n\t/*\r\n\t * PLAY \r\n\tdocument.body.appendChild(element_play);\r\n\telement_play.innerHTML = \"PLAY\";\r\n\tsetPosition(element_play, 0.5, 0.5, 0.7, 0.7);\r\n\telement_play.style.left = parseInt(element_play.style.left) - $(element_play).width()/2;\r\n\telement_play.style.top = parseInt(element_play.style.top) - $(element_play).height()/2;\r\n\telement_play.className = \"play\";\r\n\t*/\r\n}\r\n\r\nfunction getBestFitTextSize(element, optional_text)\r\n{\r\n\tvar returnedFontSize, currentFontSize = 5;\r\n\tvar tryElement = document.createElement('span');\r\n\tif(optional_text==null)\ttryElement.innerHTML = element.innerHTML;\r\n\telse\t\t\t\t\ttryElement.innerHTML = optional_text;\r\n\t\r\n\ttryElement.style.fontSize = currentFontSize + \"px\";\r\n\tdocument.body.appendChild(tryElement);\r\n\t\r\n\tvar error = 0;\r\n\twhile($(tryElement).width()<$(element).width() && $(tryElement).height()<$(element).height())\r\n\t{\r\n\t\tif(error>100) break;\r\n\t\terror++;\r\n\t\tcurrentFontSize = currentFontSize + 5; \r\n\t\ttryElement.style.fontSize = currentFontSize + \"px\";\r\n\t}\r\n\t\r\n\treturnedFontSize = tryElement.style.fontSize; \r\n\tdocument.body.removeChild(tryElement);\r\n\treturn returnedFontSize;\r\n}\r\n\r\nfunction setPosition(element, x, y, width, height)\r\n{\r\n\tif(y!=null)\r\n\t\telement.style.left = x*windowWidth;\r\n\tif(x!=null)\r\n\t\telement.style.top = y*windowHeight;\r\n\tif(width!=null)\r\n\t\telement.style.width = (width*windowWidth);\r\n\tif(height!=null)\r\n\t\telement.style.height = (height*windowHeight);\r\n\r\n\telement.style.fontSize = getBestFitTextSize(element);\r\n\t\r\n\t//element.style.backgroundColor = randomColor();\r\n\t//element.style.border = \"1px solid\";\r\n}\r\n\r\nfunction loadScript(url, callback)\r\n{\r\n    // Adding the script tag to the head as suggested before\r\n    var head = document.getElementsByTagName('head')[0];\r\n    var script = document.createElement('script');\r\n    script.type = 'text/javascript';\r\n    script.src = url;\r\n\r\n    // Then bind the event to the callback function.\r\n    // There are several events for cross browser compatibility.\r\n    script.onreadystatechange = callback;\r\n    script.onload = callback;\r\n\r\n    // Fire the loading\r\n    head.appendChild(script);\r\n}\r\n\r\nvar clickIndex = 0;\r\nvar demoIndex = 0;\r\nvar demoString = \"000000000000000000000000\";\r\n\r\n\r\n\r\nfunction demoFunction()\r\n{\r\n\treturn;\r\n\treceivePositionStringFromAndroid(demoString);\r\n\tdemoString = demoString.substr(0,demoIndex) + '1' + demoString.substr(demoIndex+1);\r\n\tdemoIndex++;\r\n\tsetTimeout(demoFunction, 300);\r\n}\r\n\r\n//receivePositionStringFromAndroid(\"030000c0000c010000000000\");\r\nclickIndex = 0;\r\nif(!isAndroid)\r\n{\r\n\tdocument.body.onclick =\r\n\t\tfunction()\r\n\t\t{\r\n\t\t\tif(clickIndex==0)\r\n\t\t\t{\r\n\t\t\t\teventPressedCorrect();\r\n\t\t\t}\r\n\t\t\telse if (clickIndex==1)\r\n\t\t\t{\r\n\t\t\t\teventForward();\r\n\t\t\t}\r\n\t\t\tif(clickIndex==2)\r\n\t\t\t{\r\n\t\t\t\teventPressedCorrect();\r\n\t\t\t}\r\n\t\t\telse if (clickIndex==3)\r\n\t\t\t{\r\n\t\t\t\teventForward();\r\n\t\t\t}\r\n\t\t\telse if(clickIndex==4)\r\n\t\t\t{\r\n\t\t\t\teventStop();\r\n\t\t\t}\r\n\t\t\tclickIndex++;\r\n\t\t};\r\n}\r\n\r\nvar demo;\r\nfunction Demo()\r\n{\r\n\r\n\tthis.startDemo = function()\r\n\t{\r\n\t\tsetTimeout(function(){demo.action1();}, 1590);\r\n\t\tsetTimeout(function(){demo.action2();}, 2610);\r\n\t\tsetTimeout(function(){demo.action3();}, 3320);\r\n\t\tsetTimeout(function(){demo.action4();}, 4410);\r\n\t\tsetTimeout(function(){demo.action5();}, 6200);\r\n\t}\r\n\r\n\tthis.initialize = function()\r\n\t{\r\n\t\tsetAllNeckPositionsOff(false);\r\n\t\telement_title.style.opacity = '1';\r\n\t\tsetNeckPositionListOn([[3,1,3], [2,5,2], [3,6,1]]);\r\n\t\tsetFingering([[3,1,3], [2,5,1], [3,6,2]]);\r\n\t}\r\n\r\n\tthis.action1 = function()\r\n\t{\r\n\t\tsetNeckPositionOff(3, 1, true);\r\n\t\tsetNeckPositionListCorrect([[3,1]]);\r\n\t}\r\n\r\n\tthis.action2 = function()\r\n\t{\r\n\t\tsetNeckPositionOff(3, 1, true);\r\n\t\tsetNeckPositionOn(3, 1);\r\n\t}\r\n\r\n\tthis.action3 = function()\r\n\t{\r\n\t\tsetNeckPositionIncorrect(3, 3);\r\n\t}\r\n\r\n\tthis.action4 = function()\r\n\t{\r\n\t\tsetNeckPositionOff(3, 3);\r\n\t}\r\n\r\n\tthis.action5 = function()\r\n\t{\r\n\t\tsetNeckPositionListOff([[3,1], [2,5], [3,6]], true);\r\n\t\tsetNeckPositionListCorrect([[3,1,3], [2,5,2], [3,6,1]]);\r\n\t\tstartStrummingAnimation(200, chordTextTopString(getChordText(currentChordIndex)));\r\n\t\telement_chord.style.color = 'green';\r\n\t\telement_lyrics.style.color = 'green';\r\n\r\n\t}\r\n\r\n\r\n\tthis.initialize();\r\n}\r\n",
                "fileId": {
                    "path": "\\Android\\app\\src\\main\\assets\\main.js",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "x": 3650,
            "hidden": true,
            "y": 50
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\main.js",
            "x": 4100,
            "y": 500,
            "color": {
                "background": "#F6DFEB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "value": "stringElements",
                "line": "\t\tstringElements[i] = document.createElement('div');",
                "lineNumber": 284,
                "id": "\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 285,
                "selectedByUser": true,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\assets\\main.js",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 4150,
            "y": 550
        },
        {
            "id": "ToDo*1692189997814#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "circularImage",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 0,
            "color": {
                "border": "#A6D6D6",
                "background": "#ffffff"
            },
            "size": 40,
            "scaling": {
                "label": true
            },
            "label": "creation of fret elements\non html",
            "d": {
                "fileContent": "TODO:",
                "fileId": {
                    "path": "ToDo_1692189997814",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "isCustom": true,
                "type": "toDoNode",
                "wasEdited": true
            },
            "x": 4150,
            "image": "/assets/nodes/info.png",
            "imagePadding": 20,
            "shapeProperties": {
                "useBorderWithImage": true
            },
            "y": 300
        },
        {
            "id": "Group*1692191319887#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "align": "left",
                "color": "#2D2D2D",
                "size": 40
            },
            "chosen": {},
            "borderWidth": 1,
            "color": {
                "border": "#0A456D",
                "background": "#f5f5f5"
            },
            "size": 100,
            "scaling": {
                "label": true
            },
            "label": "Arduino",
            "d": {
                "fileContent": "Describe this group",
                "fileId": {
                    "path": "Group_1692191319887",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "isCustom": true,
                "isCollpased": false,
                "wasEdited": true,
                "type": "group"
            },
            "x": -100,
            "y": -550
        },
        {
            "id": "Group*1692191319887#https:+github.com+niliproject123+nili*full.git_boundary",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {},
            "chosen": {},
            "borderWidth": 1,
            "size": 15,
            "color": {
                "border": "#000000",
                "background": "#ffffff"
            },
            "d": {
                "type": "boundaryNode",
                "belongsToGroup": "Group*1692191319887#https:+github.com+niliproject123+nili*full.git"
            },
            "x": 200,
            "y": 550
        },
        {
            "id": "Group*1692191330070#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "align": "left",
                "color": "#2D2D2D",
                "size": 40
            },
            "chosen": {},
            "borderWidth": 1,
            "color": {
                "border": "#0A456D",
                "background": "#f5f5f5"
            },
            "size": 100,
            "scaling": {
                "label": true
            },
            "label": "Android Java",
            "d": {
                "fileContent": "Describe this group",
                "fileId": {
                    "path": "Group_1692191330070",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "isCustom": true,
                "isCollpased": false,
                "wasEdited": true,
                "type": "group"
            },
            "x": 400,
            "y": -600
        },
        {
            "id": "Group*1692191330070#https:+github.com+niliproject123+nili*full.git_boundary",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {},
            "chosen": {},
            "borderWidth": 1,
            "size": 15,
            "color": {
                "border": "#000000",
                "background": "#ffffff"
            },
            "d": {
                "type": "boundaryNode",
                "belongsToGroup": "Group*1692191330070#https:+github.com+niliproject123+nili*full.git"
            },
            "x": 2350,
            "y": 850
        },
        {
            "id": "Group*1692191346236#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "align": "left",
                "color": "#2D2D2D",
                "size": 40
            },
            "chosen": {},
            "borderWidth": 1,
            "color": {
                "border": "#0A456D",
                "background": "#f5f5f5"
            },
            "size": 100,
            "scaling": {
                "label": true
            },
            "label": "Android Webview",
            "d": {
                "fileContent": "Describe this group",
                "fileId": {
                    "path": "Group_1692191346236",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "isCustom": true,
                "isCollpased": false,
                "wasEdited": true,
                "type": "group"
            },
            "x": 2600,
            "y": 100
        },
        {
            "id": "Group*1692191346236#https:+github.com+niliproject123+nili*full.git_boundary",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {},
            "chosen": {},
            "borderWidth": 1,
            "size": 15,
            "color": {
                "border": "#000000",
                "background": "#ffffff"
            },
            "d": {
                "type": "boundaryNode",
                "belongsToGroup": "Group*1692191346236#https:+github.com+niliproject123+nili*full.git"
            },
            "x": 3150,
            "y": 750
        },
        {
            "id": "ToDo*1692191736405#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "circularImage",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 0,
            "color": {
                "border": "#A6D6D6",
                "background": "#ffffff"
            },
            "size": 40,
            "scaling": {
                "label": true
            },
            "label": "info",
            "d": {
                "fileContent": "TODO:",
                "fileId": {
                    "path": "ToDo_1692191736405",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "isCustom": true,
                "type": "toDoNode"
            },
            "x": 1050,
            "image": "/assets/nodes/info.png",
            "imagePadding": 20,
            "shapeProperties": {
                "useBorderWithImage": true
            },
            "y": -250
        },
        {
            "id": "Group*1692193022588#https:+github.com+niliproject123+nili*full.git",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "align": "left",
                "color": "#2D2D2D",
                "size": 40
            },
            "chosen": {},
            "borderWidth": 1,
            "color": {
                "border": "#0A456D",
                "background": "#f5f5f5"
            },
            "size": 100,
            "scaling": {
                "label": true
            },
            "label": "JavaScript/HTML",
            "d": {
                "fileContent": "Describe this group",
                "fileId": {
                    "path": "Group_1692193022588",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                },
                "isCustom": true,
                "isCollpased": false,
                "wasEdited": true,
                "type": "group"
            },
            "x": 3400,
            "y": 100
        },
        {
            "id": "Group*1692193022588#https:+github.com+niliproject123+nili*full.git_boundary",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {},
            "chosen": {},
            "borderWidth": 1,
            "size": 15,
            "color": {
                "border": "#000000",
                "background": "#ffffff"
            },
            "d": {
                "type": "boundaryNode",
                "belongsToGroup": "Group*1692193022588#https:+github.com+niliproject123+nili*full.git"
            },
            "x": 4500,
            "y": 700
        },
        {
            "id": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#70",
            "physics": false,
            "shape": "box",
            "font": {
                "color": "#000000"
            },
            "chosen": {},
            "borderWidth": 0,
            "d": {
                "type": "filename",
                "dragWithParent": true
            },
            "label": "\\Operator.java",
            "x": 1200,
            "y": 300,
            "color": {
                "background": "#F4C7AB",
                "border": "#000000"
            }
        },
        {
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#70",
            "physics": false,
            "shape": "dot",
            "widthConstraint": {},
            "font": {
                "background": "white",
                "color": "black"
            },
            "chosen": {},
            "borderWidth": 2,
            "d": {
                "line": "\t\t\t\t\t\treceivedPressFromUser((String) message.obj);",
                "value": "\r\nmUser((String) message.obj);\r\n\t\t\t\t\telse if(message.arg1",
                "lineNumber": 69,
                "endLineNumber": 70,
                "indexInLine": 22,
                "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#70",
                "isRegex": false,
                "flags": "gi",
                "endContentLine": 70,
                "ofFile": {
                    "path": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java",
                    "gitUrl": "https://github.com/niliproject123/nili-full.git"
                }
            },
            "color": {
                "background": "#f0f8ff",
                "border": "#000000"
            },
            "image": "/assets/nodes/code.png",
            "imagePadding": 20,
            "localPath": "C:\\dev\\nili-full",
            "label": "",
            "gitUrl": "https://github.com/niliproject123/nili-full.git",
            "rootToProjectPath": "",
            "rootPath": "C:\\dev\\nili-full",
            "x": 1250,
            "y": 350
        },
        {
            "id": "start_\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null408",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "align": "left",
                "background": "none",
                "color": "white",
                "size": 60
            },
            "chosen": {},
            "borderWidth": 4,
            "label": "START",
            "color": {
                "border": "#2e8151",
                "background": "#3DDC84"
            },
            "shapeProperties": {
                "borderRadius": 6
            },
            "d": {
                "dragWithParent": true
            },
            "x": -250,
            "y": 150,
            "icon": {
                "size": 60
            },
            "size": 60
        },
        {
            "id": "end_\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined266",
            "physics": false,
            "shape": "box",
            "widthConstraint": {},
            "font": {
                "align": "left",
                "background": "none",
                "color": "white",
                "size": 60
            },
            "chosen": {},
            "borderWidth": 4,
            "label": "FINISH",
            "color": {
                "border": "#E63946",
                "background": "#FF6B6B"
            },
            "shapeProperties": {
                "borderRadius": 6
            },
            "d": {
                "dragWithParent": true
            },
            "x": 4150,
            "y": 800,
            "icon": {
                "size": 60
            },
            "size": 60
        }
    ],
    "edges": [
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null_filename_\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null",
            "from": "\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null",
            "to": "filename_\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Arduino+nili*arduino.ino#https:+github.com+niliproject123+nili*full.git_\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null",
            "from": "+Arduino+nili*arduino.ino#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#36#null_filename_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#36#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#36#null",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#36#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+utilities+BtReadData.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#36#null",
            "from": "+Android+app+src+main+java+com+nili+utilities+BtReadData.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#36#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null_filename_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#36#null_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#36#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+utilities+BtReadData.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null",
            "from": "+Android+app+src+main+java+com+nili+utilities+BtReadData.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#null_filename_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#null",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#null",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+utilities+BtReadData.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#null",
            "from": "+Android+app+src+main+java+com+nili+utilities+BtReadData.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\globals\\Commands.java#https://github.com/niliproject123/nili-full.git#14#undefined_filename_\\Android\\app\\src\\main\\java\\com\\nili\\globals\\Commands.java#https://github.com/niliproject123/nili-full.git#14#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\globals\\Commands.java#https://github.com/niliproject123/nili-full.git#14#undefined",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\globals\\Commands.java#https://github.com/niliproject123/nili-full.git#14#undefined",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined_filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#null_\\Android\\app\\src\\main\\java\\com\\nili\\globals\\Commands.java#https://github.com/niliproject123/nili-full.git#14#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\globals\\Commands.java#https://github.com/niliproject123/nili-full.git#14#undefined",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+globals+Commands.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\globals\\Commands.java#https://github.com/niliproject123/nili-full.git#14#undefined",
            "from": "+Android+app+src+main+java+com+nili+globals+Commands.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\globals\\Commands.java#https://github.com/niliproject123/nili-full.git#14#undefined",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#null_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#56#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "userLink_\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null_\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null",
            "from": "\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\utilities\\BtReadData.java#https://github.com/niliproject123/nili-full.git#50#null",
            "arrows": {
                "to": true
            }
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#null_filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#null",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#null",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#null",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#155#undefined_filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#155#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#155#undefined",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#155#undefined",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#null_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#155#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#155#undefined",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#155#undefined",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#155#undefined",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#165#null_filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#165#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#165#null",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#165#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#155#undefined_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#165#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#155#undefined",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#165#null",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#165#null",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#165#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#275#undefined_filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#275#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#275#undefined",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#275#undefined",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#275#undefined",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#275#undefined",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_remark_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git997",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "remark_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git997",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null_filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#165#null_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#165#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#179#null_filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#179#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#179#null",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#179#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#179#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#179#null",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#179#null",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#179#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined_filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#179#null_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#179#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {},
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined_ToDo*1692188331382#https:+github.com+niliproject123+nili*full.git",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined",
            "to": "ToDo*1692188331382#https:+github.com+niliproject123+nili*full.git",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#158#null_filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#158#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#158#null",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#158#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#158#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#158#null",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#158#null",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#158#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#337#undefined_filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#337#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#337#undefined",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#337#undefined",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#158#null_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#337#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#158#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#337#undefined",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#337#undefined",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#337#undefined",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#339#null_filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#339#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#339#null",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#339#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#337#undefined_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#339#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#337#undefined",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#339#null",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#339#null",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#339#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined_filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#330#undefined_filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#330#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#330#undefined",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#330#undefined",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+main+WebAppInterface.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
            "from": "+Android+app+src+main+java+com+nili+main+WebAppInterface.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#339#null_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#330#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#339#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#330#undefined",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#330#undefined",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#330#undefined",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "userLink_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#330#undefined_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#330#undefined",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
            "arrows": {
                "to": true
            },
            "label": "send fret \nstate"
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#29#null_filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#29#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#29#null",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#29#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#29#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#29#null",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+main+WebAppInterface.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#29#null",
            "from": "+Android+app+src+main+java+com+nili+main+WebAppInterface.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#29#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#50#undefined_filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#50#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#50#undefined",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#50#undefined",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#29#null_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#50#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#29#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#50#undefined",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+main+WebAppInterface.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#50#undefined",
            "from": "+Android+app+src+main+java+com+nili+main+WebAppInterface.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#50#undefined",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#51#null_filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#51#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#51#null",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#51#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#50#undefined_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#51#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#50#undefined",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#51#null",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+main+WebAppInterface.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#51#null",
            "from": "+Android+app+src+main+java+com+nili+main+WebAppInterface.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#51#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#65#undefined_filename_\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#65#undefined",
            "from": "\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#65#undefined",
            "to": "filename_\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#65#undefined",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#51#null_\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#65#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#51#null",
            "to": "\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#65#undefined",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+assets+js+android.js#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#65#undefined",
            "from": "+Android+app+src+main+assets+js+android.js#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#65#undefined",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#21#null_filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#21#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#21#null",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#21#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+main+WebAppInterface.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#21#null",
            "from": "+Android+app+src+main+java+com+nili+main+WebAppInterface.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#21#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "userLink_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#21#null_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#21#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
            "arrows": {
                "to": true
            }
        },
        {
            "type": "link",
            "d": {},
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#21#null_ToDo*1692189822763#https:+github.com+niliproject123+nili*full.git",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#21#null",
            "to": "ToDo*1692189822763#https:+github.com+niliproject123+nili*full.git",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#63#null_filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#63#null",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#63#null",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#63#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#63#null",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#63#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "userLink_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#63#null_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#63#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#68#undefined",
            "arrows": {
                "to": true
            }
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#99#null_filename_\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#99#null",
            "from": "\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#99#null",
            "to": "filename_\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#99#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#65#undefined_\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#99#null",
            "from": "\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#65#undefined",
            "to": "\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#99#null",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+assets+js+android.js#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#99#null",
            "from": "+Android+app+src+main+assets+js+android.js#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#99#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#126#undefined_filename_\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#126#undefined",
            "from": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#126#undefined",
            "to": "filename_\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#126#undefined",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#99#null_\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#126#undefined",
            "from": "\\Android\\app\\src\\main\\assets\\js\\android.js#https://github.com/niliproject123/nili-full.git#99#null",
            "to": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#126#undefined",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+assets+js+neckActions.js#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#126#undefined",
            "from": "+Android+app+src+main+assets+js+neckActions.js#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#126#undefined",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#131#null_filename_\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#131#null",
            "from": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#131#null",
            "to": "filename_\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#131#null",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#126#undefined_\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#131#null",
            "from": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#126#undefined",
            "to": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#131#null",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+assets+js+neckActions.js#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#131#null",
            "from": "+Android+app+src+main+assets+js+neckActions.js#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#131#null",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined_filename_\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined",
            "from": "\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined",
            "to": "filename_\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#131#null_\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined",
            "from": "\\Android\\app\\src\\main\\assets\\js\\neckActions.js#https://github.com/niliproject123/nili-full.git#131#null",
            "to": "\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+assets+main.js#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined",
            "from": "+Android+app+src+main+assets+main.js#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {},
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined_ToDo*1692189997814#https:+github.com+niliproject123+nili*full.git",
            "from": "\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined",
            "to": "ToDo*1692189997814#https:+github.com+niliproject123+nili*full.git",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "userLink_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined_\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#196#undefined",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\main\\WebAppInterface.java#https://github.com/niliproject123/nili-full.git#28#undefined",
            "arrows": {
                "to": true
            },
            "label": "according \nto state"
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#63#null_ToDo*1692191736405#https:+github.com+niliproject123+nili*full.git",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#63#null",
            "to": "ToDo*1692191736405#https:+github.com+niliproject123+nili*full.git",
            "dashes": true
        },
        {
            "type": "link",
            "d": {
                "wasEdited": true
            },
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "userLink_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#275#undefined",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#171#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#275#undefined",
            "arrows": {
                "to": true
            }
        },
        {
            "type": "link",
            "d": {},
            "width": 1,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "filenameEdge_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#70_filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#70",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#70",
            "to": "filename_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#70",
            "dashes": true
        },
        {
            "type": "link",
            "d": {},
            "width": 3,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "match_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#null_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#70",
            "from": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#null",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#70",
            "arrows": {
                "to": {
                    "enabled": true,
                    "scaleFactor": 1
                }
            }
        },
        {
            "type": "link",
            "d": {
                "type": "ofFile"
            },
            "width": 0.2,
            "physics": false,
            "length": 0,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "fileEdge_+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git_\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#70",
            "from": "+Android+app+src+main+java+com+nili+operator+Operator.java#https:+github.com+niliproject123+nili*full.git",
            "to": "\\Android\\app\\src\\main\\java\\com\\nili\\operator\\Operator.java#https://github.com/niliproject123/nili-full.git#69#70",
            "dashes": true,
            "hidden": true
        },
        {
            "type": "link",
            "d": {},
            "width": 3,
            "physics": false,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null_start_\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null408",
            "from": "\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null",
            "to": "start_\\Arduino\\nili_arduino.ino#https://github.com/niliproject123/nili-full.git#301#null408",
            "dashes": true
        },
        {
            "type": "link",
            "d": {},
            "width": 3,
            "physics": false,
            "smooth": false,
            "color": {
                "inherit": false
            },
            "font": {
                "color": "black",
                "background": "white",
                "strokeWidth": 0,
                "size": 30
            },
            "chosen": {},
            "id": "\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined_end_\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined266",
            "from": "\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined",
            "to": "end_\\Android\\app\\src\\main\\assets\\main.js#https://github.com/niliproject123/nili-full.git#284#undefined266",
            "dashes": true
        }
    ],
    "dirPath": "",
    "positioning": 1
}
