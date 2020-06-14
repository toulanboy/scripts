/*
@toulanboy


配置教程正在写。

Quanx:
[rewrite]
https?:\/\/app.stoneread.com\/api\/apiClient\/index url script-request-body stone.js
[task]
4 0 * * * stone.js, tag=石头阅读, enabled=true
[mitm]
*.stoneread.com

配置步骤：
1、 先打开签到页面。若今天已经签到，请点击签到进入到具体页面。
2、 打开rewrite和MITM
3、 点击签到按钮。若今天已经签到，点击步骤1提到具体页面中的【日期】。
4、 提示获取会话到，先切换到quanx，关掉获取cookie的rewrite。
5、 手动跑脚本，测试脚本。

*/
const $ = new Env('石头阅读')

$.stone_headers = $.getdata("stone_headers")
$.stone_body = $.getdata("stone_body")

const debug = false

!(async () => {
  $.log('', `🔔 ${$.name}, 开始!`, '')
  if (typeof $request != "undefined") {
    await getCookie()
  }
  else {
    await checkin()
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.log('', `🔔 ${$.name}, 结束!`, ''), $.done()
  })

function getCookie() {
  const VAL_body = $request.body
  const VAL_headers = JSON.stringify($request.headers)
  if (VAL_body && VAL_headers) {
    $.setdata($request.body, 'stone_body')
    $.setdata(JSON.stringify($request.headers), 'stone_headers')
    $.msg("石头阅读", `获取会话成功`)
    if (debug) {
      console.log($.getdata("stone_body"))
      console.log($.getdata("stone_headers"))
    }
  }
}
function checkin() {
  const myRequest = {
    url: `https://app.stoneread.com/api/apiClient/index`,
    headers: `${JSON.parse($.stone_headers)}`,
    body: `${$.stone_body}`
  };
  return new Promise((resove) => {
    $.post(myRequest, (error, response, data) => {
      if (error) throw new Error(error)
      if (debug)
        console.log(response)

      rb = JSON.parse(response.body)
      const success = rb.success
      const result = rb.result.Message.messagestr
      console.log(result)
      if (success == 0)
        $.msg("📚石头阅读", `📌${result}`)
      else {
        $.msg("📚石头阅读", `📌签到成功`, `📌连续签到${rb.continuous}天\n📌共签到${rb.signcount}天\n📌当前拥有${rb.sumcretis}金币`)
      }
    })
  })
}

// prettier-ignore, @chavyleung
function Env(t) { this.name = t, this.logs = [], this.isSurge = (() => "undefined" != typeof $httpClient), this.isQuanX = (() => "undefined" != typeof $task), this.log = ((...t) => { this.logs = [...this.logs, ...t], t ? console.log(t.join("\n")) : console.log(this.logs.join("\n")) }), this.msg = ((t = this.name, s = "", i = "") => { this.isSurge() && $notification.post(t, s, i), this.isQuanX() && $notify(t, s, i), this.log("==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="), t && this.log(t), s && this.log(s), i && this.log(i) }), this.getdata = (t => this.isSurge() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : void 0), this.setdata = ((t, s) => this.isSurge() ? $persistentStore.write(t, s) : this.isQuanX() ? $prefs.setValueForKey(t, s) : void 0), this.get = ((t, s) => this.send(t, "GET", s)), this.wait = ((t, s = t) => i => setTimeout(() => i(), Math.floor(Math.random() * (s - t + 1) + t))), this.post = ((t, s) => this.send(t, "POST", s)), this.send = ((t, s, i) => { if (this.isSurge()) { const e = "POST" == s ? $httpClient.post : $httpClient.get; e(t, (t, s, e) => { s && (s.body = e, s.statusCode = s.status), i(t, s, e) }) } this.isQuanX() && (t.method = s, $task.fetch(t).then(t => { t.status = t.statusCode, i(null, t, t.body) }, t => i(t.error, t, t))) }), this.done = ((t = {}) => $done(t)) }

