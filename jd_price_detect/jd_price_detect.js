/**********
  🐬Author: Github@toulanboy 
  
  📕地址：https://github.com/toulanboy/scripts
  📌不定期更新各种签到、有趣的脚本，欢迎star🌟

  *************************
  【配置步骤，请认真阅读】
  *************************
  1. 根据你当前的软件，配置好srcipt。 Tips:由于是远程文件，记得顺便更新文件。
  2. 打开“慢慢买”app，点击左上角的“查历史价”，然后随便查询一件商品。弹出通知后，就拿到cookie了，这时候请回去关闭重写。
  3. 前往boxjs，填写你需要监控的京东链接和目标价格。请注意，链接和价格必须成对填写，缺一不可。（后期有空再加强容错性）
  
  请注意： 如果检测价格 高于 目标价格，则不会通知！但是日志里面有输出。


  *************************
  【Surge 4.2+ 脚本配置】
  *************************
  京东价格提醒cookie获取 = type=http-request,pattern=https:\/\/apapia-history\.manmanbuy\.com\/ChromeWidgetServices\/WidgetServices\.ashx,script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/jd_price_detect/jd_price_detect.js,requires-body=true
  京东价格提醒 = type=cron,cronexp="5 0 * * *",script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/jd_price_detect/jd_price_detect.js,wake-system=true,timeout=600

  [MITM]
  hostname = apapia-history.manmanbuy.com

  *************************
  【Loon 2.1+ 脚本配置】
  *************************
  [script]
  cron "5 0 * * *" script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/jd_price_detect/jd_price_detect.js, tag=京东价格提醒
  http-request https:\/\/apapia-history\.manmanbuy\.com\/ChromeWidgetServices\/WidgetServices\.ashx script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/jd_price_detect/jd_price_detect.js,requires-body=true, tag=京东价格提醒cookie获取
  
  [MITM]
  hostname = apapia-history.manmanbuy.com

  *************************
  【 QX 1.0.10+ 脚本配置 】 
  *************************
  [rewrite_local]
  https:\/\/apapia-history\.manmanbuy\.com\/ChromeWidgetServices\/WidgetServices\.ashx url script-request-body https://raw.githubusercontent.com/toulanboy/scripts/master/jd_price_detect/jd_price_detect.js

  [task]
  5 0 * * * https://raw.githubusercontent.com/toulanboy/scripts/master/jd_price_detect/jd_price_detect.js, tag=京东价格提醒

  [MITM]
  hostname = apapia-history.manmanbuy.com

  *********/


const $ = new Env('⏰ 京东价格提醒')

$.detect_days = 7
$.timeout = 3000 //超时限制，单位ms
$.debug = false

    !(async () => {
        $.log('', `🔔 ${$.name}, 开始!`, '')
        if (typeof $request != "undefined") {
            get_cookie()
            return
        }
        get_setting()
        if ($.detect_url.length == 0) {
            $.msg($.name, "", "🚫请前往BoxJs进行配置。")
            return
        }
        for (var i in $.detect_url)
            await get_price($.detect_url[i], $.target_price[i])
        $.done()
    })()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.log('', `🔔 ${$.name}, 结束!`, '')
        return
    })

function get_cookie() {
    headers = $request.headers
    body = $request.body
    if (body.indexOf('getHistoryTrend') != -1) {
        body = body.replace(/qs=(true|false)/, 'qs=true').replace(/bj=(true|false)/, 'bj=false').replace(/p_url=.*?&/, "p_url=loveyou&")
        $.setdata(JSON.stringify($request.headers), 'tlb_jd_headers')
        $.setdata(body, 'tlb_jd_body')
        $.msg($.name, '', '✅获取会话成功，该重写可以关闭了')
        if ($.debug) {
            $.log(`🔅headers如下`)
            $.log(JSON.stringify($request.headers))
            $.log(`🔅body如下`)
            $.log(body)
        }
    }
    $.done($request.body)
}

function get_setting() {
    $.detect_url = []
    $.target_price = []
    if ($.getdata('tlb_jd_detect_url') != undefined && $.getdata('tlb_jd_detect_url') != "") $.detect_url.push($.getdata('tlb_jd_detect_url'))
    if ($.getdata('tlb_jd_detect_url2') != undefined && $.getdata('tlb_jd_detect_url2') != "") $.detect_url.push($.getdata('tlb_jd_detect_url2'))
    if ($.getdata('tlb_jd_detect_url3') != undefined && $.getdata('tlb_jd_detect_url3') != "") $.detect_url.push($.getdata('tlb_jd_detect_url3'))
    if ($.getdata('tlb_jd_detect_price') != undefined && $.getdata('tlb_jd_detect_price') != "") $.target_price.push($.getdata('tlb_jd_detect_price') * 1)
    if ($.getdata('tlb_jd_detect_price2') != undefined && $.getdata('tlb_jd_detect_price2') != "") $.target_price.push($.getdata('tlb_jd_detect_price2') * 1)
    if ($.getdata('tlb_jd_detect_price3') != undefined && $.getdata('tlb_jd_detect_price3') != "") $.target_price.push($.getdata('tlb_jd_detect_price3') * 1)

    $.debug = JSON.parse($.getdata("tlb_jd_debug") || $.debug);
    $.detect_days = $.getdata("tlb_jd_detect_days") * 1 || $.detect_days;
    $.timeout = $.getdata("tlb_jd_timeout") * 1 || $.timeout;
    $.headers = $.getdata('tlb_jd_headers')
    $.body = $.getdata('tlb_jd_body')
}

function get_price(goods_url, target_price) {
    return new Promise((resolve) => {
        try {
            url1 = {
                url: `https://apapia-history.manmanbuy.com/ChromeWidgetServices/WidgetServices.ashx`,
                headers: $.headers
            }
            url1.body = $.body.replace(/t=\d*?&/, `t=${new Date().getTime()}&`).replace(/p_url=loveyou/, `p_url=${encodeURIComponent(goods_url)}`)
            $.post(url1, (error, response, data) => {
                if (error) {
                    if (debug) $.msg($.name, "", "🚫请求出现错误，具体看日志")
                    console.log("🚫请求出现错误，具体如下：")
                    console.log(error)
                    resolve()
                }
                if ($.debug) console.log(response)
                data = JSON.parse(response.body)
                title = data.single.title
                youhui = data.single.currentPriceyhStatus
                price_status = eval(data.single.jiagequshiyh.match(/.*(\[.*?\])$/)[1])
                result = `✨最新价格：${price_status[1]}元，已低于目标价格：${target_price}元。\n`
                result += `✨价格状态：${youhui}。\n`
                if (price_status[2] != "") result += `✨最新优惠：${price_status[1]}\n`
                if (price_status[1] <= target_price)
                    $.msg($.name, `商品：${title}`, result)
                else {
                    console.log(`✨商品：${title} 【没有低于目标价格${target_price}元】，不弹通知`)
                }
                resolve()
            })
        } catch (e) {
            console.log(e)
            resolve()
        }
        setTimeout(() => {
            console.log("🚨 (防长时间堵塞用)请求已达时间上限，已释放某函数。")
            resolve()
        }, $.timeout);
    })
}
// prettier-ignore, @chavyleung
function Env(s) {
    this.name = s, this.data = null, this.logs = [], this.isSurge = (() => "undefined" != typeof $httpClient), this.isQuanX = (() => "undefined" != typeof $task), this.isLoon = (() => "undefined" != typeof $loon), this.isNode = (() => "undefined" != typeof module && !!module.exports), this.log = ((...s) => {
        this.logs = [...this.logs, ...s], s ? console.log(s.join("\n")) : console.log(this.logs.join("\n"))
    }), this.msg = ((s = this.name, t = "", i = "", opts = "") => {
        this.isLoon() && $notification.post(s, t, i, opts), this.isSurge() && !this.isLoon() && $notification.post(s, t, i), this.isQuanX() && $notify(s, t, i, {
            "open-url": opts
        });
        const e = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];
        s && e.push(s), t && e.push(t), i && e.push(i), console.log(e.join("\n"))
    }), this.getdata = (s => {
        if (this.isSurge()) return $persistentStore.read(s);
        if (this.isQuanX()) return $prefs.valueForKey(s);
        if (this.isNode()) {
            const t = "box.dat";
            return this.fs = this.fs ? this.fs : require("fs"), this.fs.existsSync(t) ? (this.data = JSON.parse(this.fs.readFileSync(t)), this.data[s]) : null
        }
    }), this.setdata = ((s, t) => {
        if (this.isSurge()) return $persistentStore.write(s, t);
        if (this.isQuanX()) return $prefs.setValueForKey(s, t);
        if (this.isNode()) {
            const i = "box.dat";
            return this.fs = this.fs ? this.fs : require("fs"), !!this.fs.existsSync(i) && (this.data = JSON.parse(this.fs.readFileSync(i)), this.data[t] = s, this.fs.writeFileSync(i, JSON.stringify(this.data)), !0)
        }
    }), this.wait = ((s, t = s) => i => setTimeout(() => i(), Math.floor(Math.random() * (t - s + 1) + s))), this.get = ((s, t) => this.send(s, "GET", t)), this.post = ((s, t) => this.send(s, "POST", t)), this.send = ((s, t, i) => {
        if (this.isSurge()) {
            const e = "POST" == t ? $httpClient.post : $httpClient.get;
            e(s, (s, t, e) => {
                t && (t.body = e, t.statusCode = t.status), i(s, t, e)
            })
        }
        this.isQuanX() && (s.method = t, $task.fetch(s).then(s => {
            s.status = s.statusCode, i(null, s, s.body)
        }, s => i(s.error, s, s))), this.isNode() && (this.request = this.request ? this.request : require("request"), s.method = t, s.gzip = !0, this.request(s, (s, t, e) => {
            t && (t.status = t.statusCode), i(null, t, e)
        }))
    }), this.done = ((s = {}) => this.isNode() ? null : $done(s))
}