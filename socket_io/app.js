const express = require('express')
const path = require('path')
const app = express()
// 使用靜態資源訪問,public為根目錄
app.use(express.static(path.join(__dirname, 'public')))

app.listen(8080, () => {
  console.log('App listening at port 8080')
})
