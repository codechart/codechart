let fs = require("fs")

export class Utils {
    

    public static readFileSync(path: string) {
        return fs.readFileSync(path).toString().replace(/\r\n/g, '\n')
    }
}
