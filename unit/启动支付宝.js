let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, global)
let automator = singletonRequire('Automator')
let args = engines.myEngine().execArgv
var { default_config, config, storage_name: _storage_name } = require('../config.js')(runtime, global)
/* importClass(android.graphics.Color);
importClass(android.widget.AdapterView);
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
})); */
log(args)
main();


function delay(seconds) {
    sleep(1000 * seconds); //sleep函数参数单位为毫秒所以乘1000
}
/**
 * @description: 启动app
 * @param: null
 * @return: null
 */

function start_app() {
    console.verbose("正在启动app...");
    if (!(launchApp("支付宝") || launch('com.eg.android.AlipayGphone'))) //启动支付宝
    {
        console.error("找不到支付宝App!，请自己尝试打开");
        // return;
    }
    delay(2)
    while (!packageName('com.eg.android.AlipayGphone').text("我的").exists()) {
        console.log("正在等待加载出主页，如果一直加载此信息，请手动返回主页，或者无障碍服务可能出现BUG，请停止运行App重新给无障碍服务");
        closePage()
        closeUpdata()
        openPage()
        delay(2);
    }
    console.info("启动app成功！");
    delay(1);
}

function closeUpdata() {
    if (textContains("稍候再说").exists() && textContains("立即更新").exists()) {
        text("稍候再说").click();
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
    _golThread = threads.start(function () {
        //console.show();
        start_app()
        Ant_forest()
        sleep(2000)
        home()
        log(typeof(config.auto_lock), typeof(args.needRelock), config.auto_lock && args.needRelock)
        if ((config.auto_lock && args.needRelock)==true) {
            log('重新锁定屏幕')
            automator.lockScreen()
          }
        exit();
    })
}



function Ant_forest() {
    app.startActivity({
        action: "VIEW",
        data: "alipays://platformapi/startapp?saId=60000002",
    });
}