var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.get('/', function (req, res) {
  res.send('<h1>Welcome Realtime Server</h1>')
})

// 線上使用者
var onlineUsers = {}
// 當前線上人數
var onlineCount = 0

io.on('connection', function (socket) {
  console.log('a user connected')

  // 監聽新使用者加入
  socket.on('login', function (obj) {
    // 將新加入使用者的唯一標識當作socket的名稱，後面退出的時候會用到
    socket.name = obj.userid

    // 檢查線上列表，如果不在裡面就加入
    if (!onlineUsers.hasOwnProperty(obj.userid)) {
      onlineUsers[obj.userid] = obj.username
      // 線上人數+1
      onlineCount++
    }

    // 向所有客戶端廣播使用者加入
    io.emit('login', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj })
    console.log(obj.username + '加入了聊天室')
  })

  // 監聽使用者退出
  socket.on('disconnect', function () {
    // 將退出的使用者從線上列表中刪除
    if (onlineUsers.hasOwnProperty(socket.name)) {
      // 退出使用者的資訊
      var obj = { userid: socket.name, username: onlineUsers[socket.name] }

      // 刪除
      delete onlineUsers[socket.name]
      // 線上人數-1
      onlineCount--

      // 向所有客戶端廣播使用者退出
      io.emit('logout', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj })
      console.log(obj.username + '退出了聊天室')
    }
  })

  // 監聽使用者釋出聊天內容
  socket.on('message', function (obj) {
    // 向所有客戶端廣播發布的訊息
    io.emit('message', obj)
    console.log(obj.username + '說：' + obj.content)
  })
})

http.listen(3000, function () {
  console.log('listening on *:3000')
})
