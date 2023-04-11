const { app, dialog } = require('electron')
const fs = require('fs-extra')
const path = require('path')
// 新建项目的数据库初始化：
exports.initFromEmptyFolder = async (projName) => {
  dialog.showOpenDialog({
    buttonLabel: '选择',
    defaultPath: app.getPath('desktop'),
    properties: ['createDirectory', 'openDirectory'],
    filters: [ // filters属性允许我们指定应用程序应该能够打开那些类型的文件，并禁止不符合我们标准的任何文件。
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
      { name: 'images', extensions: ['jpg', 'png'] }
    ]
  }).then((result) => {
    console.log(result)
    return result
    // const basePath = path.join(result.filePaths[0], '.ficus')
    // console.log(basePath)
    // fs.mkdir(basePath, { recursive: true }, err => {
    //   if (err) console.log(`mkdir path: ${basePath} err`)
    // })
    // const relationJSONFilePath = path.join(basePath, 'relation.json')
    // const relation = {
    //   version: 1,
    //   root: {
    //     name: projName,
    //     path: result.filePaths[0],
    //     children: [],
    //     tags: [],
    //     links: []
    //   }
    // }
    // getTree()
    // fs.writeFile(relationJSONFilePath, JSON.stringify(relation), (error) => {
    //   // 创建失败
    //   if (error) {
    //     console.log(`创建失败：${error}`)
    //   }
    //   // 创建成功
    //   console.log('创建成功！')
    // })
    // const str = JSON.stringify(relation)
    // return str
  })
}

// 从已有文件夹创建项目时的数据库初始化：
exports.initFromSelectedFolder = async (projName) => {
  dialog.showOpenDialog({
    buttonLabel: '选择',
    defaultPath: app.getPath('desktop'),
    properties: ['createDirectory', 'openDirectory'],
    filters: [ // filters属性允许我们指定应用程序应该能够打开那些类型的文件，并禁止不符合我们标准的任何文件。
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
      { name: 'images', extensions: ['jpg', 'png'] }
    ]
  }).then((result) => {
    const basePath = path.join(result.filePaths[0], '.ficus')
    fs.mkdir(basePath, { recursive: true }, err => {
      if (err) console.log(`mkdir path: ${basePath} err`)
    })
    const relationJSONFilePath = path.join(basePath, 'relation.json')
    const relation = {
      version: 1,
      root: {
        name: projName,
        path: result.filePaths[0],
        children: [],
        tags: [],
        links: []
      }
    }
    fs.writeFile(relationJSONFilePath, JSON.stringify(relation), (error) => {
      // 创建失败
      if (error) {
        console.log(`创建失败：${error}`)
      }
      // 创建成功
      console.log('创建成功！')
    })
    const str = JSON.stringify(relation)
    return str
  })
}
