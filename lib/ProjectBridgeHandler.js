let singletonRequire = require('./SingletonRequirer.js')(runtime, global)
let FileUtils = singletonRequire('FileUtils')
let commonFunctions = singletonRequire('CommonFunction')
let AntForestDao = singletonRequire('AntForestDao')
let floatyInstance = singletonRequire('FloatyUtil')
let dateFormat = require('../lib/DateUtil.js')
let changeAccount = require('../lib/AlipayAccountManage.js')
let { config, default_config, storage_name, securityFields } = require('../config.js')(runtime, global)

module.exports = function (BaseHandler) {
  // 扩展方法 
  BaseHandler.loadProtectedList = (data, callbackId) => {
    let protectList = commonFunctions.getFullTimeRuntimeStorage('protectList').protectList || []
    protectList.forEach(protectInfo => protectInfo.timeout = dateFormat(new Date(protectInfo.timeout)))
    postMessageToWebView({ callbackId: callbackId, data: { protectList: protectList } })
  }
  BaseHandler.removeFromProtectList = (data, callbackId) => {
    log('移除保护罩使用记录：' + data.name)
    commonFunctions.removeFromProtectList(data.name)
    postMessageToWebView({ callbackId: callbackId, data: { success: true } })
  }
  BaseHandler.updateProtectList = (data, callbackId) => {
    log('更新保护罩使用信息:' + data.protectList)
    if (!data.protectList) {
      return
    }
    commonFunctions.updateProtectList(data.protectList.map(v => {
      v.timeout = new Date(v.timeout.replace(/-/g, '/')).getTime()
      return v
    }))
    postMessageToWebView({ callbackId: callbackId, data: { success: true } })
  }
  BaseHandler.startRainCollect = () => {
    BaseHandler.executeTargetScript("/unit/能量雨收集.js")
  }
  BaseHandler.checkIfInCooldown = (data, callbackId) => {
    postMessageToWebView({ callbackId: callbackId, data: { coolDownInfo: commonFunctions.checkIfNeedCoolDown() } })
  }
  BaseHandler.showRealtimeVisualConfig = () => {
    BaseHandler.executeTargetScript('/test/全局悬浮窗显示-配置信息.js')
  }
  BaseHandler.ocrInvokeCount = (data, callbackId) => {
    let invokeStorage = commonFunctions.getBaiduInvokeCountStorage()
    console.log(JSON.stringify(invokeStorage))
    postMessageToWebView({ callbackId: callbackId, data: '今日已调用次数:' + invokeStorage.count + (' 剩余:' + (500 - invokeStorage.count)) })
  }

  BaseHandler.pageCollectInfo = (data, callbackId) => {
    let pageResult = null
    if (data.groupByFriend) {
      pageResult = AntForestDao.pageGroupedCollectInfo(data)
    } else {
      pageResult = AntForestDao.pageCollectInfo(data)
      if (pageResult.result && pageResult.result.length > 0) {
        pageResult.result.forEach(collect => collect.createTime = dateFormat(collect.createTime))
      }
    }
    postMessageToWebView({ callbackId: callbackId, data: pageResult })
  }

  BaseHandler.getCollectSummary = (data, callbackId) => {
    let result = AntForestDao.getCollectSummary(data)
    postMessageToWebView({ callbackId: callbackId, data: result })
  }

  BaseHandler.getMyEnergyIncreased = (data, callbackId) => {
    let result = AntForestDao.getMyEnergyIncreased(data)
    postMessageToWebView({ callbackId: callbackId, data: { totalIncreased: result } })
  }

  BaseHandler.getMyEnergyByDate = (data, callbackId) => {
    let result = AntForestDao.getMyEnergyByDate(data)
    postMessageToWebView({ callbackId: callbackId, data: result })
  }

  BaseHandler.queryDailyCollectByDate = (data, callbackId) => {
    let result = AntForestDao.queryDailyCollectByDate(data.startDate, data.endDate)
    postMessageToWebView({ callbackId: callbackId, data: result })
  }

  BaseHandler.queryMyDailyEnergyByDate = (data, callbackId) => {
    let result = AntForestDao.queryMyDailyEnergyByDate(data.startDate, data.endDate)
    postMessageToWebView({ callbackId: callbackId, data: result })
  }

  BaseHandler.changeAlipayAccount = (data, callbackId) => {
    threads.start(function () {
      changeAccount(data.account)
      floatyInstance.close()
      commonFunctions.minimize()
    })
  }

  BaseHandler.getHMAccount = (data, callbackId) => {
    let HMAccountPath = '/sdcard/森林梦/小米运动账号.txt'
    let counti = 0
    if (files.exists(HMAccountPath)) {
      var file = open(HMAccountPath);
      var text = file.read();
      file.close();
      let HMAccountlist = text.split('\n');
      for (var i = 0; i < HMAccountlist.length; i++) {
        var t = HMAccountlist[i].split('----');
        if (t[1] && t[0]) {
          if (config.huami_account_lists.map(v => v.username).indexOf(t[0].replace(/\r/g, '')) < 0) {
            config.huami_account_lists.push({ username: t[0].replace(/\r/g, ''), password: t[1].replace(/\r/g, '') });
            counti++
          }
        }
      }
    } else {
      toastLog('账号文件不存在')
    }
    if (counti > 0) {
      toastLog("成功导入小米运动账号：" + counti + '个')
    } else {
      toastLog("所有账号已保存或账号文件为空！")
    }
    postMessageToWebView({ callbackId: callbackId, data: config.huami_account_lists })
  }

  let group_lists = [];
  BaseHandler.scanGroupList = (data, callbackId) => {
    console.show()
    start_app()
    if (config.intent_or_click == 'a') {
      group_lists_manager()
    } else if (config.intent_or_click == 'b') {
      mine_group()
    }
    Read_group_lists_by_scroll()
    console.log('====================')
    console.warn('提取完毕！共提取' + group_lists.length + '个')
    if (group_lists.length > 0) {
      toast("提取群组列表成功：" + group_lists.length + '个')
    } else {
      toast("提取群组列表失败！")
    }
    sleep(5000)
    console.hide()
    postMessageToWebView({ callbackId: callbackId, data: group_lists })
  }

  BaseHandler.addGroupToDdWateringGroups = (data, callbackId) => {
    if(config.DdWateringGroups.map(v => v.GroupName).indexOf(data.GroupName) < 0){
      config.DdWateringGroups.push(data)
      toast(data.GroupName + "加入小号浇水列表成功！")
    }else{
      toast(data.GroupName + "已经在小号浇水列表！")
    }
  }

  BaseHandler.addGroupToDdWateringGroupsEx = (data, callbackId) => {
    if(config.DdWateringGroupsEx.map(v => v.GroupName).indexOf(data.GroupName) < 0){
      config.DdWateringGroupsEx.push(data)
      toast(data.GroupName + "加入大号浇水列表成功！")
    }else{
      toast(data.GroupName + "已经在大号浇水列表！")
    }
  }
  function mine_group() {
    app.startActivity({
      action: "VIEW",
      data: "dingtalk://dingtalkclient/page/link?url=" + encodeURIComponent("https://qr.dingtalk.com/mine_group_conversation.html"),
    });
  }

  function Read_group_lists() {
    while (true) {
      if (idContains("tv_text").className("android.widget.TextView").text("我加入的").exists()) {
        var MyGroups = idContains("tv_text").className("android.widget.TextView").text("我加入的").findOne().parent().parent().parent()
        if (MyGroups.selected()) {
          //log("当前页面(我加入的)");
          log("检测中...请勿操作手机");
          var group_listlength = idContains("group_list").find().length
          idContains("group_list").find()[group_listlength - 1].children().forEach(child => {
            var target = child.findOne(id("group_title"));
            if (target) {
              if (target.text() != "") {
                if (group_lists.map(v => v.GroupName).indexOf(target.text()) < 0) {
                  group_lists.push({ GroupName: target.text(), WateringDate: '2122-01-01' })
                  console.verbose(target.text())
                }
              }
            }
          });
          break
        } else {
          MyGroups.click()
        }
      }
      sleep(500)
    }
  }

  function Read_group_lists_by_scroll() {
    var is_theEnd = false
    while (!is_theEnd) {
      Read_group_lists()
      if (idContains("group_list").exists()) {
        var group_listlength = idContains("group_list").find().length
        is_theEnd = !idContains("group_list").find()[group_listlength - 1].scrollDown()
        sleep(100)
      }
      sleep(200)
    }
  }
  function group_lists_manager() {
    while (!idContains("tv_title").className("android.widget.TextView").text("我的群组").exists()) {
      var txlTarget = idContains("home_bottom_tab_text_highlight").text('通讯录').findOne()
      if (txlTarget) { txlTarget.parent().parent().click() }
      sleep(500)
    }
    while (!idContains("tv_text").className("android.widget.TextView").text("我加入的").exists()) {
      var MyGroupsTarget = idContains("tv_title").className("android.widget.TextView").text("我的群组").findOne()
      if (MyGroupsTarget) { MyGroupsTarget.parent().parent().click() }
      sleep(500)
    }
  }
  function start_app() {
    log("正在启动app...");
    if (!(launchApp("钉钉") || launch('com.alibaba.android.rimet'))) //
    {
      log("找不到钉钉App!，请自己尝试打开");
      // return;
    }
    sleep(2000)
    //ZFB_SY()
    while (!packageName('com.alibaba.android.rimet').text("消息").exists()) {
      log("正在等待加载出主页，如果一直加载此信息，请手动返回主页，或者无障碍服务可能出现BUG，请停止运行App重新给无障碍服务");
      closeUpdata()
      clickBack()
      closePage()
      if (className("android.widget.TextView").text("钉钉小程序").exists()) { back() }
      sleep(2000);
    }
    log("启动app成功！");
    sleep(1000);
  }

  function closeUpdata() {
    if (text("暂不更新").exists() && text("更新").exists()) {
      text("暂不更新").click();
    }
  }

  function clickBack() {
    if (className("android.widget.ImageButton").desc("返回").exists()) {
      className("android.widget.ImageButton").desc("返回").click()
    }
    if (idContains("img_back").desc("返回").exists()) {
      idContains("img_back").desc("返回").findOnce().parent().click()
    }
    closePage()
  }

  function closePage() {
    if (idContains("close_layout").desc("关闭").exists()) {
      idContains("close_layout").desc("关闭").click()
    }
  }
  return BaseHandler
}
