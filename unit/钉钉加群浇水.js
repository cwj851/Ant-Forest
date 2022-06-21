var { default_config, config, storage_name: _storage_name } = require('../config.js')(runtime, global)
let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, global)
let AntForestDao = singletonRequire('AntForestDao')

let waterGroupcount=0
let watercount=0

let addGroupNum=parseInt(config.addGroupNum)
let firstGroupUrl=config.firstGroupUrl
var wateringNum;
function enterGroupByUrl(GroupByUrl) {
    app.startActivity({
        action: "VIEW",
        data: "dingtalk://dingtalkclient/page/link?url=" + encodeURIComponent(GroupByUrl),
    });

}

/* function start_app() {
    log("正在启动app...");
    if (!(launchApp("钉钉") || launch('com.alibaba.android.rimet'))) //
    {
        log("找不到钉钉App!，请自己尝试打开");
        // return;
    }
    sleep(2000)
    //ZFB_SY()
    while (!packageName('com.alibaba.android.rimet').exists()) {}
    log("启动app成功！");
    sleep(1000);
} */

function start_app() {
    log("正在启动app...");
    if (!(launchApp("钉钉") || launch('com.alibaba.android.rimet'))) //
    {
        log("找不到钉钉App!，请自己尝试打开");
        // return;
    }
    sleep(2000)
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


function watering_Ex(group_name, waterNum) {
    var complete = false
    var cooperate_energy;
    var My_energy
    let countj=0
    while (!complete) {
        if (idContains("tv_title").textContains(group_name).exists()) {
            //logUtils.infoLog('群名：'+group_name);
            if (idContains("title").text("公益树").exists()) {
                var gysTarget = idContains("title").text("公益树").findOne().parent().parent()
                if (gysTarget) {
                    gysTarget.click()
                    console.warn('正在进入公益树...');
                }
            }  else {
                if(countj>3){
                    while (!className("android.widget.TextView").text("群设置").exists()) {
                        if (className("android.widget.ImageView").desc("群聊信息").exists()) {
                            try { desc("群聊信息").click() } catch (e) { }
                        }
                        sleep(500)
                    }
                    while (!idContains("tv_title").textContains(group_name).exists()) {
                        if (className("android.widget.ImageButton").desc("返回").exists()) {
                            className("android.widget.ImageButton").desc("返回").click()
                        }
                        sleep(1000)
                    }
                    countj=0
                }else{
                    countj++
                }
            } 
        }
        if (text('总排行榜').exists()) {
            cooperate_energy = get_cooperate_energy()
            var WaterPoint = checkAndClickWater()
            if (WaterPoint) {
                click(WaterPoint.centerX, WaterPoint.centerY)
                sleep(500)
            }
            while (true) {
                if (text("我知道了").exists() && text("继续浇水").exists()) {
                    if (config.AddGroupMaxContinue) {
                        try { text("继续浇水").click(); } catch (e) { }
                        console.error('超过200人选择继续浇水...');
                    } else {
                        try { text("我知道了").click(); } catch (e) { }
                        console.warn('超过200人选择停止浇水...');
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
                            var waterTarget = text("浇水").findOne().bounds()
                            sleep(500)
                            var Etext2 = gtext.findOne(className("android.widget.EditText")).text()
                            console.info('本次浇水：' + Etext2 + 'g');
                            complete = true
                            watercount += parseInt(Etext2);
                            click(waterTarget.centerX(), waterTarget.centerY())
                            sleep(200)
                            AntForestDao.saveFriendCollect(group_name, cooperate_energy, My_energy, parseInt(Etext2))
                            closePage()
                            break
                        }
                    }
                } else {
                    WaterPoint = checkAndClickWater()
                    if (WaterPoint) { 
                        click(WaterPoint.centerX, WaterPoint.centerY) 
                        sleep(500)
                    }
                }
                if (className("android.view.View").text("知道了").exists()) {
                    var ikonwTarget = text("知道了").findOne().bounds()
                    sleep(500)
                    console.error('已浇过水，执行跳过...');
                    click(ikonwTarget.centerX(), ikonwTarget.centerY())
                    closePage()
                    complete = true
                    break
                }
            }
        }
        sleep(500)
    }
}


function get_cooperate_energy() {
    var plantTrees = className("android.view.View").text("种树").findOne(1000)
    if (plantTrees) {
        return plantTrees.parent().child(0).text()
    }
    return ''
}

function get_My_energy() {
    var gtext = className("android.view.View").text("g").findOne(1000).parent().parent()
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

function closePage() {
    if (idContains("close_layout").desc("关闭").exists()) {
        idContains("close_layout").desc("关闭").click()
        sleep(200)
    }
}

function open_No_interruptions() {
    while (!className("android.widget.TextView").text("群设置").exists()) {
        if (className("android.widget.ImageView").desc("群聊信息").exists()) {
            try { desc("群聊信息").click() } catch (e) { }
        }else{
            closePage()
        }
        sleep(500)
    }
    let No_interruptions = false
    while (className("android.widget.TextView").text("群设置").exists()) {
        if (idContains("menu_item_title").className("android.widget.TextView").text("消息免打扰").exists()) {
            var no_inter_target = idContains("menu_item_title").text("消息免打扰").findOne().parent()
            if (no_inter_target) {
                var no_inter_button = no_inter_target.findOne(idContains("menu_item_toggle"))
                if (no_inter_button) {
                    if (no_inter_button.checked()) {
                        No_interruptions = true
                        console.warn("免打扰已为开启状态！");
                    } else {
                        No_interruptions = false
                        no_inter_button.click()
                        console.warn("开启消息免打扰成功！");
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
function enterToNextGroup(group_name){
    while(idContains("tv_title").textContains(group_name).exists()) {
        if (idContains("new_top_menu").exists()) {
            var card_view = idContains("card_view_container").findOne()
            var groupURl = card_view.findOne(text('链接'))
            if (groupURl) {
                groupURl.parent().child(4).click()
                sleep(200)
            }
        }
        sleep(500)
    }   
    while (!idContains("rl_title_container").exists()) { 
        if(idContains("btn_add_to_group").exists()){
            idContains("btn_add_to_group").click()
            sleep(200)
        }
    sleep(500)
    }
   return idContains("tv_title").findOne().text()
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

function BacktoGroupTalkingPage() {
    while (!className("android.widget.ImageView").desc("群聊信息").exists()) {
      clickBack()
      sleep(500)
    }
  }

function main(){
if(firstGroupUrl==''){
    toast('未设置起始群链接')
    return
}
if(addGroupNum<1){
    toast('加群数量小于1')
    return
}
    console.show()
    if (config.AddGroupWaterMode == "1") {
        wateringNum = -1
    } else if (config.AddGroupWaterMode == "2") {
        wateringNum = 500
    } else if (config.AddGroupWaterMode == "3") {
        if (!config.AddGroupWaterNum || config.AddGroupWaterNum < 0) config.AddGroupWaterNum = 500;
        wateringNum = config.AddGroupWaterNum
    }
    start_app()
    enterGroupByUrl(firstGroupUrl)
    while (!className("android.widget.ImageView").desc("群聊信息").exists()) {}
    var GroupName=idContains("tv_title").findOne().text()
    for (var  i= 0; i < addGroupNum; i++) {
        console.log('====================')
        console.verbose('成功进入第'+(i+1)+'个群')
        console.log('群名：'+GroupName)
        if (config.AddGroupIsWatering) {
            watering_Ex(GroupName,wateringNum)
        }
        if (config.AddGroupNoInterruptions) {
            open_No_interruptions()           
            BacktoGroupTalkingPage()
        }
        if(i < (addGroupNum-1)){
            var newGroupName=enterToNextGroup(GroupName)
            GroupName=newGroupName
        }
    }
    console.log('====================')
    console.error('运行结束，本次共加群'+addGroupNum+'个')
}
main()
