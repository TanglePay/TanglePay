const path = require('path')
const fs = require('fs-extra')
const klawSync = require('klaw-sync')
const env = process.env.npm_lifecycle_event.split('-')[1]
const otherEnv = env === 'app' ? 'browser' : 'app'

const reg = new RegExp(`\\.${otherEnv}\\.`)
const filterFn = (item) => {
    return !reg.test(item.path)
}

const sourcePath = path.resolve(__dirname, './src')
const paths = klawSync(sourcePath, { filter: filterFn, nodir: true, traverseAll: true })
paths.forEach((e) => {
    const toPath = e.path.replace('src', `lib/${env}`).replace(`.${env}`, '')
    fs.copy(e.path, toPath, () => {})
})



paths.forEach((e) => {
    const toPath = e.path.replace('src', `../TanglePay-Mobile/node_modules/tanglepay/lib/${env}`).replace(`.${env}`, '')
    fs.copy(e.path, toPath, () => {})
})

paths.forEach((e) => {
     const toPath = e.path
         .replace('src', `../TanglePay-Extension/node_modules/tanglepay/lib/${env}`)
         .replace(`.${env}`, '')
     fs.copy(e.path, toPath, () => {})
 })

