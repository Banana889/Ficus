const { app, dialog } = require('electron')
const fs = require('fs-extra')
const path = require('path')
const { getTree } = require('./getFileTree')
// 根据用户输入的tag模糊匹配所有前缀相同的tag， 后端返回的对 [tag] 进行模糊匹配的结果 + 一个以 [tag] 为名称的新标签（如果模糊匹配结果中不包含名称 === [tag] 的标签）
exports.findTags = (tagName, folderPath) => {
  const res = []
  const basePath = path.join(folderPath, '.ficus')
  // const relationJSONFilePath = path.join(basePath, 'relation.json')
  const tagsJSONFilePath = path.join(basePath, 'tags.json')
  const rawData = fs.readFileSync(tagsJSONFilePath)
  const data = JSON.parse(rawData)
  const tags = data.tag2Files
  const len = tagName.length
  const lowTagName = tagName.toLowerCase()
  let hasTag = false
  // console.log(tagName)
  for (const tag of tags) {
    const pureTag = tag.tagName.replace(/[\r\n]/g, '')
    // console.log(pureTag)
    if (pureTag === tagName) {
      hasTag = true
    } else {
      const lowTag = pureTag.toLowerCase()
      if (lowTag.length >= len && lowTag.substring(0, len) === lowTagName) {
        res.push(pureTag)
      }
    }
  }
  if (hasTag) {
    res.push(tagName)
  }
  return res
}

// 根据用户输入的tag模糊匹配所有前缀相同的tag， 后端返回的对 [tag] 进行模糊匹配的结果 + 一个以 [tag] 为名称的新标签（如果模糊匹配结果中不包含名称 === [tag] 的标签）
exports.findTags = (tagName, folderPath) => {
  const res = []
  const basePath = path.join(folderPath, '.ficus')
  // const relationJSONFilePath = path.join(basePath, 'relation.json')
  const tagsJSONFilePath = path.join(basePath, 'tags.json')
  const rawData = fs.readFileSync(tagsJSONFilePath)
  const data = JSON.parse(rawData)
  const tags = data.tag2Files
  const len = tagName.length
  const lowTagName = tagName.toLowerCase()
  let hasTag = false
  console.log(tagName)
  for (const tag of tags) {
    const pureTag = tag.tagName.replace(/[\r\n]/g, '')
    console.log(pureTag)
    if (pureTag === tagName) {
      hasTag = true
    } else {
      const lowTag = pureTag.toLowerCase()
      if (lowTag.length >= len && lowTag.substring(0, len) === lowTagName) {
        res.push(pureTag)
      }
    }
  }
  if (hasTag) {
    res.push(tagName)
  }
  return res
}

// 对一个文件添加tag:
exports.addTag2File = (filePath, tagName, isNewTag, folderPath) => {
  const basePath = path.join(folderPath, '.ficus')
  // const relationJSONFilePath = path.join(basePath, 'relation.json')
  const tagsJSONFilePath = path.join(basePath, 'tags.json')
  const rawData = fs.readFileSync(tagsJSONFilePath)
  const tags = JSON.parse(rawData)
  let hasFile = false
  for (const file of tags.file2Tags) {
    if (file.path.replace(/[\r\n]/g, '') === filePath) {
      hasFile = true
      let f = false
      for (const tag of file.fileTags) {
        if (tag === tagName) {
          f = true
          break
        }
      }
      if (!f) {
        file.fileTags.push(tagName)
      }
      break
    }
  }
  if (isNewTag) {
    tags.tag2Files.push({ tagName, attach: [filePath] })
  }
  if (!hasFile) {
    const pathSplit = filePath.split('\\')
    const fName = pathSplit[pathSplit.length - 1]
    const file = { fileName: fName, path: filePath, fileTags: [tagName] }
    tags.file2Tags.push(file)
  }
  fs.writeFile(tagsJSONFilePath, JSON.stringify(tags), (error) => {
    // 创建失败
    if (error) {
      console.log(`Fail: ${error}`)
    }
    // 创建成功
    console.log('Success!')
  })
}

exports.initFromFolder = async () => {
  return await dialog.showOpenDialog({
    buttonLabel: '选择',
    defaultPath: app.getPath('desktop'),
    properties: ['createDirectory', 'openDirectory'],
    filters: [ // filters属性允许我们指定应用程序应该能够打开那些类型的文件，并禁止不符合我们标准的任何文件。
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
      { name: 'images', extensions: ['jpg', 'png'] }
    ]
  }).then(async (result) => {
    const relation = {
      version: 1,
      root: {
        path: result.filePaths[0],
        tree: {}
      }
    }
    const pathSplit = result.filePaths[0].split('\\')
    const folderName = pathSplit[pathSplit.length - 1]
    // console.log(result.filePaths[0])
    const tree = await getTree(result.filePaths[0], folderName)
    // console.log(tree)
    relation.root.tree = tree.children.filter(item => item.name !== '.ficus')
    relation.root.folderName = folderName
    // console.log(result)
    const basePath = path.join(result.filePaths[0], '.ficus')
    // console.log(basePath)
    fs.mkdir(basePath, { recursive: true }, err => {
      if (err) console.log(`mkdir path: ${basePath} err`)
    })
    const relationJSONFilePath = path.join(basePath, 'relation.json')
    const tagsJSONFilePath = path.join(basePath, 'tags.json')
    const linkJSONFilePath = path.join(basePath, 'link.json')
    fs.writeFile(relationJSONFilePath, JSON.stringify(relation), (error) => {
      // 创建失败
      if (error) {
        console.log(`Fail: ${error}`)
      }
      // 创建成功
      console.log('Success!')
    })
    const tags = { tag2Files: [], file2Tags: [] }
    fs.writeFile(tagsJSONFilePath, JSON.stringify(tags), (error) => {
      // 创建失败
      if (error) {
        console.log(`Fail: ${error}`)
      }
      // 创建成功
      console.log('Success!')
    })
    const links = { links: [] }
    fs.writeFile(linkJSONFilePath, JSON.stringify(links), (error) => {
      // 创建失败
      if (error) {
        console.log(`Fail: ${error}`)
      }
      // 创建成功
      console.log('Success!')
    })
    return relation
  })
}
