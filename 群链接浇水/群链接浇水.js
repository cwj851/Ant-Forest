var wateringNum = 500;  //水量
let IsWatering = true   //是否浇水
let NoInterruptions = true  //是否开启免打扰

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

var path = './群链接文本.txt'
let GroupsUrlMsgObj = []
if (files.exists(path)) {
  var file = open(path);
  var textUrl = file.read();
  var GroupsUrlMsg = textUrl.split('origin=11')
  for (var i = 0; i < GroupsUrlMsg.length; i++) {
    if (GroupsUrlMsg[i] != '') {
      if (GroupsUrlMsg[i].indexOf('http') > -1) {
        let result = getValueEx('https', 'comment=1', GroupsUrlMsg[i])
        if (result != '') {
          GroupsUrlMsgObj.push(result + '&origin=11')
        }
      }
    }
  }
}


function getValueEx(key1, key2, str) {
  var m = str.match(new RegExp(key1 + '(.*?)' + key2));
  return m ? m[0] : '';
}




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

function watering_Ex(group_name, waterNum) {
  var complete = false
  var cooperate_energy;
  var My_energy
  let countj = 0
  while (!complete) {
    if (idContains("tv_title").textContains(group_name).exists()) {
      //logUtils.infoLog('群名：'+group_name);
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
              var waterTarget = text("浇水").findOne().bounds()
              sleep(500)
              var Etext2 = gtext.findOne(className("android.widget.EditText")).text()
              console.info('本次浇水：' + Etext2 + 'g');
              complete = true
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

function closeUpdata() {
  if (text("暂不更新").exists() && text("更新").exists()) {
      text("暂不更新").click();
  }
}

function open_No_interruptions() {
  while (!className("android.widget.TextView").text("群设置").exists()) {
    if (className("android.widget.ImageView").desc("群聊信息").exists()) {
      try { desc("群聊信息").click() } catch (e) { }
    } else {
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

function BacktoMainPage() {
  while (!packageName('com.alibaba.android.rimet').text("消息").exists()) {
    clickBack()
    sleep(500)
  }
}

function main() {
  if (GroupsUrlMsgObj.length < 1) {
    toast('提取群链接失败！')
    return
  }
  console.show()
  start_app()
let isEnter=true
  for (var i = 0; i < GroupsUrlMsgObj.length; i++) {
    console.log('-------------------------')
    console.verbose('准备进入群链接：'+GroupsUrlMsgObj[i])
    enterGroupByUrl(GroupsUrlMsgObj[i])
    isEnter=true
    while (!className("android.widget.ImageView").desc("群聊信息").exists()) {
      if (idContains("btn_add_to_group").exists()) {
        idContains("btn_add_to_group").click()
        sleep(200)
      }
      if(className("android.widget.TextView").text("入群请求").exists()&&className("android.widget.TextView").text("发送").exists()){
        className("android.widget.TextView").text("发送").click()
        console.info('进群需审核，已发送申请！')
        sleep(200)
        isEnter=false
        break
      }
      if(idContains("tv_verify_error").exists()){
        clickBack()
        console.warn('该群不存在或不可被搜索！')
        sleep(200)
        isEnter=false
        break
      }
      
      
    }
    if(isEnter){
      var GroupName = idContains("tv_title").findOne().text()
      console.log('====================')
      console.log('群名：' + GroupName)
      if (IsWatering) {
        watering_Ex(GroupName, wateringNum)
      }
      if (NoInterruptions) {
        open_No_interruptions()
      }
    }
    BacktoMainPage()
  }
  console.log('====================')
  console.error('运行结束，共操作群' + GroupsUrlMsgObj.length + '个')
}

main()
