let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, global)
let automator = singletonRequire('Automator')
var { default_config, config, storage_name: _storage_name } = require('../config.js')(runtime, global)
let args = engines.myEngine().execArgv

function antForestSetting(){
    app.startActivity({
        action: "VIEW",
        data: "alipays://platformapi/startapp?appId=20000067&url=" + encodeURIComponent('https://render.alipay.com/p/f/antforest'),
    });
}
function openPage() {
    if (textContains("取消").exists() && textContains("打开").exists()) {
        text("打开").click();
    }
}

function Ant_forest() {
    app.startActivity({
        action: "VIEW",
        data: "alipays://platformapi/startapp?saId=60000002",
    });
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

function OpenNotice() {
/*     if (!text('查看更多好友').exists() && !text('排行榜').exists()) {
        Ant_forest()
        sleep(1000)
 } */
    let clickTimes = 0
    let countT = 0
    let complete=false
    while (!complete) {
        if (idContains("J_tree_dialog_wrap").exists()) {
            if (text('开通能量提醒').exists()) {
                var EnergyNotice = text('开通能量提醒').findOne(1000)
                if (EnergyNotice) {
                    let OpenEnergyNotice = EnergyNotice.parent().findOne(text("去开通"))
                    if (OpenEnergyNotice) {
                        OpenEnergyNotice.click()
                    } else {
                        let OpenEnergyNoticeReward = EnergyNotice.parent().findOne(text("立即领取"))
                        if(OpenEnergyNoticeReward){
                            OpenEnergyNoticeReward.click()
                        }else{
                            let compelteToday = EnergyNotice.parent().findOne(text("已完成"))
                            if(compelteToday){
                                complete=true
                                closePage()
                            }
                        }
                    }
                }
            } else if(text('背包').exists()&&text('道具').exists()) {
                complete=true
                closePage()

            }else{
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

function main(){
    antForestSetting()
    while(!idContains("J_notice_checkbox").exists()){
        openPage()
        sleep(1000)
    }
    while(true){
        var notice_checkbox=idContains("J_notice_checkbox").findOne()
        if(notice_checkbox.checked()){
            notice_checkbox.click()
        }else{
            break
        }
        sleep(500)
    }
    closePage()
    Ant_forest()
    OpenNotice()
}


main()
home()
if ((config.auto_lock && args.needRelock)==true) {
    log('重新锁定屏幕')
    automator.lockScreen()
  }
try { setTimeout(() => { exit() }, 1000 * 5); } catch (e) { }