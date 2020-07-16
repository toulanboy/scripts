/**********
  🐬主要作者：Evilbutcher （签到、cookie等主体逻辑编写）
  📕地址：https://github.com/evilbutcher

  🐬次要作者: toulanboy （细节完善，支持多平台）
  📕地址：https://github.com/toulanboy/scripts

  🐬 另，感谢@Seafun、@jaychou、@柠檬精、@MEOW帮忙测试及提供建议。

  📌不定期更新各种签到、有趣的脚本，欢迎star🌟

  ***********************************
  【配置步骤，请认真阅读，每一个细节都很重要】
  ***********************************
  1. 根据你当前的软件，配置好srcipt。     Tips:由于是远程文件，记得顺便更新文件。
  2. 打开微博APP，”我的“， ”超话社区“， ”底部栏--我的“， ”关注“， 弹出通知，提示获取已关注超话链接成功。
  3. 点进一个超话页面，手动签到一次。弹出通知，提示获取超话签到链接成功。 若之前所有已经签到，请关注一个新超话进行签到。
  4. 回到quanx等软件，关掉获取cookie的rewrite。（loon是关掉获取cookie的脚本）

  📌 配置第2个账号方法：只需在第1个账号获取cookie结束后。在微博app中切换到第2个号，进行相同的获取逻辑即可。
   
   ***************************************
  【boxjs 订阅， 可以让你修改远程文件里面的变量】
  ***************************************
   box订阅链接：https://raw.githubusercontent.com/toulanboy/scripts/master/toulanboy.boxjs.json
   订阅后，可以在box里面进行 cookie清空、通知个数、签到延迟 等设置.


  *************************
  【Surge 4.2+ 脚本配置】
  *************************
  微博超话cookie获取 = type=http-request,pattern=^https:\/\/api\.weibo\.cn\/2\/(cardlist|page\/button),script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.cookie.js,requires-body=false
  微博超话 = type=cron,cronexp="5 0  * * *",script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.js,wake-system=true,timeout=600

  [MITM]
  hostname = api.weibo.cn

  *************************
  【Loon 2.1+ 脚本配置】
  *************************
  [script]
  cron "5 0 * * *" script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.js, timeout=600, tag=微博超话
  http-request ^https:\/\/api\.weibo\.cn\/2\/(cardlist|page\/button) script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.cookie.js,requires-body=false, tag=微博超话cookie获取
  
  [MITM]
  hostname = api.weibo.cn

  *************************
  【 QX 1.0.10+ 脚本配置 】 
  *************************
  [rewrite_local]
  ^https:\/\/api\.weibo\.cn\/2\/(cardlist|page\/button) url script-request-header https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.cookie.js

  [task]
  5 0 * * * https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.js, tag=微博超话

  [MITM]
  hostname = api.weibo.cn

  *********/

$ = new Env("微博超话")

/*
 * 可自定义的参数
 */
$.delete_cookie = false //若需要清空cookie，请把它置为true。清空完毕后，请重新置为false.
$.msg_max_num = 30 //一个通知显示30个超话的签到情况
$.time = 700 //【签到间隔，单位ms】，若超话过多，建议填1000ms以上。

if ($.getdata('wb_delete_cookie') != undefined) {
    if ($.getdata('wb_delete_cookie') == true || $.getdata('wb_delete_cookie') == 'true')
        $.delete_cookie = true
    else
        $.delete_cookie = false
}
if ($.getdata('wb_msg_max_num') != undefined) {
    if($.getdata('wb_msg_max_num') != "")
        $.msg_max_num = $.getdata('wb_msg_max_num') * 1
}
if ($.getdata('wb_request_time') != undefined) {
    if($.getdata('wb_request_time') != "")
        $.time = $.getdata('wb_request_time') * 1
}

debug = false
const tokenurl = "evil_tokenurl";
const tokencheckinurl = "evil_tokencheckinurl";
const tokenheaders = "evil_tokenheaders";
const tokencheckinheaders = "evil_tokencheckinheaders";
const tokenurl2 = "evil_tokenurl2";
const tokencheckinurl2 = "evil_tokencheckinurl2";
const tokenheaders2 = "evil_tokenheaders2";
const tokencheckinheaders2 = "evil_tokencheckinheaders2";


var listurl = $.getdata(tokenurl);
var listheaders = $.getdata(tokenheaders);
var checkinurl = $.getdata(tokencheckinurl);
var checkinheaders = $.getdata(tokencheckinheaders);

var listurl2 = $.getdata(tokenurl2);
var listheaders2 = $.getdata(tokenheaders2);
var checkinurl2 = $.getdata(tokencheckinurl2);
var checkinheaders2 = $.getdata(tokencheckinheaders2);

!(async () => {
  if ($.delete_cookie) {
    deleteCookie()
    $.done()
    return
  }
  $.count_num = 0;
  //判断当前是几个账号
  if (listurl == undefined || listurl == "" ||
    listheaders == undefined || listheaders == "" ||
    checkinurl == undefined || checkinurl == "" ||
    checkinheaders == undefined || checkinheaders == "") {
    $.msg($.name, "🚫cookie不完整 或 没有cookie", "🚫请认真阅读配置，按流程获取cookie。\n🔍若仍无法解决，请先清空cookie再获取。\n🔍如何清空？\n1️⃣本地文件：将文件内delete_cookie置为true。\n2️⃣远程文件：使用boxjs，在box内打开清空cookie开关")
    $.done()
    return
  } else {
    $.count_num = 1
  }
  if (!(listurl2 == undefined || listurl2 == "" ||
      listheaders2 == undefined || listheaders2 == "" ||
      checkinurl2 == undefined || checkinurl2 == "" ||
      checkinheaders2 == undefined || checkinheaders2 == "")) {
    $.count_num = 2;
  }
  console.log(`🌟 账号数 = ${$.count_num}`)
  for (var current = 1; current <= $.count_num; ++current) {
    init_env(current)
    await getnumber();
    for (var i = 1; i <= $.pagenumber; i++) {
      await getid(i);
    }
    for (var i in $.name_list) {
      if ($.stopNum < 10) {
        await checkin($.id_list[i], $.name_list[i]);
        $.wait($.time);
      } else {
        $.message.push(`🚨检测到Cookie失效，脚本已自动停止`);
        console.log(`🚨检测到Cookie失效，脚本已自动停止`);
        break;
      }
    }
    output(current)
  }
})()
.catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done()
  })

function init_env(current) {
  console.log(`🌟 清空环境，开始账号 ${current}`)
  $.message = [];
  $.name_list = []
  $.id_list = []
  $.val_list = []
  $.successNum = 0
  $.failNum = 0
  $.allnumber = 0;
  $.pagenumber = 0;
  $.stopNum = 0;
  if (current == 2) {
    listurl = listurl2
    listheaders = listheaders2
    checkinurl = checkinurl2
    checkinheaders = checkinheaders2
  }
}

function deleteCookie() {
  $.setdata("", tokenurl)
  $.setdata("", tokenheaders)
  $.setdata("", tokenurl2)
  $.setdata("", tokenheaders2)
  $.setdata("", tokencheckinurl)
  $.setdata("", tokencheckinheaders)
  $.setdata("", tokencheckinurl2)
  $.setdata("", tokencheckinheaders2)
  $.msg($.name, "", "✅已清空cookie。请将文件内delete_cookie置为false。\n🔍然后，按流程获取cookie。")
}

function output(current) {
  $.this_msg = ""
  for (var i = 1; i <= $.message.length; ++i) {
    if (i % ($.msg_max_num) == 0) {
      $.msg(`${$.name}${$.count_num==1?"":(current==1?"[账号一]":"[账号二]")}:  成功${$.successNum}个，失败${$.failNum}`, `当前第${Math.ceil(i/$.msg_max_num)}页 ，共${Math.ceil($.message.length/$.msg_max_num)}页`, $.this_msg)
      $.this_msg = ""
    }
    $.this_msg += `${$.message[i-1]}\n`
  }
  if ($.message.length % $.msg_max_num != 0) {
    $.msg(`${$.name}${$.count_num==1?"":(current==1?"[账号一]":"[账号二]")}:  成功${$.successNum}个，失败${$.failNum}`,  `当前第${Math.ceil((i-1)/$.msg_max_num)}页 ，共${Math.ceil($.message.length/$.msg_max_num)}页`, $.this_msg)
  }
}

function getnumber() {
  return new Promise((resove) => {
    var idrequest = {
      url: listurl,
      header: listheaders
    };
    // console.log(idrequest)
    $.get(idrequest, (error, response, data) => {
      var body = response.body;
      var obj = JSON.parse(body);
      // console.log(obj);
      $.allnumber = obj.cardlistInfo.total;
      console.log("当前已关注超话" + $.allnumber + "个");
      //  $.message.push(`当前已关注超话${allnumber}个`);
      $.pagenumber = Math.ceil($.allnumber / 20);
      //$notify("超话","",JSON.stringify($.message))
      resove();
    });
  });
}

//获取超话签到id
function getid(page) {
  var getlisturl = listurl.replace(
    new RegExp("&page=.*?&"),
    "&page=" + page + "&"
  );
  //console.log(getlisturl);
  var idrequest = {
    url: getlisturl,
    header: listheaders
  };
  // console.log(idrequest)
  return new Promise((resove) => {
    $.get(idrequest, (error, response, data) => {
      var body = response.body;
      var obj = JSON.parse(body);
      var group = obj.cards[0]["card_group"];
      number = group.length;
      for (i = 0; i < number; i++) {
        var name = group[i]["title_sub"];
        $.name_list.push(name)

        var val = group[i].desc;
        $.val_list.push(val)

        var id = group[i].scheme.slice(33, 71);
        $.id_list.push(id)
        if (debug) {
          console.log(name)
          console.log(val)
          console.log(id)
        }
        // checkin(id, name, val, time);
      }
      resove()
    })
  })
}




//签到
function checkin(id, name) {

  var sendcheckinurl = checkinurl
    .replace(new RegExp("&fid=.*?&"), "&fid=" + id + "&")
    .replace(new RegExp("pageid%3D.*?%26"), "pageid%3D" + id + "%26");
  var checkinrequest = {
    url: sendcheckinurl,
    header: checkinheaders
  };

  return new Promise(resolve => {
    $.get(checkinrequest, (error, response, data) => {
      //console.log(response)
      name = name.replace(/超话/, "")
      if ((response.statusCode == 418)) {
        $.failNum += 1
        $.message.push(`【${name}】："签到太频繁啦，请稍后再试"`);
        console.log(`【${name}】："签到太频繁啦，请稍后再试"`);
        if (debug) console.log(response)
      } else if (response.statusCode == 511) {
        $.failNum += 1;
        $.message.push(`【${idname}】：需要身份验证，请稍后再试`);
        console.log(`【${idname}】执行签到：需要身份验证，请稍后再试`);
      } else {
        var body = response.body;
        var obj = JSON.parse(body);
        //console.log(obj);
        var result = obj.result;
        //console.log(result);
        if (result == 1 || result == 382004) {
          $.successNum += 1;
        } else {
          $.failNum += 1;
        }
        if (result == 1) {
          $.message.push(`【${name}】：✅${obj.button.name}`)
          console.log(`【${name}】：${obj.button.name}`);
        } else if (result == 382004) {
          $.message.push(`【${name}】：✨今天已签到`);
          console.log(`【${name}】：${obj.error_msg}`);
        } else if (result == 388000) {
          $.message.push(`【${name}】："需要拼图验证⚠️请加大签到间隔"`);
          console.log(`【${name}】："需要拼图验证⚠️请加大签到间隔"`);
          if (debug) console.log(response)
        } else if (result == 382010) {
          $.message.push(`\n【${name}】："超话不存在⚠️"`);
          console.log(`【${name}】："超话不存在⚠️"`);
          if (debug) console.log(response)
        } else if (obj["errno"] == -100) {
          $.stopNum += 1;
          $.message.push(`【${idname}】：签到失败，请重新签到获取Cookie⚠️`);
          console.log(
            `【${idname}】执行签到：签到失败，请重新签到获取Cookie⚠️`
          );
        } else {
          $.message.push(`【${name}】："未知错误⚠️"`);
          console.log(`【${name}】："未知错误⚠️ 该请求的返回情况如下"`);
          console.log(response)
        }
      }
      resolve();
    })

  })
}

//@Chavy
function Env(s) {
  this.name = s, this.data = null, this.logs = [], this.isSurge = (() => "undefined" != typeof $httpClient), this.isQuanX = (() => "undefined" != typeof $task), this.isNode = (() => "undefined" != typeof module && !!module.exports), this.log = ((...s) => {
    this.logs = [...this.logs, ...s], s ? console.log(s.join("\n")) : console.log(this.logs.join("\n"))
  }), this.msg = ((s = this.name, t = "", i = "") => {
    this.isSurge() && $notification.post(s, t, i), this.isQuanX() && $notify(s, t, i);
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