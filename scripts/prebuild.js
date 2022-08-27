var path = require('path')
var fs = require('fs')

var srcPath = path.join(__dirname, '..', 'src')
var destPath = path.join(__dirname, '..', 'build')
var htmlPath = path.join(srcPath, 'index.html')
if (!fs.existsSync(destPath)) {
  fs.mkdirSync(destPath)
}

var files = fs.readdirSync(srcPath)
var html = fs
  .readFileSync(htmlPath, 'utf8')
  .replace(/`/g, '\\`')
  .replace(/\${/g, '\\${')

for (var i in files) {
  var file = files[i]
  if (!file.endsWith('.ts')) continue

  var filePath = path.join(srcPath, file)
  var destFilePath = path.join(destPath, file)
  var fileContent = fs.readFileSync(filePath, 'utf8')
  var newFileContent = fileContent.replace(
    '"INSERT HTML HERE"',
    '`' + html + '`'
  )
  fs.writeFileSync(destFilePath, newFileContent, { encoding: 'utf8' })
}
