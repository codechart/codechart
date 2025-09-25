0. ensure rename:
    1. ensure all `covalent` was changed to `cochart`
    2. ensure all `use-covalent` was changed to `cochart.dev`
1. pkg-readme
    1. all description should be short and cocise 
    2. add `use with ai helpers` section:
        1. create diagrams:
            1. write prompt from  /write-covalent commands.
            2. add description like `insert this into you AI with instructions. copy the result json and paste into cochart using ctrl+v`
        2. read diagrams:
            1. write prompt from /read-covalent command
            2. add description like `copy from cochart using button on top menu, let your ai read that using the reading prompt`
2. in top menu in ui, where `copy prompt for llm` buttons are (notive there are two occurences of the buttons. one for ide and one w/o ide):
    1. replace `copy promt..` menu value with /write-covalent command, and change title to `copy prompt for writing diagrams`
    2. add a `copy prompt for reading diagrams` with value of /read-covalent
    3. change icons of buttons of prompts with someting depicting a prompt
3. in landing page
    1. change video on top to have 3 videos one next to the other (not one under the other!)
    2. add title for each - `let ai show you`, `help ai understand`, `create and share`
    3. `Why Covalent?` section
        1. comment out text in cards (leave titles)
        2. make a visual destinction between `What Can I Do With Covalent?` and `Business Impact`, adhering to general styling of landing page


