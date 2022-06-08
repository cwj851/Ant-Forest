let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, global)
let automator = singletonRequire('Automator')
var { default_config, config, storage_name: _storage_name } = require('../config.js')(runtime, global)
let args = engines.myEngine().execArgv
let toastListenThread = null
let toastDone = false
let startTimestamp = null
let limitTime = 30000
// 检测是否全部完成
function getToastAsync(filter) {
    filter = typeof filter == null ? '' : filter
    // 在新线程中开启监听
    toastListenthread = threads.start(function () {
        events.observeToast();
        events.onToast(function (toast) {
            if (toastDone) {
                return
            }
            let text = toast.getText()
            log('获取的toast文本:{}', text)
            if (toast.getPackageName().indexOf(filter) >= 0) {
                if (/.*今天所有行动已经完成.*/.test(text)) {
                    toastDone = true
                }
            }
        })
    })
}

function Ant_forest() {
    app.startActivity({
        action: "VIEW",
        data: "alipays://platformapi/startapp?saId=60000002",
    });
}

function enterGreenAction() {
    if (!text('查看更多好友').exists() && !text('排行榜').exists()) {
        Ant_forest()
        sleep(1000)
 }
    let clickTimes = 0
    let countT = 0
    while (!idContains("h5_tv_title").text("绿色行动").exists()) {
        if (idContains("J_tree_dialog_wrap").exists()) {
            if (text('绿色行动').exists()) {
                var GreenAction = text('绿色行动').findOne(1000)
                if (GreenAction) {
                    let OpenGreenAction = GreenAction.parent().findOne(text("去打卡"))
                    if (OpenGreenAction) {
                        OpenGreenAction.click()
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
                console.error("奖励按钮可能失效了，重新进入蚂蚁森林主页")
                closePage()
                Ant_forest()
                sleep(2000)
            }
        } else {
            if (countT > 5) {
                console.warn("当前不在蚂蚁森林个人主页，正在进入蚂蚁森林主页")
                closePage()
                Ant_forest()
                sleep(2000)
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
                centerY: parseInt(warpBounds.bottom - 0.07 * warpBounds.height())
            }
        }
    }

    return target
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

function main(){
    enterGreenAction()
    startTimestamp = new Date().getTime()
    getToastAsync('com.eg.android.AlipayGphone')
    while (!toastDone) {
        if (text("打卡").exists()) {
            text("打卡").find().forEach(function (child) {
                try { child.click() } catch (e) { }
                sleep(300)
            });    
        }
        if (text("换一批").exists()) {
            let changeOne = text("换一批").findOnce()
            if (changeOne) {
                changeOne.click()
                sleep(500)
            }
        }
        sleep(500)
        if (new Date().getTime() - startTimestamp > parseInt(limitTime)) {
            console.warn('执行任务超时，结束脚本')
            toastDone = true
        }
    }
    
    events.removeAllListeners('toast')
    toastListenthread.interrupt()
}
main()
closePage()
home()
if ((config.auto_lock && args.needRelock)==true) {
    log('重新锁定屏幕')
    automator.lockScreen()
  }
try { setTimeout(() => { exit() }, 1000 * 5); } catch (e) { }




