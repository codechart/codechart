import app from './App'

const port = process.env.PORT || 2900

function runApp() {
  app.listen(port, (err) => {
    if (err) {
      return console.log(err)
    }
  
    return console.log(`server is listening on ${port}`)
  })  
}

runApp()

// to build: pkg .
// example: https://dev.to/jochemstoel/bundle-your-node-app-to-a-single-executable-for-windows-linux-and-osx-2c89
// module.exports = function() {
//   runApp()
// }
