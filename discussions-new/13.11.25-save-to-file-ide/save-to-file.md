## task
improve handling of json files from vscode to webview

## current user flow of communication
i ask claude to draw a diagarm, and put it in a file
I copy a diagram json from a file the ide and paste it into the webview drawing the diagram
I can add/change/remove nodes, and change their position

i then make remarks on the diagarm, copy it using a copy to json button, and paste it in a file
i then ask claude to read the diagram, from that file
the positions of the nodes is lost in this copy

when next i want to load the diagarm, i ask claude to write it again, and copy it again
the positions will be reset now
in contrast, if i load a diagram json using the "uplaod  from JSON" button, positions are saved



## current implementations
json<-> diagram in [file:llmJson.actions.ts]
normal json load i [file:chart.wrapper.ts]
nodes x,y property: look in [file: C:\dev\codechart\packages\ui\node_modules\@types\vis\index.d.ts]

## what i want
1. user can add a cochart diagram to cochart, using righ click menu. similar to 'add line to cochart' in vscode. implementation should be similar also
2. that diagram is loaded into cochart, similar to pasting diagram json (as described above)
3. the file name is displayed on bottom of screen (look in packages/ui/app.component.html)
4. the user can save to file (add button in menu in packages/ui/app.component.html), which saves to the loaded file
4.1. notice that in packages/ui/app.component.html there is a menu for isInIde, and a menu for not isInIde
5. the positions are saved and loaded