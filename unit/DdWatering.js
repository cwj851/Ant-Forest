let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, global)
const resolver = require('../lib/AutoJSRemoveDexResolver.js')
let automator = singletonRequire('Automator')
let AntForestDao = singletonRequire('AntForestDao')
let logUtils = singletonRequire('LogUtils')
let dateFormat = require('../lib/DateUtil.js')
var { default_config, config, storage_name: _storage_name } = require('../config.js')(runtime, global)
let _commonFunctions = singletonRequire('CommonFunction')
let fileUtils = singletonRequire('FileUtils')
let runningQueueDispatcher = singletonRequire('RunningQueueDispatcher')
let args = engines.myEngine().execArgv
//let callStateListener = !config.is_pro && config.enable_call_state_control ? singletonRequire('CallStateListener') : { exitIfNotIdle: () => { } }

//let Dream = require('./ConSole.js')
let group_lists = [];
let watered_group = [];
let water_lists = [];
let skip_lists = [];
let watercount = 0;
let waterGroupcount = 0;
let account = [];
let Account_Change_bandage = []
let is_Master_Account = false
var change_water_Num;
var wateringNum;
let stopListenThread = null
/* let default_config = {
    water_keywords: '',                
    skip_keywords: '', 
    water_Num:500,
};
let config = default_config; */
console.log('======尝试加入任务队列，并关闭重复运行的脚本=======')
// 加入任务队列
runningQueueDispatcher.addRunningTask()
_commonFunctions.killDuplicateScript()
console.log('======加入任务队列成功=======')

events.on('exit', function () {
    config.isRunning = false
  })
  //callStateListener.exitIfNotIdle()
  // 注册自动移除运行中任务
  _commonFunctions.registerOnEngineRemoved(function () {
    config.resetBrightness && config.resetBrightness()
    //debugInfo('校验并移除已加载的dex')
    resolver()
    //flushAllLogs()
    // 减少控制台日志数量，避免内存泄露，仅免费版有用
    _commonFunctions.reduceConsoleLogs()
    // 移除运行中任务
    runningQueueDispatcher.removeRunningTask(true, true,
      () => {
        config.isRunning = false
      }
    )
  }, 'DdWatering')

water_lists = config.water_keywords.split('|')
skip_lists = config.skip_keywords.split('|')

let FloatyInstance = singletonRequire('FloatyUtil')
// 初始化悬浮窗
if (config.show_small_floaty) {
  if (!FloatyInstance.init()) {
    runningQueueDispatcher.removeRunningTask()
    sleep(6000)
    console.error('悬浮窗初始化失败, 请查看悬浮窗权限！')
    before_exit_hander()
    setTimeout(() => { exit() }, 1000 * 5)
  }
  // 自动设置刘海偏移量
  _commonFunctions.autoSetUpBangOffset()
}

function interruptStopListenThread() {
    if (stopListenThread !== null) {
        stopListenThread.interrupt()
        stopListenThread = null
    }
}
  /**
 * 监听音量上键直接关闭 音量下延迟5分钟
 */
function listenStopCollect() {
    interruptStopListenThread()
    stopListenThread = threads.start(function () {
        toast('即将开始运行，运行中可按音量上键关闭', true)
        events.removeAllKeyDownListeners('volume_down')
        events.observeKey()
        events.on("key_down", function (keyCode, event) {
            let stop = false
            if (keyCode === 24) {
                stop = true
                //warnInfo('关闭脚本', true)
                _commonFunctions.cancelAllTimedTasks()
            } else if (keyCode === 25) {
                //warnInfo('延迟五分钟后启动脚本', true)
                _commonFunctions.setUpAutoStart(5)
                stop = true
            }
            if (stop) {
                runningQueueDispatcher.removeRunningTask()
                config.resetBrightness && config.resetBrightness()
                setTimeout(() => { exit() }, 1000 * 5)
            }
        })
    })
}

function floaty_show_text(text) {
    if (config.show_small_floaty) {
      _commonFunctions.showTextFloaty(">>>"+text)
    }
}

function before_exit_hander(){
    interruptStopListenThread()
    events.removeAllListeners('key_down')
    if ((config.auto_lock && args.needRelock)==true) {
        log('重新锁定屏幕')
        automator.lockScreen()
      }
    runningQueueDispatcher.removeRunningTask()
      _commonFunctions.reduceConsoleLogs()
}

function delay(seconds) {
    sleep(1000 * seconds); //sleep函数参数单位为毫秒所以乘1000
}
/**
 * @description: 启动app
 * @param: null
 * @return: null
 */

function start_app() {
    //console.setPosition(0, device.height / 20); //部分华为手机console有bug请注释本行
    // console.show(); //部分华为手机console有bug请注释本行
    logUtils.debugInfo("正在启动app...");
    floaty_show_text("正在启动app...")
    if (!(launchApp("钉钉") || launch('com.alibaba.android.rimet'))) //
    {
        logUtils.errorInfo("找不到钉钉App!，请自己尝试打开");
        floaty_show_text("找不到钉钉App!，请自己尝试打开")
        // return;
    }
    delay(2)
    //ZFB_SY()
    while (!packageName('com.alibaba.android.rimet').text("消息").exists()) {
        logUtils.logInfo("正在等待加载出主页，如果一直加载此信息，请手动返回主页，或者无障碍服务可能出现BUG，请停止运行App重新给无障碍服务");
        closeUpdata()
        clickBack()
        closePage()
        if (className("android.widget.TextView").text("钉钉小程序").exists()) { back() }
        delay(2);
    }
    logUtils.infoLog("启动app成功！");
    floaty_show_text("启动app成功！")
    delay(1);
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

function openPage() {
    if (textContains("取消").exists() && textContains("打开").exists()) {
        text("打开").click();
    }
}
/**
 * 主线程
 */
var _golThread;
var _conThread;

function main() {
    if (config.is_watering) {
        if (config.water_mode == "1") {
            wateringNum = -1
        } else if (config.water_mode == "2") {
            wateringNum = 500
        } else if (config.water_mode == "3") {
            if (!config.water_Num || config.water_Num < 0) config.water_Num = 500;
            wateringNum = config.water_Num
        }
    }
    if (config.change_bandage) {
        if (config.water_pattern == "2") {
            if (config.Master_Account && config.Master_Account != '') {
            } else {
                logUtils.errorInfo("大号账号未设置，请先完成设置再运行！")
                toast("大号账号未设置，请先完成设置再运行！")
                sleep(3000)
                before_exit_hander()
                setTimeout(() => { exit() }, 1000 * 5)
            }
            if (!config.change_water_Num || config.change_water_Num < 500) config.change_water_Num = 500;
            change_water_Num = config.change_water_Num
            //killApp("支付宝")
            if (prepare_for_changed()) {
            } else {
                sleep(3000)
                before_exit_hander()
                setTimeout(() => { exit() }, 1000 * 5)
            }
        } else {
            logUtils.errorInfo("换绑小号浇水仅支持群组列表模式浇水！请重新设置！");
            toast("换绑小号浇水仅支持群组列表模式浇水！请重新设置！")
            sleep(3000)
            before_exit_hander()
            setTimeout(() => { exit() }, 1000 * 5)
        }
    }

/*     _conThread = threads.start(function () {
        Dream.ConSole()
    }) */
    _golThread = threads.start(function () {
        //killApp("钉钉")
        //console.show();
        start_app()
        sleep(1000)
        if (config.intent_or_click == 'a') {
            group_lists_manager()
        } else if (config.intent_or_click == 'b') {
            mine_group()
        }

        delay(1);
        if (config.water_pattern == "2") {//列表浇水

            watering_by_grouplists()
            sleep(1000)
            watering_by_grouplists_EX()
        } else if (config.water_pattern == "1") {//关键词浇水
            watering_by_keywords()
        }
        if (config.pushplus && config.pushplus_token != '') { push_watering_today() }
        floaty_show_text("线程结束！本次浇水已完成！")
        logUtils.errorInfo("线程结束！本次浇水已完成！");
        logUtils.infoLog("共操作" + watered_group.length + "个群");
        logUtils.infoLog("今日浇水：" + waterGroupcount + "个群");
        logUtils.infoLog("总浇水量：" + watercount + "g");
        logUtils.logInfo("====================");
        //Dream.close()
        sleep(2000)
        home()
        before_exit_hander()
        try{setTimeout(() => { exit() }, 1000 * 5);}catch(e){}
    })
}

function watering_by_grouplists_EX() {
    config.DdGroups_list_Ex = []
    for (var k = 0; k < config.DdWateringGroupsEx.length; k++) {
        if (InDate(config.DdWateringGroupsEx[k].WateringDate)) {
            config.DdGroups_list_Ex.push(config.DdWateringGroupsEx[k].GroupName)
        }
    }
    for (var j = 0; j < config.DdGroups_list_Ex.length; j++) {
        if (search_groupsAndclick(config.DdGroups_list_Ex[j])) {
            watered_group.push(config.DdGroups_list_Ex[j])
            logUtils.infoLog('群名：' + config.DdGroups_list_Ex[j]);
            if (config.is_watering) {
                while (!idContains("tv_title").textContains(config.DdGroups_list_Ex[j]).exists()) { }
                watering_Ex(config.DdGroups_list_Ex[j], wateringNum)
            }
            if (config.No_interruptions) { open_No_interruptions() }
            if (config.sticky) { open_sticky() }
            logUtils.logInfo("====================");
            if (config.intent_or_click == 'a') {
                back_to_group_search()
            } else if (config.intent_or_click == 'b') {
                mine_group()
            }
        }

    }
}

function watering_by_grouplists() {
/*     let Group_list=config.DdGroups_list
    let Group_list_length=Group_list.length */
    config.DdGroups_list = []
    for (var k = 0; k < config.DdWateringGroups.length; k++) {
        if (InDate(config.DdWateringGroups[k].WateringDate)) {
            config.DdGroups_list.push(config.DdWateringGroups[k].GroupName)
        }
    }
    for (var j = 0; j < config.DdGroups_list.length; j++) {
        //logUtils.debugInfo(['当前浇水群序号：{}' ,j])
        if (search_groupsAndclick(config.DdGroups_list[j])) {
            watered_group.push(config.DdGroups_list[j])
            logUtils.infoLog('群名：' + config.DdGroups_list[j]);
            if (config.is_watering) {
                while (!idContains("tv_title").textContains(config.DdGroups_list[j]).exists()) { }
                if (config.change_bandage) {
                    if (j == 0) {
                        if (DingTalk_Change_bandage(false)) {
                        } else {
                            sleep(3000)
                            before_exit_hander()
                            setTimeout(() => { exit() }, 1000 * 5)
                        }
                    }
                    watering(config.DdGroups_list[j], wateringNum)
                    if (j == (config.DdGroups_list.length - 1)) {
                        if (is_Master_Account) {
                            logUtils.warnInfo("小号浇水完毕已经是大号无需再换绑");
                            floaty_show_text("小号浇水完毕已经是大号无需再换绑")
                        } else {
                            logUtils.warnInfo("小号浇水完毕准备换绑回大号...");
                            floaty_show_text("小号浇水完毕准备换绑回大号...")
                            if (DingTalk_Change_bandage(true)) { } else {
                                sleep(3000)
                                before_exit_hander()
                                setTimeout(() => { exit() }, 1000 * 5)
                            }
                            sleep(2000)
                            closePage()
                        }
                    }
                } else {
                    watering_Ex(Group_list[j], wateringNum)
                }
            }
            if (config.No_interruptions) { open_No_interruptions() }
            if (config.sticky) { open_sticky() }
            logUtils.logInfo("====================");
            if (config.intent_or_click == 'a') {
                back_to_group_search()
            } else if (config.intent_or_click == 'b') {
                mine_group()
            }
        }
    }
}

function InDate(Datestr) {
    var oDate1 = new Date();
    var oDate2 = new Date(Datestr);
    if(oDate1.getTime() > (oDate2.getTime()-8*60*60*1000)){
        return false
    } else {
        return true
    }
}

function watering_by_keywords() {
    var is_theEnd = false
    while (!is_theEnd) {
        Read_group_lists()
        if (group_lists.length > 0) {
            for (var i = 0; i < group_lists.length; i++) {
                if (is_watered(group_lists[i])) {
                } else {
                    if (is_water(group_lists[i])) {
                        //log(group_lists[i]+'需要浇水')
                        if (is_skip(group_lists[i])) {
                        } else {
                            CheckGroupNameAndClick(group_lists[i])
                            watered_group.push(group_lists[i])
                            logUtils.infoLog('群名：' + group_lists[i]);
                            floaty_show_text('群名：' + group_lists[i])
                            if (config.is_watering) {
                                watering(group_lists[i], wateringNum)
                            }
                            if (config.No_interruptions) { open_No_interruptions() }
                            if (config.sticky) { open_sticky() }
                            logUtils.logInfo("====================");
                            back_to_group_lists()
                        }
                    }
                }
            }
        }
        if (idContains("group_list").exists()) {
            is_theEnd = idContains("group_list").scrollDown()
            sleep(1000)
        }
        sleep(500)
    }
}

function group_lists_manager() {
    while (!idContains("tv_title").className("android.widget.TextView").text("我的群组").exists()) {
        var txlTarget = idContains("home_bottom_tab_text_highlight").text('通讯录').findOnce()
        if (txlTarget) { txlTarget.parent().parent().click() }
        sleep(500)
    }
    while (!idContains("tv_text").className("android.widget.TextView").text("我加入的").exists()) {
        var MyGroupsTarget = idContains("tv_title").className("android.widget.TextView").text("我的群组").findOnce()
        if (MyGroupsTarget) { MyGroupsTarget.parent().parent().click() }
        sleep(500)
    }
}

function back_to_group_lists() {
    while (true) {
        if (idContains("tv_text").className("android.widget.TextView").text("我加入的").exists()) {
            var MyGroups = idContains("tv_text").className("android.widget.TextView").text("我加入的").findOnce().parent().parent().parent()
            if (MyGroups.selected()) {
                break
            } else {
                MyGroups.click()

            }
        } else {
            clickBack()
        }
        sleep(1000)
    }
}

function back_to_group_search() {
    while (true) {
        if (idContains("search_src_text").exists()) {
            break
        } else {
            clickBack()
        }
        sleep(1000)
    }
}
function Read_group_lists() {
    group_lists = [];
    while (true) {
        if (idContains("tv_text").className("android.widget.TextView").text("我加入的").exists()) {
            var MyGroups = idContains("tv_text").className("android.widget.TextView").text("我加入的").findOnce().parent().parent().parent()
            if (MyGroups.selected()) {
                logUtils.logInfo("当前页面(我加入的)");
                logUtils.warnInfo("检测中...请勿操作手机");
                floaty_show_text("检测中...请勿操作手机")
                idContains("group_list").findOne().children().forEach(child => {
                    var target = child.findOne(id("group_title"));
                    if (target) {
                        if (target.text() != "") {
                            group_lists.push(target.text())
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

function get_cooperate_energy() {
    var plantTrees = className("android.view.View").text("种树").findOnce()
    if (plantTrees) {
        return plantTrees.parent().child(0).text()
    }
    return ''
}

function get_My_energy() {
    var gtext = className("android.view.View").text("g").findOnce().parent().parent()
    if (gtext) {
        var tiptext = gtext.child(1).child(0).text()
        return getValue('你有', '，', tiptext)
    }
    return ''
}

function getValue(key1, key2, str) {
    var m = str.match(new RegExp(key1 + '(.*?)' + key2));
    return m ? m[1] : '';
}

function is_watered(group_name) {
    if (watered_group.length > 0) {
        for (var i = 0; i < watered_group.length; i++) {
            if (group_name == watered_group[i]) {
                return true
            }
        }
    }
    return false
}

function is_water(group_name) {
    if (water_lists.length > 0) {
        for (var i = 0; i < water_lists.length; i++) {
            if (group_name.indexOf(water_lists[i]) != -1) {
                return true
            }
        }
    }
    return false
}

function is_skip(group_name) {
    if (skip_lists.length > 0) {
        for (var i = 0; i < skip_lists.length; i++) {
            if (group_name.indexOf(skip_lists[i]) != -1) {
                logUtils.debugInfo(group_name + "包含关键词" + skip_lists[i] + '执行跳过');
                floaty_show_text(group_name + "包含关键词" + skip_lists[i] + '执行跳过')
                return true
            }
        }
    }
    return false
}

function CheckGroupNameAndClick(group_name) {
    if (is_skip(group_name)) {
        return false
    }
    if (is_water(group_name)) {
        var result = textContains(group_name).findOne().parent().parent().parent()
        if (result) {
            logUtils.debugInfo('匹配到对应的群名称');
            if (result.clickable()) {
                result.click()
            } else {
                logUtils.errorInfo("控件不可点击，采用屏幕点击！");
                sleep(1000)
                click(result.bounds().centerX(), result.bounds().centerY());
            }
            return true
        }
    }
    return false
}

function checkAndClickWater() {
    // 直接通过偏移量获取送浇水按钮
    let zphb = text('总排行榜').findOne(1000)
    let target = null
    if (zphb) {
        let warpBounds = zphb.bounds()
        target = {
            centerX: parseInt(warpBounds.left + 0.8 * warpBounds.width()),
            centerY: parseInt(warpBounds.top - 1.34 * warpBounds.height())
        }
    }
    return target
}
function watering_Ex(group_name, waterNum) {
    var complete = false
    var cooperate_energy;
    var My_energy
    while (!complete) {
        if (idContains("tv_title").textContains(group_name).exists()) {
            //logUtils.infoLog('群名：'+group_name);
            if (idContains("title").text("公益树").exists()) {
                var gysTarget = idContains("title").text("公益树").findOnce().parent().parent()
                if (gysTarget) {
                    gysTarget.click()
                    logUtils.warnInfo('正在进入公益树...');
                    floaty_show_text("正在进入公益树...")
                }
            } /* else {
                if (className("android.widget.ImageView").desc("群聊信息").exists()) {
                    logUtils.errorInfo('群名：' + group_name + '没有公益树');
                    floaty_show_text('群名：' + group_name + '没有公益树')
                    complete = true
                }
            } */
        }
        if (text('总排行榜').exists()) {
            cooperate_energy = get_cooperate_energy()
            var WaterPoint = checkAndClickWater()
            //sleep(200)
            if (WaterPoint) {
                click(WaterPoint.centerX, WaterPoint.centerY)
            }
            while (true) {
                if (text("我知道了").exists() && text("继续浇水").exists()) {
                    if (config.MaxContinue) {
                        try { text("继续浇水").click(); } catch (e) { }
                        logUtils.errorInfo('超过200人选择继续浇水...');
                    } else {
                        try { text("我知道了").click(); } catch (e) { }
                        logUtils.warnInfo('超过200人选择停止浇水...');
                        closePage()
                        complete = true
                        break
                    }
                }
                if (className("android.view.View").text("浇水").exists()) {
                    My_energy = get_My_energy();
                    var gtext = className("android.view.View").text("g").findOne().parent()
                    if (gtext) {
                        var Etext = gtext.findOne(className("android.widget.EditText"))
                        if (Etext) {
                            if (waterNum != -1) {
                                Etext.setText(waterNum)
                            }
                            waterGroupcount++
                            var waterTarget = text("浇水").findOnce().bounds()
                            sleep(500)
                            var Etext2 = gtext.findOne(className("android.widget.EditText")).text()
                            logUtils.infoLog('本次浇水：' + Etext2 + 'g');
                            floaty_show_text('本次浇水：' + Etext2 + 'g')
                            watercount += parseInt(Etext2);
                            click(waterTarget.centerX(), waterTarget.centerY())
                            AntForestDao.saveFriendCollect(group_name, cooperate_energy, My_energy, parseInt(Etext2))
                            closePage()
                            complete = true
                            break
                        }
                    }
                } else {
                    WaterPoint = checkAndClickWater()
                    if (WaterPoint) { click(WaterPoint.centerX, WaterPoint.centerY) }
                }
                if (className("android.view.View").text("知道了").exists()) {
                    var ikonwTarget = text("知道了").findOnce().bounds()
                    sleep(500)
                    logUtils.errorInfo('已浇过水，执行跳过...');
                    floaty_show_text('已浇过水，执行跳过...')
                    click(ikonwTarget.centerX(), ikonwTarget.centerY())
                    //AntForestDao.saveFriendCollect(group_name, cooperate_energy, (a-500)+'g', 500)
                    //a-=500
                    closePage()
                    complete = true
                    break
                }
            }
        }
        sleep(500)
    }
}

function watering(group_name, waterNum) {
    var complete = false
    var cooperate_energy;
    var My_energy
    while (!complete) {
        if (idContains("tv_title").textContains(group_name).exists()) {
            //logUtils.infoLog('群名：'+group_name);
            if (idContains("title").text("公益树").exists()) {
                var gysTarget = idContains("title").text("公益树").findOnce().parent().parent()
                if (gysTarget) {
                    gysTarget.click()
                    logUtils.warnInfo('正在进入公益树...');
                    floaty_show_text("正在进入公益树...")
                }
            } /* else {
                if (className("android.widget.ImageView").desc("群聊信息").exists()) {
                    logUtils.errorInfo('群名：' + group_name + '没有公益树');
                    floaty_show_text('群名：' + group_name + '没有公益树')
                    complete = true
                }
            } */
        }
        if (text('总排行榜').exists()) {
            cooperate_energy = get_cooperate_energy()
            var WaterPoint = checkAndClickWater()
            //sleep(200)
            if (WaterPoint) {
                click(WaterPoint.centerX, WaterPoint.centerY)
            }
            while (true) {
                if (text("我知道了").exists() && text("继续浇水").exists()) {
                    if (config.MaxContinue) {
                        try { text("继续浇水").click(); } catch (e) { }
                        logUtils.errorInfo('超过200人选择继续浇水...');
                    } else {
                        try { text("我知道了").click(); } catch (e) { }
                        logUtils.warnInfo('超过200人选择停止浇水...');
                        closePage()
                        complete = true
                        break
                    }
                }
                if (className("android.view.View").text("浇水").exists()) {
                    My_energy = get_My_energy();
                    if (config.change_bandage) {
                        if (parseInt(My_energy) < parseInt(change_water_Num)) {
                            if (DingTalk_Change_bandage(false)) { } else {
                                sleep(3000)
                                before_exit_hander()
                                setTimeout(() => { exit() }, 1000 * 5)
                            }
                            continue_watering(group_name, waterNum)
                            complete = true
                            break
                        } else {
                            var gtext = className("android.view.View").text("g").findOne().parent()
                            if (gtext) {
                                var Etext = gtext.findOne(className("android.widget.EditText"))
                                if (Etext) {
                                    if (waterNum != -1) {
                                        Etext.setText(waterNum)
                                    }
                                    waterGroupcount++
                                    var waterTarget = text("浇水").findOnce().bounds()
                                    sleep(500)
                                    var Etext2 = gtext.findOne(className("android.widget.EditText")).text()
                                    logUtils.infoLog('本次浇水：' + Etext2 + 'g');
                                    floaty_show_text('本次浇水：' + Etext2 + 'g')
                                    watercount += parseInt(Etext2);
                                    click(waterTarget.centerX(), waterTarget.centerY())
                                    AntForestDao.saveFriendCollect(group_name, cooperate_energy, My_energy, parseInt(Etext2))
                                    closePage()
                                    complete = true
                                    break
                                }
                            }
                        }

                    } else {
                        var gtext = className("android.view.View").text("g").findOne().parent()
                        if (gtext) {
                            var Etext = gtext.findOne(className("android.widget.EditText"))
                            if (Etext) {
                                if (waterNum != -1) {
                                    Etext.setText(waterNum)
                                }
                                waterGroupcount++
                                var waterTarget = text("浇水").findOnce().bounds()
                                sleep(500)
                                var Etext2 = gtext.findOne(className("android.widget.EditText")).text()
                                logUtils.infoLog('本次浇水：' + Etext2 + 'g');
                                floaty_show_text('本次浇水：' + Etext2 + 'g')
                                watercount += parseInt(Etext2);
                                click(waterTarget.centerX(), waterTarget.centerY())
                                AntForestDao.saveFriendCollect(group_name, cooperate_energy, My_energy, parseInt(Etext2))
                                closePage()
                                complete = true
                                break
                            }
                        }
                    }
                } else {
                    WaterPoint = checkAndClickWater()
                    if (WaterPoint) { click(WaterPoint.centerX, WaterPoint.centerY) }
                }
                if (className("android.view.View").text("知道了").exists()) {
                    var ikonwTarget = text("知道了").findOnce().bounds()
                    sleep(500)
                    logUtils.errorInfo('已浇过水，执行跳过...');
                    floaty_show_text('已浇过水，执行跳过...')
                    click(ikonwTarget.centerX(), ikonwTarget.centerY())
                    //AntForestDao.saveFriendCollect(group_name, cooperate_energy, (a-500)+'g', 500)
                    //a-=500
                    closePage()
                    complete = true
                    break
                }
            }
        }
        sleep(500)
    }
}

function continue_watering(group_name, waterNum) {
    var complete = false
    var cooperate_energy;
    var My_energy
    while (!complete) {
        if (idContains("tv_title").textContains(group_name).exists()) {
            //logUtils.infoLog('群名：'+group_name);
            if (idContains("title").text("公益树").exists()) {
                var gysTarget = idContains("title").text("公益树").findOnce().parent().parent()
                if (gysTarget) {
                    gysTarget.click()
                    logUtils.warnInfo('正在进入公益树...');
                    floaty_show_text("正在进入公益树...")
                }
            }/*  else {
                if (className("android.widget.ImageView").desc("群聊信息").exists()) {
                    logUtils.errorInfo('群名：' + group_name + '没有公益树');
                    floaty_show_text('群名：' + group_name + '没有公益树')
                    complete = true
                }
            } */
        }
        if (text('总排行榜').exists()) {
            cooperate_energy = get_cooperate_energy()
            var WaterPoint = checkAndClickWater()

            //sleep(200)
            if (WaterPoint) {
                click(WaterPoint.centerX, WaterPoint.centerY)
            }
            while (true) {
                if (text("我知道了").exists() && text("继续浇水").exists()) {
                    if (config.MaxContinue) {
                        try { text("继续浇水").click(); } catch (e) { }
                        logUtils.errorInfo('超过200人选择继续浇水...');
                    } else {
                        try { text("我知道了").click(); } catch (e) { }
                        logUtils.warnInfo('超过200人选择停止浇水...');
                        closePage()
                        complete = true
                        break
                    }
                }
                if (className("android.view.View").text("浇水").exists()) {
                    My_energy = get_My_energy();
                    if (config.change_bandage) {
                        if (parseInt(My_energy) < parseInt(change_water_Num)) {
                            if (DingTalk_Change_bandage(false)) { } else {
                                sleep(3000)
                                before_exit_hander()
                                setTimeout(() => { exit() }, 1000 * 5)
                            }
                            watering(group_name, waterNum)
                            complete = true
                            break
                        } else {
                            var gtext = className("android.view.View").text("g").findOne().parent()
                            if (gtext) {
                                var Etext = gtext.findOne(className("android.widget.EditText"))
                                if (Etext) {
                                    if (waterNum != -1) {
                                        Etext.setText(waterNum)
                                    }
                                    waterGroupcount++
                                    var waterTarget = text("浇水").findOnce().bounds()
                                    sleep(500)
                                    var Etext2 = gtext.findOne(className("android.widget.EditText")).text()
                                    logUtils.infoLog('本次浇水：' + Etext2 + 'g');
                                    floaty_show_text('本次浇水：' + Etext2 + 'g')
                                    watercount += parseInt(Etext2);
                                    click(waterTarget.centerX(), waterTarget.centerY())
                                    AntForestDao.saveFriendCollect(group_name, cooperate_energy, My_energy, parseInt(Etext2))
                                    closePage()
                                    complete = true
                                    break
                                }
                            }
                        }
                    } else {
                        var gtext = className("android.view.View").text("g").findOne().parent()
                        if (gtext) {
                            var Etext = gtext.findOne(className("android.widget.EditText"))
                            if (Etext) {
                                if (waterNum != -1) {
                                    Etext.setText(waterNum)
                                }
                                waterGroupcount++
                                var waterTarget = text("浇水").findOnce().bounds()
                                sleep(500)
                                var Etext2 = gtext.findOne(className("android.widget.EditText")).text()
                                logUtils.infoLog('本次浇水：' + Etext2 + 'g');
                                floaty_show_text('本次浇水：' + Etext2 + 'g')
                                watercount += parseInt(Etext2);
                                click(waterTarget.centerX(), waterTarget.centerY())
                                AntForestDao.saveFriendCollect(group_name, cooperate_energy, My_energy, parseInt(Etext2))
                                closePage()
                                complete = true
                                break
                            }
                        }
                    }
                } else {
                    WaterPoint = checkAndClickWater()
                    if (WaterPoint) { click(WaterPoint.centerX, WaterPoint.centerY) }
                }
                if (className("android.view.View").text("知道了").exists()) {
                    var ikonwTarget = text("知道了").findOnce().bounds()
                    sleep(500)
                    logUtils.errorInfo('已浇过水，执行跳过...');
                    floaty_show_text('已浇过水，执行跳过...')
                    click(ikonwTarget.centerX(), ikonwTarget.centerY())
                    //AntForestDao.saveFriendCollect(group_name, cooperate_energy, (a-500)+'g', 500)
                    //a-=500
                    closePage()
                    complete = true
                    break
                }
            }
        }
        sleep(500)
    }
}


//let a=36467
function open_No_interruptions() {
    while (!className("android.widget.TextView").text("群设置").exists()) {
        if (className("android.widget.ImageView").desc("群聊信息").exists()) {
            try { desc("群聊信息").click() } catch (e) { }
        }
        closePage()
        sleep(500)
    }
    let No_interruptions = false
    while (className("android.widget.TextView").text("群设置").exists()) {
        if (idContains("menu_item_title").className("android.widget.TextView").text("消息免打扰").exists()) {
            var no_inter_target = idContains("menu_item_title").text("消息免打扰").findOnce().parent()
            if (no_inter_target) {
                var no_inter_button = no_inter_target.findOne(idContains("menu_item_toggle"))
                if (no_inter_button) {
                    if (no_inter_button.checked()) {
                        No_interruptions = true
                        logUtils.warnInfo("免打扰已为开启状态！");
                        floaty_show_text("免打扰已为开启状态！")
                    } else {
                        No_interruptions = false
                        no_inter_button.click()
                        logUtils.warnInfo("开启消息免打扰成功！");
                        floaty_show_text("开启消息免打扰成功！")
                    }
                }
            }
        }
        if (No_interruptions) {
            break
        }
        sleep(500)
    }
}

function open_sticky() {
    while (!className("android.widget.TextView").text("群设置").exists()) {
        if (className("android.widget.ImageView").desc("群聊信息").exists()) {
            try { desc("群聊信息").click() } catch (e) { }
        }
        sleep(500)
    }
    let sticky = false
    while (className("android.widget.TextView").text("群设置").exists()) {
        if (idContains("menu_item_title").className("android.widget.TextView").text("聊天置顶").exists()) {
            var sticky_target = idContains("menu_item_title").text("聊天置顶").findOnce().parent()
            if (sticky_target) {
                var sticky_button = sticky_target.findOne(idContains("menu_item_toggle"))
                if (sticky_button) {
                    if (sticky_button.checked()) {
                        sticky = true
                        logUtils.warnInfo("聊天置顶已为开启状态！");
                        floaty_show_text("聊天置顶已为开启状态！")
                    } else {
                        sticky = false
                        sticky_button.click()
                        logUtils.warnInfo("开启聊天置顶成功！");
                        floaty_show_text("开启聊天置顶成功！")
                    }
                }
            }
        }
        if (sticky) {
            break
        }
        sleep(500)
    }
}

function search_groupsAndclick(group_name) {
    let complete=false
    while (!complete) {
        if (textContains(group_name).exists()) {
            if (text("未搜索到相关结果").exists() ) {
                logUtils.logInfo(group_name+'未搜索到相关结果')
                complete = true
            }else if(text("我的群组").exists()){
                sleep(200)
                try {
                    //var groupText = idContains("tv_friend_name").findOne(1000)
                    var groupText = idContains("tv_friend_name").textContains(group_name).findOne(1000)
                    if (groupText) {
                        if (groupText.text().indexOf(group_name) != -1) {
                            logUtils.logInfo("匹配到群：" + group_name)
                            groupText.parent().parent().parent().parent().parent().parent().click()
                            return true
                        }
                    }
                } catch (e) { }
            }
        } else {
                var search_groups = idContains("search_src_text").findOnce()
                if (search_groups) {
                    logUtils.debugInfo("开始查找群：" + group_name)
                    search_groups.setText(group_name)
                }
                if (idContains("view_search").exists()) {
                    try { idContains("view_search").findOnce().click() } catch (e) { }
                }          
        }
        if(!idContains("search_src_text").exists() && text("我加入的").exists()){
            if (idContains("view_search").exists()) {
                try { idContains("view_search").findOnce().click() } catch (e) { }
            }
        }
        sleep(500)
    }
    return false
}

function push_watering_today() {
    logUtils.warnInfo('正在进行push+消息推送');
    let push_query = {
        size: 999,
        start: 0,
        current: 0,
        total: 0,
        collectDate: '',
        orderBy: ''
    }
    push_query.collectDate = dateFormat(new Date(), 'yyyy-MM-dd')
    let watering_data = AntForestDao.pageCollectInfo(push_query)
    let water_summary = AntForestDao.getCollectSummary(push_query)
    let water_detail = []
    if (parseInt(watering_data.total) > 0) {
        for (var i = 0; i < watering_data.result.length; i++) {
            let group_watering_data = { '群名': watering_data.result[i].friendName, '浇水数量': watering_data.result[i].waterEnergy + "g" }
            water_detail.push(group_watering_data)
        }
        let push_data = { '总浇水次数': parseInt(watering_data.total), '总浇水': parseInt(water_summary.totalWater) + "g", '浇水详情': water_detail }
        let token = config.pushplus_token.replace(/ /g, '')
        let title = dateFormat(new Date(), 'yyyy-MM-dd') + '  钉钉合种浇水'
        let url = 'http://pushplus.hxtrip.com/send'  //http://www.pushplus.plus/send
        let data = {
            "token": token,
            "title": title,
            "content": push_data,
            "template": "json"
        }
        try {
            var res = http.postJson(url, data);
        } catch (e) { }
    }
}

function start_alipay() {
    if (!(launchApp("支付宝") || launch('com.eg.android.AlipayGphone'))) //启动支付宝
    {
        return false
    }
    return true
}

function start_DingTalk() {
    if (!(launchApp("钉钉") || launch('com.alibaba.android.rimet'))) {
        return false
    }
    return true
}

function account_manager() {
    app.startActivity({
        action: "VIEW",
        data: "alipays://platformapi/startapp?appId=20000027",
    });
}
function Alipay_closeUpdata() {
    if (textContains("稍候再说").exists() && textContains("立即更新").exists()) {
        text("稍候再说").click();
    }
}

function Read_account() {
    idContains("security_userListView").findOne().children().forEach(child => {
        var icon = child.findOne(idContains("iv_am_item_avatar"));
        if (icon) {
            target = icon.parent().parent().findOne(idContains("tv_am_item_account"))
            if (target) {
                if (target.text() != "") {
                    //log(target.text());
                    account.push(target.text())
                }
            }
        }
    });
    account.reverse()
}

function Read_account_old() {
    idContains("security_userListView").findOne().children().forEach(child => {
        var icon = child.findOne(idContains("list_item_icon"));
        if (icon) {
            target = icon.parent().parent().findOne(idContains("item_left_text"))
            if (target) {
                if (target.text() != "") {
                    //log(target.text());
                    account.push(target.text())
                }
            }
        }
    });
    account.reverse()
}

function Check_Master_Account(account_name) {
    var result_list = text(account_name).find();
    if (!result_list.empty()) {
        return true
    }
    return false
}

function is_changed(account_name) {
    if (Account_Change_bandage.length > 0) {
        for (var i = 0; i < Account_Change_bandage.length; i++) {
            if (account_name == Account_Change_bandage[i]) {
                return true
            }
        }
    }
    return false
}

function prepare_for_changed() {
    home()
    sleep(200)
    toastLog("正在检查换绑设置!请稍候")
    floaty_show_text("正在检查换绑设置!请稍候")
    start_alipay()
    account_manager()
    sleep(200)
    if (config.version_choose == 'a') {
        logUtils.logInfo("等待账号切换页面加载");
        while (!text("账号切换").exists()) {
            Alipay_closeUpdata()
            sleep(1000)
        }
        if (Check_Master_Account(config.Master_Account)) {
            Read_account_old()
        }
    } else if (config.version_choose == 'b') {
        logUtils.logInfo("等待账号切换页面加载");
        while (!text("切换账号").exists()) {
            Alipay_closeUpdata()
            sleep(1000)
        }
        if (Check_Master_Account(config.Master_Account)) {
            Read_account()
        }
    }
    if (account.length > 0) {
        if (account.length == 1) {
            logUtils.errorInfo("当前只登陆了大号没有可用来换绑的账号！")
            toast("当前只登陆了大号没有可用来换绑的账号！请关闭换绑开关！")
            logUtils.logInfo("====================");
            return false
        } else {
            return true
        }
    } else {
        logUtils.errorInfo('没有登录大号或大号账号设置错误，停止运行！');
        toast("没有登录大号或大号账号设置错误，停止运行！")
        logUtils.logInfo("====================");
    }
    return false
}

function select_account() {
    for (var i = 0; i < account.length; i++) {
        if (account[i] != config.Master_Account) {
            if (is_changed(account[i])) {
            } else {
                return account[i]
            }
        }
    }
    return false
}

function SearchAndClickOld(account_name) {
    var result_list = text(account_name).find();
    if (!result_list.empty()) {
        var result = result_list[result_list.length - 1].parent().parent().parent().parent().parent()
        if (result.clickable()) {
            result.click()
        } else {
            logUtils.errorInfo("控件不可点击，采用屏幕点击！");
            sleep(1000)
            click(result.bounds().centerX(), result.bounds().centerY());
        }
    }
}

function SearchAndClickNew(account_name) {
    var result_list = text(account_name).find();
    if (!result_list.empty()) {
        var result = result_list[result_list.length - 1].parent().parent()
        if (result.clickable()) {
            result.click()
        } else {
            logUtils.errorInfo("控件不可点击，采用屏幕点击！");
            sleep(1000)
            click(result.bounds().centerX(), result.bounds().centerY());
        }
    }
}

function Alipay_change_account(account_name) {
    if (config.version_choose == 'a') {
        while (!text("账号切换").exists()) {
            logUtils.logInfo("等待账号切换页面加载");
            openPage()
            sleep(1000)
        }
        SearchAndClickOld(account_name)
    } else if (config.version_choose == 'b') {
        while (!text("切换账号").exists()) {
            logUtils.logInfo("等待账号切换页面加载");
            openPage()
            sleep(1000)
        }
        SearchAndClickNew(account_name)
    }
    sleep(1000)
}

function checkAndClickManger() {
    // 直接通过偏移量获取管理按钮
    let plantTrees = className("android.view.View").text("种树").findOne(1000)
    let target = null
    if (plantTrees) {
        let warpBounds = plantTrees.bounds()
        target = {
            centerX: parseInt(warpBounds.left + 0.52 * warpBounds.width()),
            centerY: parseInt(warpBounds.top + 10.5 * warpBounds.height())
        }
    }
    return target
}

function change_watering_account() {
    var complete = false
    while (!complete) {
        if (idContains("tv_title").exists()) {
            if (idContains("title").text("公益树").exists()) {
                var gysTarget = idContains("title").text("公益树").findOne(1000).parent().parent()
                if (gysTarget) {
                    gysTarget.click()
                    //logUtils.warnInfo('正在进入公益树...');
                    logUtils.warnInfo('正在进入公益树...')
                    floaty_show_text('正在进入公益树...')
                }
            }
        }
        if (text('总排行榜').exists()) {
            while (!className("android.view.View").text("解绑支付宝").exists()) {
                if (text('总排行榜').exists()) {
                    var MangerPoint = checkAndClickManger()
                    //sleep(200)
                    if (MangerPoint) { click(MangerPoint.centerX, MangerPoint.centerY) }
                    sleep(1000)
                }
                sleep(500)
            }
            while (true) {
                if (className("android.view.View").text("解绑支付宝").exists()) {
                    try { className("android.view.View").text("解绑支付宝").findOne(1000).click() } catch (e) { }
                }
                if (className("android.widget.Button").text("取消").exists() && className("android.widget.Button").text("解绑支付宝").exists()) {
                    var close_bandage = className("android.widget.Button").text("解绑支付宝").findOne(1000).click()
                    if (close_bandage) {
                        sleep(500)
                        closePage()
                        complete = true
                        break
                    }
                }
                sleep(500)
            }
        }
    }
    sleep(500)
}

function bandage_Alipay() {
    var complete = false
    while (!complete) {
        if (className("android.view.View").text("解绑支付宝").exists()) {
            closePage()
        }

        if (idContains("tv_title").exists()) {
            if (idContains("title").text("公益树").exists()) {
                var gysTarget = idContains("title").text("公益树").findOnce().parent().parent()
                if (gysTarget) {
                    gysTarget.click()
                    logUtils.warnInfo('正在进入公益树...')
                    floaty_show_text('正在进入公益树...')
                }
            }
        }
        if (text('总排行榜').exists()) {
            while (!text("支付宝授权").exists()) {
                if (text('总排行榜').exists()) {
                    var WaterPoint = checkAndClickWater()
                    //sleep(200)
                    if (WaterPoint) {
                        click(WaterPoint.centerX, WaterPoint.centerY)
                    }
                    sleep(1000)
                }
                sleep(500)
            }
            while (true) {
                if (text("支付宝授权").exists()) {
                    var agree_button = className("android.widget.Button").text("同意").findOne(1000)
                    if (agree_button) {
                        sleep(1000)
                        click(agree_button.bounds().centerX(), agree_button.bounds().centerY())
                        //agree_button.click()  //不知道为啥这个控件点击失效
                        sleep(2000)
                    }
                }
                if (className("android.widget.Button").text("知道了").exists()) {
                    if (textContains("成功绑定").exists()) {
                        logUtils.logInfo("绑定成功")
                        floaty_show_text("绑定成功")
                        className("android.widget.Button").text("知道了").findOnce().click()
                        return true
                    }
                    if (textContains("钱包").exists()) {
                        logUtils.logInfo("绑定钱包,停止运行，请先手动解绑！")
                        floaty_show_text("绑定钱包,停止运行，请先手动解绑！")
                        toast("绑定钱包,停止运行，请先手动解绑！")
                        className("android.widget.Button").text("知道了").findOnce().click()
                        return false
                    }
                    complete = true
                    break
                }
                sleep(500)
            }
        }
        sleep(500)
    }
}

function DingTalk_Change_bandage(is_back_master) {
    let alipay_account_name
    account_manager()
    if (is_back_master) {
        alipay_account_name = config.Master_Account
    } else {
        let change_account = select_account()
        if (change_account) {
            alipay_account_name = change_account
        } else {
            is_Master_Account = true
            alipay_account_name = config.Master_Account
        }
    }
    Account_Change_bandage.push(alipay_account_name)
    logUtils.debugInfo("正在切换账号：" + alipay_account_name);
    sleep(2000)
    Alipay_change_account(alipay_account_name)
    start_DingTalk()
    change_watering_account()
    if (bandage_Alipay()) {
        return true
    } else {
        return false
    }
}

function killApp(name) {
    let forcedStopStr = ["停止", "强行", "结束"];
    let packageName = app.getPackageName(name);
    if (packageName) {
        app.openAppSetting(packageName);
        text(name).waitFor();
        for (var i = 0; i < forcedStopStr.length; i++) {
            if (textContains(forcedStopStr[i]).exists()) {
                let forcedStop = textContains(forcedStopStr[i]).findOne();
                if (forcedStop.enabled()) {
                    forcedStop.click();
                    textMatches("确定|.*停止").findOne().click();
                    toastLog(name + "已结束运行");
                    sleep(800);
                    back();
                    break;
                } else {
                    toastLog(name + "不在后台运行！");
                    back();
                    break;
                }
            }
        }
    } else {
        toastLog("应用不存在");
    }
}

function mine_group() {
    app.startActivity({
        action: "VIEW",
        data: "dingtalk://dingtalkclient/page/link?url=" + encodeURIComponent("https://qr.dingtalk.com/mine_group_conversation.html#Intent;launchFlags=0x4000000;package=com.alibaba.android.rimet;component=com.alibaba.android.rimet/com.alibaba.android.dingtalkim.activities.MineGroupConversationActivity"),
    });
}

listenStopCollect()
main();
