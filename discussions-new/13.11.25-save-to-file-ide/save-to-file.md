## task
improve handling of json files from vscode to webview

## current user flow of communication
How I display and read cochart diagrams today:
I have a cochart diagram json in a file. I manually copy the json and paste 

i then make remarks on the diagarm, copy it using a copy to json button, and paste it in a file
i then ask claude to read the diagram, from that file
the positions of the nodes is lost in this copy


## current implementations
json<-> diagram in [file:llmJson.actions.ts]
nodes x,y property: look in [file: C:\dev\codechart\packages\ui\node_modules\@types\vis\index.d.ts]

## what i want
1. user can add a cochart diagram to cochart, using righ click menu. similar to 'add line to cochart' in vscode. implementation should be similar also
2. that diagram is loaded into cochart, similar to pasting diagram json (as described above)
3. the file name is displayed on bottom of screen (look in packages/ui/app.component.html)
4. the user can save to file (add button in menu in packages/ui/app.component.html), which saves to the loaded file
4.1. notice that in packages/ui/app.component.html there is a menu for isInIde, and a menu for not isInIde
5. the positions are saved and loaded