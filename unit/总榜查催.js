var { default_config, config, storage_name: _storage_name } = require('../config.js')(runtime, global)
let scrollspeed = 300  //向下滑动速度
let scrolTimes = 30 //向下滑动次数
//let InviteWateringGroupList = [{ groupName: 'D042往事永动', whiteList: 'WS0001|WS0029|VIP|WS0029|VIP',CheckNum:'20000' }]
let InviteWateringGroupList = config.InviteWateringGroupListSum
let SumOnly = config.SumOnly

if (config.show_small_floaty) {console.show()}

function scrollDownbySwipe(speed) {
  let millis = speed || 500
  let deviceHeight = device.height || 1900
  let bottomHeight = 250
  let x = parseInt(device.width / 2)
  swipe(x, deviceHeight - bottomHeight, x + 100, parseInt(deviceHeight / 5), millis)
}

function scrolltoBottom(speed) {
  let counti = 0
  let STimes = scrolTimes || 30
  while (counti++ < STimes) {
    scrollDownbySwipe(speed)
    sleep(100)
  }
  let STarget = scrollable(true).findOne(1000)
  let is_bottom = false
  while (!is_bottom) {
    var scroll = STarget.scrollDown()
    if (!scroll) { is_bottom = true }
    sleep(500)
  }
}

function InvitewateringBySumcharts(NotFullYetList) {
  NotFullYetList = typeof NotFullYetList != 'object' ? [] : NotFullYetList
  remidList = []
  scrolltoBottom(scrollspeed)
  let dailycharts = textMatches('日排行榜').findOne(1000)
  var ListTarget = dailycharts.parent().parent().child(2).children()
  for (var i = 1; i < ListTarget.length; i++) {
    var UnwateredTarget = ListTarget[i].findOne(text('邀请浇水'))
    if (UnwateredTarget) {
      let UnwateredTargetindex = UnwateredTarget.indexInParent()
      var nickname = UnwateredTarget.parent().child(UnwateredTargetindex - 1).child(0).text()
      if (NotFullYetList) {
        if (IsNotFullYetList(NotFullYetList, nickname)) {
          console.info('提醒：[' + nickname + '] 浇水')
          UnwateredTarget.click()
          //idContains("button2").text('取消').findOne().click()
          idContains("button1").text('确认').findOne().click()
          sleep(200)
          remidList.push(nickname)
        }
      }
    }
  }
  return remidList.length
}

function CheckSumChartsWaterNum(WhiteList, CheckNum) {
  WhiteList = typeof WhiteList != 'object' ? [] : WhiteList
  let NotFullYetList = []
  scrolltoBottom(scrollspeed)
  let dailycharts = textMatches('日排行榜').findOne(1000)
  var ListTarget = dailycharts.parent().parent().child(2).children()
  for (var i = 1; i < ListTarget.length; i++) {
    var waternumTarget = ListTarget[i].findOne(textMatches(/.*?\dk?g/))
    if (waternumTarget) {
      var waternum = waternumTarget.text()
      var nickname
      if (changeWaterNumToG(waternum) < parseInt(CheckNum)) {
        let waternumTargetindex = waternumTarget.indexInParent()
        nickname = waternumTarget.parent().child(waternumTargetindex - 1).child(0).text()
        if (WhiteList) {
          if (SumOnly) {
            if (nickname.indexOf('WS') > -1) {
              if (IsInWhiteList(WhiteList, nickname)) { } else {
                NotFullYetList.push(nickname)
              }
            }
          } else {
            if (IsInWhiteList(WhiteList, nickname)) { } else {
              NotFullYetList.push(nickname)
            }
          }
        }
      }
    }
  }
  return NotFullYetList
}

function IsNotFullYetList(NotFullYetList, nickname) {
  for (var i = 0; i < NotFullYetList.length; i++) {
    if (nickname.indexOf(NotFullYetList[i]) >= 0) {
      return true
    }
  }
  return false
}

function IsInWhiteList(WhiteList, nickname) {
  for (var i = 0; i < WhiteList.length; i++) {
    if (nickname.indexOf(WhiteList[i]) >= 0) {
      return true
    }
  }
  return false
}

function changeWaterNumToG(WaterNum) {
  if (WaterNum.indexOf('kg') > -1) {
    return parseInt(parseFloat(WaterNum) * 1000)
  } else {
    return parseInt(WaterNum)
  }
}

let remindGroup = []
function InviteWateringByGrouplists(InviteWateringGroupList) {
  for (var j = 0; j < InviteWateringGroupList.length; j++) {
    if (search_groupsAndclick(InviteWateringGroupList[j].groupName)) {
      console.info('群名：' + InviteWateringGroupList[j].groupName);
      while (!idContains("tv_title").textContains(InviteWateringGroupList[j].groupName).exists()) { }
      OpentheBenefitTree(InviteWateringGroupList[j].groupName)
      if (text('总排行榜').exists()) {
        let Sumcharts = text('总排行榜').findOne(1000)
        Sumcharts.parent().click()
      }
      let InviteWhiteList = InviteWateringGroupList[j].whiteList ? InviteWateringGroupList[j].whiteList.split('|') : []
      let NotFullYetList = CheckSumChartsWaterNum(InviteWhiteList, InviteWateringGroupList[j].CheckNum)
      log(NotFullYetList)
      backToTop()
      if (text('日排行榜').exists()) {
        let dailycharts = text('日排行榜').findOne(1000)
        dailycharts.parent().click()
        sleep(1000)
      }
      var remindNum = InvitewateringBySumcharts(NotFullYetList)
      closePage()
      remindGroup.push({ 群名: InviteWateringGroupList[j].groupName, 查催: remindNum })
      console.warn({ 群名: InviteWateringGroupList[j].groupName, 查催: remindNum })
      console.log("====================");
      mine_group()
    }
  }
}

function backToTop() {
  let STarget = scrollable(true).findOne(1000)
  let is_top = false
  while (!is_top) {
    var scroll = STarget.scrollUp()
    if (!scroll) { is_top = true }
    sleep(100)
  }
}

function start_app() {
  console.verbose("正在启动app...");
  //floaty_show_text("正在启动app...")
  if (!(launchApp("钉钉") || launch('com.alibaba.android.rimet'))) //
  {
    console.error("找不到钉钉App!，请自己尝试打开");
    //floaty_show_text("找不到钉钉App!，请自己尝试打开")
    // return;
  }
  sleep(2000)
  while (!packageName('com.alibaba.android.rimet').text("消息").exists()) {
    console.verbose("正在等待加载出主页，如果一直加载此信息，请手动返回主页，或者无障碍服务可能出现BUG，请停止运行App重新给无障碍服务");
    closeUpdata()
    clickBack()
    closePage()
    if (className("android.widget.TextView").text("钉钉小程序").exists()) { back() }
    sleep(2000);
  }
  console.info("启动app成功！");
  //floaty_show_text("启动app成功！")
  sleep(1000);
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

function mine_group() {
  app.startActivity({
    action: "VIEW",
    data: "dingtalk://dingtalkclient/page/link?url=" + encodeURIComponent("https://qr.dingtalk.com/mine_group_conversation.html#Intent;launchFlags=0x4000000;package=com.alibaba.android.rimet;component=com.alibaba.android.rimet/com.alibaba.android.dingtalkim.activities.MineGroupConversationActivity"),
  });
}
function OpentheBenefitTree(group_name) {
  var complete = false
  while (!complete) {
    if (idContains("tv_title").textContains(group_name).exists()) {
      if (idContains("title").text("公益树").exists()) {
        var gysTarget = idContains("title").text("公益树").findOnce().parent().parent()
        if (gysTarget) {
          gysTarget.click()
          console.warn('正在进入公益树...');
          //floaty_show_text("正在进入公益树...")
        }
      } /* else {
                if (className("android.widget.ImageView").desc("群聊信息").exists()) {
                    logUtils.errorInfo('群名：' + group_name + '没有公益树');
                    floaty_show_text('群名：' + group_name + '没有公益树')
                    complete = true
                }
            } */
    }
    if (text('日排行榜').exists()) {
      let dailycharts = text('日排行榜').findOne(1000)
      if (dailycharts.parent().click()) { complete = true }
    }
    sleep(500)
  }
}


function search_groupsAndclick(group_name) {
  let complete = false
  while (!complete) {
    if (textContains(group_name).exists()) {
      if (text("未搜索到相关结果").exists()) {
        console.verbose(group_name + '未搜索到相关结果')
        complete = true
      } else if (text("我的群组").exists()) {
        sleep(200)
        try {
          //var groupText = idContains("tv_friend_name").findOne(1000)
          var groupText = idContains("tv_friend_name").textContains(group_name).findOne(1000)
          if (groupText) {
            if (groupText.text().indexOf(group_name) != -1) {
              console.info("匹配到群：" + group_name)
              groupText.parent().parent().parent().parent().parent().parent().click()
              return true
            }
          }
        } catch (e) { }
      }
    } else {
      var search_groups = idContains("search_src_text").findOnce()
      if (search_groups) {
        console.verbose("开始查找群：" + group_name)
        search_groups.setText(group_name)
      }
      if (idContains("view_search").exists()) {
        try { idContains("view_search").findOnce().click() } catch (e) { }
      }
    }
    if (!idContains("search_src_text").exists() && text("我加入的").exists()) {
      if (idContains("view_search").exists()) {
        try { idContains("view_search").findOnce().click() } catch (e) { }
      }
    }
    sleep(500)
  }
  return false
}

function main() {
  threads.start(function () {
    start_app()
    sleep(1000)
    mine_group()
    InviteWateringByGrouplists(InviteWateringGroupList)
    log('已操作群数量' + remindGroup.length)
    log('查催详细')
    console.log("====================");
    console.warn(remindGroup)
  })
}

main()



/* 以下为点击屏幕查催 暂时没用 */
let IncompleteList = []

function GetUnwateredList(WhiteList) {
  WhiteList = typeof WhiteList != 'object' ? [] : WhiteList
  let dailycharts = textMatches('日排行榜').findOne(1000)
  var ListTarget = dailycharts.parent().parent().child(2).children()
  for (var i = 1; i < ListTarget.length; i++) {
    var UnwateredTarget = ListTarget[i].findOne(text('邀请浇水'))
    if (UnwateredTarget) {
      let UnwateredTargetindex = UnwateredTarget.indexInParent()
      var nickname = UnwateredTarget.parent().child(UnwateredTargetindex - 1).child(0).text()
      if (WhiteList) {
        if (nickname.indexOf('WS') > -1) {
          if (!IsInWhiteList(WhiteList, nickname)) {
            IncompleteList.push({ nickname: nickname, hasRemid: false })
          }
        }
      }
    }
  }
}

function IsInListBounds(inviteBounds, ListBounds) {
  /* if(inviteBounds.top>ListBounds.bottom){return false}
  if(inviteBounds.bottom>ListBounds.bottom){return false}
  if(inviteBounds.top<=ListBounds.top){return false}
  return true */
  if (inviteBounds.top > ListBounds.top && inviteBounds.bottom < ListBounds.bottom) { return true } else { return false }
}

function InvitewateringInBounds() {
  let dailycharts = textMatches('日排行榜').findOne(1000)
  var ListBounds = dailycharts.parent().parent().child(2).bounds()
  var UnwateredTargetArray = text('邀请浇水').find()
  if (UnwateredTargetArray.nonEmpty()) {
    UnwateredTargetArray.forEach(InvitewateredTarget => {
      let InvitewateredBounds = InvitewateredTarget.bounds()
      if (IsInListBounds(InvitewateredBounds, ListBounds)) {
        let InvitewateredTargetindex = InvitewateredTarget.indexInParent()
        var nickname = InvitewateredTarget.parent().child(InvitewateredTargetindex - 1).child(0).text()
        for (var i = 0; i < IncompleteList.length; i++) {
          if ((IncompleteList[i].nickname.indexOf(nickname) >= 0) && (IncompleteList[i].hasRemid == false)) {
            IncompleteList[i].hasRemid = true
            console.info('提醒：[' + IncompleteList[i].nickname + '] 浇水')
            click(InvitewateredBounds.centerX(), InvitewateredBounds.centerY())
            sleep(200)
            while (!textContains("将通过单聊通知").exists()) {
              sleep(500)
              try { click(InvitewateredBounds.centerX(), InvitewateredBounds.centerY()) } catch (e) { }
            }
            idContains("button2").text('确定').findOne(1000).click()
            while (!text('邀请浇水').exists()) {
              try { idContains("button2").text('确定').findOne(1000).click() } catch (e) { }
              sleep(500)
            }
            remidList.push(nickname)
          }
        }
      }
    });
  }
}

function isAllReminded() {
  if (IncompleteList.map(v => v.hasRemid).indexOf(false) < 0) { return true }
  return false
}

function Invitewatering(InviteWhiteList) {
  InviteWhiteList = typeof InviteWhiteList != 'object' ? [] : InviteWhiteList
  IncompleteList = []
  remidList = []
  scrolltoBottom(scrollspeed)
  GetUnwateredList(InviteWhiteList)
  let STarget = scrollable(true).findOne(1000)
  while (!isAllReminded()) {
    InvitewateringInBounds()
    STarget.scrollUp()
    sleep(500)
  }
  log('需要提醒' + IncompleteList.length)
  log('已提醒' + remidList.length)
}