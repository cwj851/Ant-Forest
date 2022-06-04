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
    postMessageToWebView({ callbackId: callbackId, data: config.huami_account_lists})
  }

  return BaseHandler
}
