let currentEngine = engines.myEngine()
let runningEngines = engines.all()
let runningSize = runningEngines.length
let currentSource = currentEngine.getSource() + ''
if (runningSize > 1) {
  runningEngines.forEach(engine => {
    let compareEngine = engine
    let compareSource = compareEngine.getSource() + ''
    if (currentEngine.id !== compareEngine.id && compareSource === currentSource) {
      // 强制关闭同名的脚本
      compareEngine.forceStop()
    }
  })
}

let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, global)
let AntForestDao = singletonRequire('AntForestDao')
let logUtils = singletonRequire('LogUtils')

let dateFormat = require('../lib/DateUtil.js')
var { default_config, config, storage_name: _storage_name } = require('../config.js')(runtime, global)
var configStorage = storages.create(_storage_name)

let watercount = 0;
let waterGroupcount = 0;
let DdGroups_list = []

function mine_group() {
  app.startActivity(app.intent({
    action: "VIEW",
    packageName: 'com.alibaba.android.rimet',
    data: "dingtalk://dingtalkclient/page/link?url=" + encodeURIComponent("https://qr.dingtalk.com/mine_group_conversation.html"),
  }));
}

function search_groupsAndclick(group_name) {
  let complete = false
  let doubleCheck = false
  while (!complete) {
    if (textContains(group_name).exists()) {
      if (text("未搜索到相关结果").exists()) {
        logUtils.logInfo(group_name + '未搜索到相关结果')
        if (doubleCheck) {
          complete = true
        } else {
          sleep(3000)
        }
        doubleCheck = true
      } else if (text("我的群组").exists()) {
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
      var search_groups = idContains("search_src_text").findOne(1000)
      if (search_groups) {
        logUtils.debugInfo("开始查找群：" + group_name)
        search_groups.setText(group_name)
      }
      if (idContains("view_search").exists()) {
        try { idContains("view_search").findOne(1000).click() } catch (e) { }
      }
    }
    if (!idContains("search_src_text").exists() && text("我加入的").exists()) {
      if (idContains("view_search").exists()) {
        try { idContains("view_search").findOne(1000).click() } catch (e) { }
      }
    }
    if (text("消息").exists()&&text("通讯录").exists()) {
      mine_group()
      sleep(1000)
    }
    sleep(500)
  }
  return false
}

function watering_Ex(group_name, idx) {
  var complete = false
  var cooperate_energy;
  var My_energy
  let Gname
  let countj = 0
  while (!complete) {
    if (idContains("tv_title").textContains(group_name).exists()) {
      //logUtils.infoLog('群名：'+group_name);
      Gname=idContains("tv_title").textContains(group_name).findOne().text()
      if (idContains("title").text("公益树").exists()) {
        var gysTarget = idContains("title").text("公益树").findOne().parent().parent()
        if (gysTarget) {
          gysTarget.click()
          console.warn('正在进入公益树...');
        }
      } else {
        if (countj > 3) {
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
          countj = 0
        } else {
          countj++
        }
      }
    }
    if (text('总排行榜').exists()) {
      let Sumcharts = text('总排行榜').findOne(1000)
      Sumcharts.parent().click()
      sleep(500)
      let dailycharts = textMatches('总排行榜').findOne(1000)
      var ListTarget = dailycharts.parent().parent().child(2).children()
        var waternumTarget = ListTarget[0].findOne(textMatches(/.*?\dk?g/))
        if (waternumTarget) {
          var waternum = waternumTarget.text()
          log({'群名':Gname,'水量':waternum})
          DdGroups_list[idx]={'群名':Gname,'水量':waternum}
          waterGroupcount++
          break
        }
    }
    sleep(500)
  }
}

function closePage() {
  if (idContains("close_layout").desc("关闭").exists()) {
    idContains("close_layout").desc("关闭").click()
    sleep(200)
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


function back_to_group_search() {
  while (true) {
    if (idContains("search_src_text").exists()) {
      break
    } else if (text("消息").exists() && text("通讯录").exists()) {
      break
    } else {
      if (className("android.widget.ImageView").desc("群聊信息").exists() || text('总排行榜').exists() || className("android.widget.TextView").text("群设置").exists() || text("成就").exists()) {
        clickBack()
        sleep(500)
      }
    }
    sleep(100)
  }
}


function WateringByGrouplists() {
  for (var i = 0; i < config.CheckTheCertificateGroups.length; i++) {
    DdGroups_list.push({群名:config.CheckTheCertificateGroups[i].GroupName,水量:''})
  }
/*   for (var k = 0; k < config.DdWateringGroups.length; k++) {
    DdGroups_list.push({群名:config.DdWateringGroups[k].GroupName,水量:''})
  } */
  for (var j = 0; j < DdGroups_list.length; j++) {
    if (search_groupsAndclick(DdGroups_list[j].群名)) {
      console.info('群名：' + DdGroups_list[j].群名);
      while (!idContains("tv_title").textContains(DdGroups_list[j].群名).exists()) { }
      watering_Ex(DdGroups_list[j].群名, j)
      console.log("====================");
      back_to_group_search()
    }
  }
  files.ensureDir('./合种总榜水量查询/')
  var path = './合种总榜水量查询/合种总榜水量.txt'
  var file = open(path, 'w')
  for (var i = 0; i < DdGroups_list.length; i++) {
    //log(JSON.stringify(palntmsgList[i]))
    file.writeline(JSON.stringify(DdGroups_list[i]))
  }
  file.close()
}

function main() {
  mine_group()
  WateringByGrouplists()
  console.log("====================");
  console.error("线程结束！本次运行已完成！");
  console.info("查询：" + waterGroupcount + "个群");
  console.log("====================");
}

console.show()
main()
clickBack()
sleep(1000)
clickBack()
try { setTimeout(() => { exit() }, 1000 * 5); } catch (e) { }