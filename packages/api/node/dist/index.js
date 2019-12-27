"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("./App");
const port = process.env.PORT || 2900;
function runApp() {
    App_1.default.listen(port, (err) => {
        if (err) {
            return console.log(err);
        }
        return console.log(`server is listening on ${port}`);
    });
}
runApp();
// to build: pkg .
// example: https://dev.to/jochemstoel/bundle-your-node-app-to-a-single-executable-for-windows-linux-and-osx-2c89
// module.exports = function() {
//   runApp()
// }
//# sourceMappingURL=index.js.map