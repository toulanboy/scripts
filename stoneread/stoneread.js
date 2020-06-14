/**
 * @toulanboy 、@PENG-YM
 * 
 * 📕地址：https://github.com/toulanboy/scripts
 * 📌不定期更新各种签到、有趣的脚本，欢迎star🌟
 * 
 * 【请先认真阅读以下内容，再进行操作】
 *  让同学们认真看的原因：石头阅读只有1个接口，导致无法精确识别签到接口。
 * 
 * 1、 根据你当前的软件，配置好srcipt。Tips:由于是远程文件，记得顺便更新文件。
 * 2、 请【关闭】软件的 MITM 和 rewrite。
 * 3、 打开石头阅读，点击签到。然后停留在当前页面（点击签到后的页面）。不要关闭。
 * 4、 请【打开】软件的 MITM 和 rewrite。
 * 5、 回到石头阅读，【迅速点击】今天的日期。到此，获取cookie成功。
 * 6、 请【回到】quanx，关掉获取cookie的rewrite。（loon是关掉获取cookie的脚本）
 * 
 * 📌 测试cookie是否正确： 手动运行一遍签到，若提示重复签到，则成功。否则，请重新执行上述2-6步，直到成功！
 * 
 * Surge:
 * Rewrite: 石头阅读 = type=http-request,pattern=^https?:\/\/app.stoneread.com\/api\/apiClient\/index,script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/stoneread/stoneread.js,requires-body=true
 * Tasks: 石头阅读 = type=cron,cronexp="5 0 * * *",script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/stoneread/stoneread.js,wake-system=true,timeout=600
 * 
 * QuanX:
 * [rewrite]
 * ^https?:\/\/app.stoneread.com\/api\/apiClient\/index url script-request-body https://raw.githubusercontent.com/toulanboy/scripts/master/stoneread/stoneread.js
 * [task]
 * 5 0 * * * https://raw.githubusercontent.com/toulanboy/scripts/master/stoneread/stoneread.js, img-url=https://raw.githubusercontent.com/Orz-3/task/master/stone.png, tag=石头阅读
 * 
 * Loon:
 * [script]
 * cron "5 0 * * *" script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/stoneread/stoneread.js, timeout=600, tag=石头阅读
 * http-request ^https?:\/\/app.stoneread.com\/api\/apiClient\/index script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/stoneread/stoneread.js,requires-body=true, tag=石头阅读cookie获取
 *
 * [MITM]
 * hostname = *.stoneread.com
 */
const $ = new Env('📚石头阅读')

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
      else if(success == 1){
        $.msg("📚石头阅读", `📌${result}`, `📌连续签到${rb.continuous}天\n📌共签到${rb.signcount}天\n📌当前拥有${rb.sumcretis}金币`)
      }
      else {
        $.msg("📚石头阅读", `📌${result}`, `🔅无法识别签到数据，请联系扫地工 -> Github@toulanboy`)
      }
    })
  })
}

// prettier-ignore, @chavyleung
function Env(t) { this.name = t, this.logs = [], this.isSurge = (() => "undefined" != typeof $httpClient), this.isQuanX = (() => "undefined" != typeof $task), this.log = ((...t) => { this.logs = [...this.logs, ...t], t ? console.log(t.join("\n")) : console.log(this.logs.join("\n")) }), this.msg = ((t = this.name, s = "", i = "") => { this.isSurge() && $notification.post(t, s, i), this.isQuanX() && $notify(t, s, i), this.log("==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="), t && this.log(t), s && this.log(s), i && this.log(i) }), this.getdata = (t => this.isSurge() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : void 0), this.setdata = ((t, s) => this.isSurge() ? $persistentStore.write(t, s) : this.isQuanX() ? $prefs.setValueForKey(t, s) : void 0), this.get = ((t, s) => this.send(t, "GET", s)), this.wait = ((t, s = t) => i => setTimeout(() => i(), Math.floor(Math.random() * (s - t + 1) + t))), this.post = ((t, s) => this.send(t, "POST", s)), this.send = ((t, s, i) => { if (this.isSurge()) { const e = "POST" == s ? $httpClient.post : $httpClient.get; e(t, (t, s, e) => { s && (s.body = e, s.statusCode = s.status), i(t, s, e) }) } this.isQuanX() && (t.method = s, $task.fetch(t).then(t => { t.status = t.statusCode, i(null, t, t.body) }, t => i(t.error, t, t))) }), this.done = ((t = {}) => $done(t)) }

