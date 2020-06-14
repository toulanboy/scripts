> 📌 不定期更新各种签到、有趣的脚本，欢迎star🌟

### 配置步骤 （请先认真阅读配置，再进行操作）

**让同学们认真看的原因：石头阅读app所有内容共用1个接口，导致无法精确识别签到接口**

 1.  根据你当前的软件，配置好srcipt。Tips:由于是远程文件，记得顺便更新文件。
 2. 请【关闭】软件的 `MITM` 和` rewrite`。
 3.  打开石头阅读，点击签到。然后停留在当前页面（点击签到后的页面）。不要关闭。
 4. 请【打开】软件的 `MITM` 和 `rewrite`。
 5. 回到石头阅读，【迅速点击】今天的日期。到此，获取cookie成功。
 6. 请【回到】quanx，关掉获取cookie的rewrite。（loon是关掉获取cookie的脚本）

**测试cookie是否正确： 手动运行一遍签到，若提示重复签到，才是成功。否则，请重新执行上述2-6步，直到成功！**

### 配置文件
```c
Surge:
Rewrite: 石头阅读 = type=http-request,pattern=^https?:\/\/app.stoneread.com\/api\/apiClient\/index,script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/stoneread/stoneread.js,requires-body=true
Tasks: 石头阅读 = type=cron,cronexp="5 0  * * *",script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/stoneread/stoneread.js,wake-system=true,timeout=600
  
QuanX:
[rewrite]
^https?:\/\/app.stoneread.com\/api\/apiClient\/index url script-request-body https://raw.githubusercontent.com/toulanboy/scripts/master/stoneread/stoneread.js
[task]
5 0 * * * https://raw.githubusercontent.com/toulanboy/scripts/master/stoneread/stoneread.js, img-url=https://raw.githubusercontent.com/Orz-3/task/master/stone.png, tag=石头阅读
  
Loon:
[script]
cron "5 0 * * *" script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/stoneread/stoneread.js, timeout=600, tag=石头阅读
http-request ^https?:\/\/app.stoneread.com\/api\/apiClient\/index script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/stoneread/stoneread.js,requires-body=true, tag=石头阅读cookie获取
 
[MITM]
hostname = *.stoneread.com
```

### 内容声明

该javascript仅供交流学习使用，禁止用于非法用于和商业用途，请在使用24小时内删除。



