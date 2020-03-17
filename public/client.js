(function () {
  var d = document
  var w = window
  var p = parseInt
  var dd = d.documentElement
  var db = d.body
  var dc = d.compatMode == 'CSS1Compat'
  var dx = dc ? dd : db
  var ec = encodeURIComponent

  w.CHAT = {
    msgObj: d.getElementById('message'),
    screenheight: w.innerHeight ? w.innerHeight : dx.clientHeight,
    username: null,
    userid: null,
    socket: null,
    // 讓瀏覽器滾動條保持在最低部
    scrollToBottom: function () {
      w.scrollTo(0, this.msgObj.clientHeight)
    },
    // 退出，本例只是一個簡單的重新整理
    logout: function () {
      // this.socket.disconnect();
      location.reload()
    },
    // 提交聊天訊息內容
    submit: function () {
      var content = d.getElementById('content').value
      if (content != '') {
        var obj = {
          userid: this.userid,
          username: this.username,
          content: content
        }
        this.socket.emit('message', obj)
        d.getElementById('content').value = ''
      }
      return false
    },
    genUid: function () {
      return new Date().getTime() + '' + Math.floor(Math.random() * 899 + 100)
    },
    // 更新系統訊息，本例中在使用者加入、退出的時候呼叫
    updateSysMsg: function (o, action) {
      // 當前線上使用者列表
      var onlineUsers = o.onlineUsers
      // 當前線上人數
      var onlineCount = o.onlineCount
      // 新加入使用者的資訊
      var user = o.user

      // 更新線上人數
      var userhtml = ''
      var separator = ''
      for (key in onlineUsers) {
        if (onlineUsers.hasOwnProperty(key)) {
          userhtml += separator + onlineUsers[key]
          separator = '、'
        }
      }
      d.getElementById('onlinecount').innerHTML = '當前共有 ' + onlineCount + ' 人線上，線上列表：' + userhtml

      // 新增系統訊息
      var html = ''
      html += '<div class="msg-system">'
      html += user.username
      html += (action == 'login') ? ' 加入了聊天室' : ' 退出了聊天室'
      html += '</div>'
      var section = d.createElement('section')
      section.className = 'system J-mjrlinkWrap J-cutMsg'
      section.innerHTML = html
      this.msgObj.appendChild(section)
      this.scrollToBottom()
    },
    // 第一個介面使用者提交使用者名稱
    usernameSubmit: function () {
      var username = d.getElementById('username').value
      if (username != '') {
        d.getElementById('username').value = ''
        d.getElementById('loginbox').style.display = 'none'
        d.getElementById('chatbox').style.display = 'block'
        this.init(username)
      }
      return false
    },
    init: function (username) {
      /*
      客戶端根據時間和隨機數生成uid,這樣使得聊天室使用者名稱稱可以重複。
      實際專案中，如果是需要使用者登入，那麼直接採用使用者的uid來做標識就可以
      */
      this.userid = this.genUid()
      this.username = username

      d.getElementById('showusername').innerHTML = this.username
      this.msgObj.style.minHeight = (this.screenheight - db.clientHeight + this.msgObj.clientHeight) + 'px'
      this.scrollToBottom()

      // 連線websocket後端伺服器
      this.socket = io.connect('ws://localhost:3000/')

      // 告訴伺服器端有使用者登入
      this.socket.emit('login', { userid: this.userid, username: this.username })

      // 監聽新使用者登入
      this.socket.on('login', function (o) {
        CHAT.updateSysMsg(o, 'login')
      })

      // 監聽使用者退出
      this.socket.on('logout', function (o) {
        CHAT.updateSysMsg(o, 'logout')
      })

      // 監聽訊息傳送
      this.socket.on('message', function (obj) {
        var isme = (obj.userid == CHAT.userid)
        var contentDiv = '<div>' + obj.content + '</div>'
        var usernameDiv = '<span>' + obj.username + '</span>'

        var section = d.createElement('section')
        if (isme) {
          section.className = 'user'
          section.innerHTML = contentDiv + usernameDiv
        } else {
          section.className = 'service'
          section.innerHTML = usernameDiv + contentDiv
        }
        CHAT.msgObj.appendChild(section)
        CHAT.scrollToBottom()
      })
    }
  }
  // 通過“回車”提交使用者名稱
  d.getElementById('username').onkeydown = function (e) {
    e = e || event
    if (e.keyCode === 13) {
      CHAT.usernameSubmit()
    }
  }
  // 通過“回車”提交資訊
  d.getElementById('content').onkeydown = function (e) {
    e = e || event
    if (e.keyCode === 13) {
      CHAT.submit()
    }
  }
})()
