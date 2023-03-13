#!/bin/bash
cd node
npm install
npm run build
scp -rp root@192.46.234.106:/root/public $PWD/public
npx pkg .
mkdir out-linux
mkdir out-macos
mkdir out-win
mkdir download
mv codechart-linux out-linux/
mv codechart-macos out-macos/
mv codechart-win.exe out-win/
cp -r config out-linux/
cp -r config out-macos/
cp -r config out-win/
cp pkg-readme.txt out-linux/readme.txt
cp pkg-readme.txt out-macos/readme.txt
cp pkg-readme.txt out-win/readme.txt
tar -czvf download/code-chart-linux.tar.gz -C out-linux $(ls out-linux)
tar -czvf download/code-chart-mac.tar.gz -C out-macos $(ls out-macos)
cd out-win
zip -r ../download/code-chart-win.zip $(ls)
cd ..
rsync -r download/ root@192.46.234.106:/root/website/download