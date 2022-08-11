var { default_config, config, storage_name: _storage_name } = require('../config.js')(runtime, global)
let storageConfig = storages.create(_storage_name)
let group_lists = [];

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
                try {
                    if (MyGroups.click()) {

                    } else {
                        MyGroups.parent().click()
                    }
                } catch (e) { }
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

function Read_Mygroup_lists_by_scroll() {
    while (!idContains("tv_text").className("android.widget.TextView").text("我加入的").exists()) { }
    if (idContains("group_list").find().length > 1) {
        var is_theEnd = false
        while (!is_theEnd) {
            Read_Mygroup_lists()
            if (idContains("group_list").exists()) {
                var scrollL = idContains("group_list").find()[0]
                is_theEnd = !scrollL.scrollDown()
                sleep(100)
            }
            sleep(200)
        }
    }
}

function Read_Mygroup_lists() {
    while (true) {
        if (idContains("tv_text").className("android.widget.TextView").text("我创建的").exists()) {
            var MyBuildGroups = idContains("tv_text").className("android.widget.TextView").text("我创建的").findOne().parent().parent().parent()
            if (MyBuildGroups.selected()) {
                //log("当前页面(我加入的)");
                log("检测中...请勿操作手机");
                idContains("group_list").find()[0].children().forEach(child => {
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
                try {
                    if (MyBuildGroups.click()) {

                    } else {
                        MyBuildGroups.parent().click()
                    }
                } catch (e) { }
            }
        }
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

console.show()
start_app()
if (config.intent_or_click == 'a') {
    group_lists_manager()
} else if (config.intent_or_click == 'b') {
    mine_group()
}

while (!idContains("tv_text").className("android.widget.TextView").text("我加入的").exists()) { }
var group_listlength = idContains("group_list").find().length
if (group_listlength == 1) {
    sleep(1000)
    Read_group_lists_by_scroll()
} else if (group_listlength == 2) {
    sleep(1000)
    Read_Mygroup_lists_by_scroll()
    sleep(1000)
    Read_group_lists_by_scroll()
}
console.log('====================')
console.warn('提取完毕！共提取' + group_lists.length + '个')
if (group_lists.length > 0) {
    storageConfig.put("DDmineGroupList", group_lists)
    toast("提取群组列表成功：" + group_lists.length + '个')
} else {
    toast("提取群组列表失败！")
}
sleep(5000)
console.hide()