let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, global)
const resolver = require('../lib/AutoJSRemoveDexResolver.js')
//require('../modules/init_if_needed.js')(runtime, global)
let automator = singletonRequire('Automator')
let logUtils = singletonRequire('LogUtils')
var { default_config, config, storage_name: _storage_name } = require('../config.js')(runtime, global)
let _commonFunctions = singletonRequire('CommonFunction')
let fileUtils = singletonRequire('FileUtils')
let runningQueueDispatcher = singletonRequire('RunningQueueDispatcher')
//let callStateListener = !config.is_pro && config.enable_call_state_control ? singletonRequire('CallStateListener') : { exitIfNotIdle: () => { } }
let resourceMonitor = require('../lib/ResourceMonitor.js')(runtime, global)
let args = engines.myEngine().execArgv

try {
    importClass(com.stardust.autojs.core.accessibility.AccessibilityBridge.WindowFilter);
    let bridge = runtime.accessibilityBridge;
    let bridgeField = runtime.getClass().getDeclaredField("accessibilityBridge");
    let configField = bridgeField.getType().getDeclaredField("mConfig");
    configField.setAccessible(true);
    configField.set(bridge, configField.getType().newInstance());
    bridge.setWindowFilter(new JavaAdapter(AccessibilityBridge$WindowFilter, {
        filter: function (info) {
            return true;
        }
    }));
} catch (e) { }
/**
 * 主线程
 */
//let Dream = require('./ConSole.js')
let account = [];
let cycleTimes = 1;
let watering_friend_list = []
let wateringTimes = 3;
let _widgetUtils = null
let _BaseScanner = null
let scanner = null
let _post_energy = 0 // 记录收取后能量值
let stopListenThread = null

/* let default_config = {
  version_choose: 'a',
  enter_forest: false,                
  look_sport: false,   
  send_tool: false,
  send_tool_friendId:'',
  accoun_change_time: 30,
  auto_delay:true,
  auto_Energy_rain:true,  //自动能量雨
};
let config = default_config; */

logUtils.logInfo('======尝试加入任务队列，并关闭重复运行的脚本=======')
// 加入任务队列
runningQueueDispatcher.addRunningTask()
_commonFunctions.killDuplicateScript()
logUtils.logInfo('======加入任务队列成功=======')

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
}, 'AccountAutoChange')

if (config.collect_self || config.is_watering_friend) {
    _widgetUtils = singletonRequire('WidgetUtils')
    _BaseScanner = require('../core/BaseScanner.js')
    scanner = new _BaseScanner()
    logUtils.logInfo('======基于图像分析模式：加载dex=======')
    resolver()
    runtime.loadDex('../lib/color-region-center.dex')
    runtime.loadDex('../lib/autojs-common.dex')
    logUtils.logInfo('=======加载dex完成=======')
    // 请求截图权限
    let screenPermission = _commonFunctions.requestScreenCaptureOrRestart()
    if (!screenPermission) {
        logUtils.errorInfo('请求截图失败, 停止运行')
        before_exit_hander()
        setTimeout(() => { exit() }, 1000 * 5)
    } else {
        logUtils.logInfo('请求截屏权限成功')
    }
}


let FloatyInstance = singletonRequire('FloatyUtil')
// 初始化悬浮窗
if (config.show_small_floaty) {
    if (!FloatyInstance.init()) {
        runningQueueDispatcher.removeRunningTask()
        sleep(6000)
        logUtils.errorInfo('悬浮窗初始化失败, 请查看悬浮窗权限！')
        before_exit_hander()
        exit()
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
                exit()
            }
        })
    })
}




function floaty_show_text(text) {
    if (config.show_small_floaty) {
        _commonFunctions.showTextFloaty(">>>" + text)
    }
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
    if (!(launchApp("支付宝") || launch('com.eg.android.AlipayGphone'))) //启动支付宝
    {
        logUtils.errorInfo("找不到支付宝App!，请自己尝试打开");
        floaty_show_text("找不到支付宝App!，请自己尝试打开")
        // return;
    }
    delay(2)
    //ZFB_SY()
    while (!packageName('com.eg.android.AlipayGphone').text("我的").exists()) {
        logUtils.logInfo("正在等待加载出主页，如果一直加载此信息，请手动返回主页，或者无障碍服务可能出现BUG，请停止运行App重新给无障碍服务");
        closePage()
        closeUpdata()
        delay(2);
    }
    logUtils.infoLog("启动app成功！");
    floaty_show_text("启动app成功！")
    delay(1);
}

function closeUpdata() {
    if (textContains("稍后再说").exists() && textContains("立即更新").exists()) {
        text("稍后再说").click();
    }
}

function closePage() {
    if (className("android.widget.FrameLayout").desc("关闭").exists()) {
        className("android.widget.FrameLayout").desc("关闭").click()
    }
    if (idContains("h5_nav_back").desc("返回").exists()) {
        try { idContains("h5_nav_back").desc("返回").findOne(1000).child(0).click() } catch (e) { }
    }
    if (idContains("back_button").desc("返回").exists()) {
        try { idContains("back_button").desc("返回").findOne(1000).click() } catch (e) { }
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
    if (!config.accoun_change_time || config.accoun_change_time < 0) config.accoun_change_time = 30;
    if (!config.cycleTimes || config.cycleTimes < 0) {
        cycleTimes = 1;
    } else {
        cycleTimes = parseInt(config.cycleTimes)
    }
    if (config.send_tool) {
        if (config.send_tool_friendId && typeof (config.send_tool_friendId) == 'number') {
        } else {
            toast("未设置赠送ID或赠送ID格式错误");
            before_exit_hander()
            setTimeout(() => { exit() }, 1000 * 5);
            //return
        }
    }
    if (config.is_watering_friend) {
        if (config.watering_friendId) {
            watering_friend_list = config.watering_friendId.split('|');
            if (watering_friend_list.length > 0) {
                config.targetWateringAmount = parseInt(config.watering_friend_num)
                wateringTimes = parseInt(config.watering_friend_times)
            } else {
                toast("未设置浇水ID或浇水ID格式错误");
                before_exit_hander()
                setTimeout(() => { exit() }, 1000 * 5);
            }
        } else {
            toast("未设置浇水ID或浇水ID格式错误");
            before_exit_hander()
            setTimeout(() => { exit() }, 1000 * 5);
            //return
        }
    }
    if (config.accounts && config.accounts.length > 1) {

    } else {
        toast("当前未配置多账号或账号只有一个，不进行切换");
        before_exit_hander()
        setTimeout(() => { exit() }, 1000 * 5);
        return
    }

    _golThread = threads.start(function () {
        //console.show();
        start_app()
        account_manager()
        delay(1);
        /*         if (config.version_choose == 'a') {
                    logUtils.logInfo("等待账号切换页面加载");
                    floaty_show_text("等待账号切换页面加载")
                    while (!text("账号切换").exists()) {
                        closeUpdata()
                        sleep(1000)
                    }
                    Read_account_old()
                    //text("账号切换").waitFor()
                } else if (config.version_choose == 'b') {
                    logUtils.logInfo("等待账号切换页面加载");
                    floaty_show_text("等待账号切换页面加载")
                    while (!text("切换账号").exists()) {
                        closeUpdata()
                        sleep(1000)
                    }
                    //text("切换账号").waitFor()
                    Read_account()
                } */
        account = config.accounts
        logUtils.logInfo("====================");
        if (account.length > 0) {
            for (var i = 0; i < account.length; i++) {
                logUtils.infoLog("当前操作第" + (i + 1) + "个账号...");
                floaty_show_text("当前操作第" + (i + 1) + "个账号：" + account[i].account)
                logUtils.debugInfo("正在切换账号：" + account[i].account);
                delay(2)
                if (config.version_choose == 'a') {
                    while (!text("账号切换").exists()) {
                        logUtils.logInfo("等待账号切换页面加载");
                        openPage()
                        sleep(1000)
                    }
                    SearchAndClickOld(account[i].account)
                } else if (config.version_choose == 'b') {
                    while (!text("切换账号").exists()) {
                        logUtils.logInfo("等待账号切换页面加载");
                        openPage()
                        sleep(1000)
                    }
                    SearchAndClickNew(account[i].account)
                }
                delay(3)
                if (config.look_sport) {
                    logUtils.logInfo("进行[查看步数]任务中");
                    floaty_show_text("进行[查看步数]任务中")
                    ZFB_sport()
                    while (!desc('关闭').exists()) {
                        openPage()
                        sleep(1000)
                    }
                    logUtils.infoLog("步数页面暂留5秒后进行下个任务...");
                    floaty_show_text("步数页面暂留5秒后进行下个任务...")
                    delay(5)
                    closePage()
                }
                if (config.collect_self) {
                    logUtils.logInfo("进行[收自己能量]任务中");
                    floaty_show_text("进行[收自己能量]任务中")
                    Ant_forest()
                    while (!desc('关闭').exists()) {
                        openPage()
                        sleep(1000)
                    }
                    while (!text('查看更多好友').exists() && !text('排行榜').exists()) { }
                    collectOwn()
                    //logUtils.infoLog("森林页面暂留5秒后进行下个任务...");
                    delay(1)
                    //closePage()
                }
                if (config.is_watering_friend) {
                    logUtils.logInfo("进行[浇水]任务中");
                    floaty_show_text("进行[浇水]任务中")
                    for (var k = 0; k < watering_friend_list.length; k++) {
                        wateringFriend(watering_friend_list[k])
                    }
                }
                if (config.send_tool) {
                    if (config.send_tool_friendId && typeof (config.send_tool_friendId) == 'number') {
                        logUtils.logInfo("进行[赠送道具]任务中");
                        floaty_show_text("进行[赠送道具]任务中")
                        SendTool(config.send_tool_friendId)
                        //closePage()
                    } else {
                        logUtils.logInfo("未设置赠送ID或赠送ID格式错误");
                        config.send_tool = false
                    }
                }
                if (config.auto_Energy_rain) { //能量雨
                    //openRainPage()
                    let source = fileUtils.getCurrentWorkPath() + '/unit/能量雨收集.js'
                    runningQueueDispatcher.doAddRunningTask({ source: source })
                    let targetSendName = account[(i + 1) % account.length].accountName
                    logUtils.debugInfo(['赠送对象昵称为：{}', targetSendName])
                    engines.execScriptFile(source, { path: source.substring(0, source.lastIndexOf('/')), arguments: { executeByAccountChanger: true, executorSource: engines.myEngine().getSource() + '', targetSendName: targetSendName } })
                    //engines.execScriptFile(source, { path: source.substring(0, source.lastIndexOf('/')), arguments: { executeByStroll: true } })
                    _commonFunctions.commonDelay(2.5, '执行能量雨[', true, true)
                    runningQueueDispatcher.removeRunningTask(true)
                    closePage()
                }

                if (config.auto_delay) {
                    let counti = 1
                    while (true) {
                        if (counti % 3 == 0) {
                            toast("森林助手[防息屏]")
                        }
                        counti++
                        if (is_Energy_rain_complete()) {
                            logUtils.infoLog("能量雨完成，延迟等待5秒后操作下一个账号...");
                            floaty_show_text("能量雨完成，延迟等待5秒后操作下一个账号...")
                            logUtils.logInfo("====================");
                            closePage()
                            sleep(5000)
                            break
                        }
                        sleep(10000)
                    }
                } else {
                    logUtils.infoLog("延迟等待" + config.accoun_change_time + "秒后操作下一个账号...");
                    floaty_show_text("延迟等待" + config.accoun_change_time + "秒后操作下一个账号...")
                    logUtils.logInfo("====================");
                    //toast("森林助手[防息屏]")
                    //delay(config.accoun_change_time)
                    let counti = 1
                    while (counti++ < config.accoun_change_time) {
                        if (counti % 25 == 0) {
                            toast("森林助手[防息屏]")
                        }
                        sleep(1000)
                    }
                    counti = 1
                }

                if (i == account.length - 1) {
                    //logUtils.infoLog("当前操作第" + (i + 1) + "个账号...");
                    if (config.changeBack) {
                        account_manager()
                        floaty_show_text("全部账号执行完毕，切换回第一个账号：" + account[0].account)
                        logUtils.debugInfo("全部账号执行完毕，切换回第一个账号：" + account[0].account);
                        delay(2)
                        if (config.version_choose == 'a') {
                            while (!text("账号切换").exists()) {
                                logUtils.logInfo("等待账号切换页面加载");
                                openPage()
                                sleep(1000)
                            }
                            SearchAndClickOld(account[0].account)
                        } else if (config.version_choose == 'b') {
                            while (!text("切换账号").exists()) {
                                logUtils.logInfo("等待账号切换页面加载");
                                openPage()
                                sleep(1000)
                            }
                            SearchAndClickNew(account[0].account)
                        }
                        delay(3)
                        if (config.auto_Energy_rain) { //能量雨
                            floaty_show_text("第一个账号再次校验能量雨机会")
                            logUtils.debugInfo("第一个账号再次校验能量雨机会");
                            //openRainPage()
                            let source = fileUtils.getCurrentWorkPath() + '/unit/能量雨收集.js'
                            runningQueueDispatcher.doAddRunningTask({ source: source })
                            let targetSendName = account[1].accountName
                            logUtils.debugInfo(['赠送对象昵称为：{}', targetSendName])
                            engines.execScriptFile(source, { path: source.substring(0, source.lastIndexOf('/')), arguments: { executeByAccountChanger: true, executorSource: engines.myEngine().getSource() + '', targetSendName: targetSendName } })
                            //engines.execScriptFile(source, { path: source.substring(0, source.lastIndexOf('/')), arguments: { executeByStroll: true } })
                            _commonFunctions.commonDelay(2.5, '执行能量雨[', true, true)
                            runningQueueDispatcher.removeRunningTask(true)
                            closePage()
                        }
                    }

                    logUtils.errorInfo("线程结束！共操作账号个数：" + (i + 1));
                    floaty_show_text("线程结束！共操作账号个数：" + (i + 1))
                    logUtils.logInfo("====================");
                    before_exit_hander()
                    try { setTimeout(() => { exit() }, 1000 * 5); } catch (e) { }
                } else {
                    account_manager()
                }
            }
        } else {
            logUtils.errorInfo('读取账号列表失败，停止运行！');
            before_exit_hander()
            setTimeout(() => { exit() }, 1000 * 5);
        }
    })
}

function before_exit_hander() {
    //callStateListener.disableListener()
    if (resourceMonitor != null) { resourceMonitor.releaseAll() }
    interruptStopListenThread()
    events.removeAllListeners('key_down')
    if ((config.auto_lock && args.needRelock) == true) {
        log('重新锁定屏幕')
        automator.lockScreen()
    }
    runningQueueDispatcher.removeRunningTask()
    if (scanner !== null) {
        scanner.destroy()
        scanner = null
    }
    _commonFunctions.reduceConsoleLogs()
}

function account_manager() {
    app.startActivity({
        action: "VIEW",
        data: "alipays://platformapi/startapp?appId=20000027",
    });
}

function Ant_forest() {
    app.startActivity({
        action: "VIEW",
        data: "alipays://platformapi/startapp?saId=60000002",
    });
}

function ZFB_sport() {
    app.startActivity({
        action: "VIEW",
        data: "alipays://platformapi/startapp?saId=20000869",
    });
}

function ZFB_SY() {
    app.startActivity({
        action: "VIEW",
        data: "alipays://platformapi/startapp?saId=20000167",
    });
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

function SearchAndClick(account_name) {
    var result = text(account_name).findOne().parent()
    if (result) {
        sleep(1000)
        click(result.bounds().centerX(), result.bounds().centerY());
    }
}

/* function SearchAndClickNew(account_name) {
    var result = text(account_name).findOne().parent().parent()
    if (result) {
        if(result.clickable()){
            result.click()
        }else{
        logUtils.errorInfo("控件不可点击，采用屏幕点击！");
        sleep(1000)
        click(result.bounds().centerX(), result.bounds().centerY());
        }
    }
}

function SearchAndClickOld(account_name) {
    var result = text(account_name).findOne().parent().parent().parent().parent().parent()
    if (result) {
        if(result.clickable()){
            result.click()
        }else{
        logUtils.errorInfo("控件不可点击，采用屏幕点击！");
        sleep(1000)
        click(result.bounds().centerX(), result.bounds().centerY());
        }
    }
} */

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

function checkAndClickSend() {
    // 直接通过偏移量获取送道具按钮
    let jTreeWarp = idContains('J_tree_dialog_wrap').findOne(1000)
    let target = null
    if (jTreeWarp) {
        let warpBounds = jTreeWarp.bounds()
        target = {
            centerX: parseInt(warpBounds.left - 0.11 * warpBounds.width()),
            centerY: parseInt(warpBounds.bottom - 0.28 * warpBounds.height())
        }
    }
    return target
}

function JumpToFirend(friendId) {
    app.startActivity({
        action: "VIEW",
        data: "alipays://platformapi/startapp?saId=60000002&url=" + encodeURIComponent("https://60000002.h5app.alipay.com/www/home.html?userId=" + friendId),  //2088702225705653    2088532351663673
    });
}


function SendTool(friendId) {
    JumpToFirend(friendId)
    while (!desc("关闭").exists()) {
        logUtils.debugInfo("正在进入好友森林页面...");
        floaty_show_text("正在进入好友森林页面...")
        openPage()

        sleep(1000)
    }
    //idContains('J_userEnergy').waitFor()
    //desc("关闭").waitFor()
    sleep(2000)
    let compelte = false
    while (!compelte) {
        if (textMatches('(.*)的蚂蚁森林').exists() && textMatches('TA收取你|你收取TA').exists()) {
            logUtils.infoLog("进入好友森林页面成功！");
            floaty_show_text("进入好友森林页面成功！")
            var SendToolPoint = checkAndClickSend()
            //log(SendToolPoint)
            if (SendToolPoint) {
                click(SendToolPoint.centerX, SendToolPoint.centerY)
            }
            let waitTime=0
            while (!text('我的道具').exists()) { 
                if(waitTime>4){
                    SendToolPoint = checkAndClickSend()
                    if (SendToolPoint) {
                        click(SendToolPoint.centerX, SendToolPoint.centerY)
                        waitTime=0
                    } 
                }
                waitTime++
                sleep(1000)
            }
            //text('我的道具').waitFor()
            sleep(1000)
            while (!textContains("还没有道具").exists()) {
                if (className("android.view.View").text('赠送').exists()) {
                    className("android.view.View").text('赠送').click()
                }
                sleep(1000)
                if (className("android.widget.Button").text("赠送").exists()) {
                    className("android.widget.Button").text("赠送").click()
                }
            }
            logUtils.logInfo("没有可送的道具了，返回...")
            //idContains("h5_nav_back").desc("返回").findOnce().child(0).click()
            compelte = true
            closePage()
        } else if (text('查看更多好友').exists()) {
            logUtils.debugInfo("自己森林页面，返回！");
            compelte = true
            closePage()
        } else if (text('加为好友').exists() || text('返回我的森林').exists()) {
            logUtils.debugInfo("未添加好友，返回！");
            compelte = true
            closePage()
        } else {
            reEnter()
        }
        openPage()
        sleep(1000)
    }
}

function reEnter() {
    if (className("android.view.View").text("重新加载").exists()) {
        try {
            className("android.view.View").text("重新加载").findOne(1000).click()
            sleep(1000)
        } catch (e) { }
    }
}
function wateringFriend(friendId) {
    JumpToFirend(friendId)
    while (!desc("关闭").exists()) {
        logUtils.debugInfo("正在进入好友森林页面...");
        floaty_show_text("正在进入好友森林页面...")
        openPage()
        sleep(1000)
    }
    //idContains('J_userEnergy').waitFor()
    //desc("关闭").waitFor()
    sleep(2000)
    let compelte = false
    while (!compelte) {
        if (textMatches('(.*)的蚂蚁森林').exists() && textMatches('TA收取你|你收取TA').exists()) {
            logUtils.infoLog("进入好友森林页面成功！");
            floaty_show_text("进入好友森林页面成功！")
            let count = 0
            while (count++ < wateringTimes) {
                _widgetUtils.wateringFriends()
                sleep(1500)
            }
            compelte = true
            closePage()

        } else if (text('查看更多好友').exists()) {
            logUtils.debugInfo("自己森林页面，返回！");
            compelte = true
            closePage()
        } else if (text('加为好友').exists() || text('返回我的森林').exists()) {
            logUtils.debugInfo("未添加好友，返回！");
            compelte = true
            closePage()
        } else {
            reEnter()
        }
        openPage()
        sleep(1000)
    }
}


function is_Energy_rain_complete() {
    if (!text('查看更多好友').exists() && !text('排行榜').exists()) {
        logUtils.warnInfo("当前不在蚂蚁森林个人主页，正在进入蚂蚁森林主页")
        closePage()
        Ant_forest()
        sleep(1000)
    }
    let clickTimes = 0
    let countT = 0
    while (true) {
        if (idContains("J_tree_dialog_wrap").exists()) {
            if (text('天天能量雨').exists()) {
                var Energy_rain_everyday = text('天天能量雨').findOne(1000)
                if (Energy_rain_everyday) {
                    let complete_today = Energy_rain_everyday.parent().findOne(text("今日已完成"))
                    let close_reward = Energy_rain_everyday.parent().parent().parent().child(1)
                    if (close_reward) { try { close_reward.click() } catch (e) { } }
                    if (complete_today) {
                        //complete_today.click()
                        return true
                    } else {
                        return false
                    }
                }
            } else {
                let reward_button = checkAndClickReward()
                if (reward_button) {
                    click(reward_button.centerX, reward_button.centerY)
                    clickTimes++
                }
            }
            if (clickTimes >= 3) {
                logUtils.errorInfo("奖励按钮可能失效了，重新进入蚂蚁森林主页")
                closePage()
                Ant_forest()
                return false
            }
        } else {
            if (countT > 5) {
                logUtils.warnInfo("当前不在蚂蚁森林个人主页，正在进入蚂蚁森林主页")
                closePage()
                Ant_forest()
                countT = 0
            }
            countT++
        }
        sleep(1000)
    }
}

function checkAndClickReward() {
    // 直接通过偏移量获取送奖励按钮
    let target = null
    if (idContains("J_pop_treedialog_close").exists()) {
        try { idContains("J_pop_treedialog_close").click() } catch (e) { }
    } else {
        let jTreeWarp = idContains('J_tree_dialog_wrap').findOne(1000)
        if (jTreeWarp) {
            let warpBounds = jTreeWarp.bounds()
            target = {
                centerX: parseInt(warpBounds.left - 0.3 * warpBounds.width()),
                centerY: parseInt(warpBounds.bottom - 0.28 * warpBounds.height())
            }
        }
    }
    return target
}


function openRainPage() {
    app.startActivity({
        action: 'VIEW',
        data: 'alipays://platformapi/startapp?appId=20000067&url=' + encodeURIComponent('https://68687791.h5app.alipay.com/www/index.html'),
    })
    logUtils.debugInfo("正在打开能量雨页面...");
    floaty_show_text("正在打开能量雨页面...")
    while (!textMatches('开始拯救绿色能量|再来一次|立即开启|.*去蚂蚁森林看看.*').findOne(1000)) {
        openPage()
        sleep(200)
    }
}


function collectOwn() {
    logUtils.warnInfo('准备收集自己能量')
    let energyBeforeCollect = getCurrentEnergy()
    collectEnergy()
    //  避免只收自己时控件刷新不及时导致漏收
    sleep(1000)
    _post_energy = getCurrentEnergy()
    let collectedEnergy = _post_energy - energyBeforeCollect
    if (collectedEnergy) {
        logUtils.logInfo(['收集自己能量：{}g', collectedEnergy])
        floaty_show_text("收集自己能量：" + collectedEnergy + 'g')
    }
}

function collectEnergy() {
    logUtils.warnInfo('直接通过图像分析收取能量')
    scanner.isProtectDetectDone = true
    scanner.checkAndCollectByHough()
    /*     let scanner = new _BaseScanner()
        let balls = []
        let invalidBalls = []
        scanner.checkAndCollectByHough(true, ball => { balls.push(ball) }, null, invalid => { invalidBalls.push(invalid) })
        scanner.destroy() */
}

function getCurrentEnergy() {
    let currentEnergyWidget = _widgetUtils.widgetGetById(config.energy_id || 'J_userEnergy')
    let currentEnergy = undefined
    if (currentEnergyWidget) {
        let content = currentEnergyWidget.text() || currentEnergyWidget.desc()
        currentEnergy = parseInt(content.match(/\d+/))
    }
    logUtils.warnInfo(['getCurrentEnergy 获取能量值: {}', currentEnergy])
    return currentEnergy
}

listenStopCollect()
main();