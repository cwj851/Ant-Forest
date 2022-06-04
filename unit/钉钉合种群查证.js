let Deadline='2022.4.8' //查证截止日期 请自行修改
let currentEngine = engines.myEngine()
let runningEngines = engines.all()
let currentSource = currentEngine.getSource() + ''
if (runningEngines.length > 1) {
  runningEngines.forEach(compareEngine => {
    let compareSource = compareEngine.getSource() + ''
    if (currentEngine.id !== compareEngine.id && compareSource === currentSource) {
      // 强制关闭同名的脚本
      compareEngine.forceStop()
    }
  })
}


//这是识别证书函数
function checkLicenceAndSave() {
  let palntmsgList = []
  let GetLicenceNum=0
  let GName = getGroupName()
  let Target = className("android.view.View").textMatches("环保证书.*").findOne(1000)
  let STarget=Target.parent().child(1).children()
  //let STarget=className("android.view.View").scrollable(true).findOne().children()
  for (var j = 0; j < STarget.length; j++) {
    {
      STarget[j].child(0).child(1).click()
      while (!text('保存图片').exists()) { }
      sleep(100)
      let PlantNum
      let PlantDate
      let PlantName
  
      let PlantTarget = textMatches('[A-Z]{3,5}[0-9]{11}').findOne(1000)
      if (PlantTarget) {
        PlantNum = PlantTarget.text()
      }
      let DateTarget = textMatches(/^(\d{1,4})(.|\/)(\d{1,2})\2(\d{1,2})$/).findOnce()
      if (DateTarget) {
        PlantDate = DateTarget.text()
        PlantName = DateTarget.parent().child(4).text()
      }
      let GetLicence = isGetLicence()
      if(GetLicence){GetLicenceNum++}
      let plantMsg = { "合种日期": PlantDate, "合种编号": PlantNum, "合种树名": PlantName, "是否领证": GetLicence }
      log(JSON.stringify(plantMsg))
      palntmsgList.push(plantMsg)
      CloseLicence()
      if(OutOfDate(plantMsg.合种日期,Deadline)){
        break
      }
      sleep(100)
    }
  }
  files.ensureDir('/sdcard/森林梦/合种证书/')
  var path = '/sdcard/森林梦/合种证书/' + GName + '合种证书.txt'
  var file = open(path, 'w')
  let summaryE = EnergySum(palntmsgList)
  file.writeline('合种总能量：' + summaryE + '，查询证书数量：' + palntmsgList.length+ '，获得证书数量：' + GetLicenceNum+'，合种明细如下：')
  console.error('合种总能量：' + summaryE + '，查询证书数量：' + palntmsgList.length+ '，获得证书数量：' + GetLicenceNum)
  for (var i = 0; i < palntmsgList.length; i++) {
    //log(JSON.stringify(palntmsgList[i]))
    file.writeline(JSON.stringify(palntmsgList[i]))
  }
  file.close()
}


function getGroupName() {
  let groupName = ''
  let Target = className("android.view.View").textMatches("环保证书.*").findOne(1000)
  if (Target) {
    groupName = Target.parent().parent().child(0).child(1).text()
    log(groupName)
  }
  return groupName
}

function isAchievement() {
  if (text("成就").exists() && className("android.view.View").textMatches("环保证书.*").exists()) { return true }
  return false
}

function isGetLicence() {
  let ThanksTarget = textMatches('.*谢谢你').findOnce()
  if (ThanksTarget) { return true } else { return false }
}

function CloseLicence() {
  className("android.widget.Image").clickable(true).depth(20).findOne(1000).click()
}
function OutOfDate(Datestr1,Datestr2) {
  var oDate1 = new Date(Datestr1.replace(/\./g, "/"));
  var oDate2 = new Date(Datestr2.replace(/\./g, "/"));
  if(oDate1.getTime() > (oDate2.getTime())){
      return false
  } else {
      return true
  }
}

function EnergySum(palntmsgList) {
  let count = 0
  let counti
  for (var i = 0; i < palntmsgList.length; i++) {
      if (palntmsgList[i].是否领证 === true) {
          switch (palntmsgList[i].合种树名) {
              case '侧柏':
                  counti = 500
                  break;
              case '油松':
                  counti = 600
                  break;
              case '樟子松':
                  counti = 750
                  break;
              case '华山松':
                  counti = 1000
                  break;
              case '云杉':
                  counti = 1000
                  break;
              case '胡杨':
                  counti = 1100
                  break;
              case '冷杉':
                  counti = 1700
                  break;
              default:
                  counti = 0
          }
          count += counti
      }
  }
  return count
}

//以下是为了显示实际调用不需要
let result
let running = true

/**
 * 主程序
 */
function main() {
  //let start = new Date()
  checkLicenceAndSave()
  //toastLog('提取完毕，耗时' + (new Date() - start) + 'ms')
  toastLog('提取完毕，查证结果保存在/sdcard/森林梦/合种证书')
}

// 获取状态栏高度
let offset = -getStatusBarHeightCompat()




// 操作按钮
let clickButtonWindow = floaty.rawWindow(
  <vertical>
    <button id="captureAndOcr" text="开始查证" />
    <button id="closeBtn" text="退出" />
  </vertical>
);
ui.run(function () {
  clickButtonWindow.setPosition(device.width / 2 - ~~(clickButtonWindow.getWidth() / 2), device.height * 0.65)
})

// 点击提取
clickButtonWindow.captureAndOcr.click(function () {
  if (isAchievement()) {
    dialogs.rawInput("请输入查证截止日期(日期格式：YYYY.MM.DD)")
    .then(dateText => {
        if (!dateText) {
          toastLog('未输入查证截止日期！')
            return;
        }
        let DateRes = dateText.match(new RegExp(/((^((1[8-9]\d{2})|([2-9]\d{3}))(.)(10|12|0?[13578])(.)(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(.)(11|0?[469])(.)(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(.)(0?2)(.)(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)(.)(0?2)(.)(29)$)|(^([3579][26]00)(.)(0?2)(.)(29)$)|(^([1][89][0][48])(.)(0?2)(.)(29)$)|(^([2-9][0-9][0][48])(.)(0?2)(.)(29)$)|(^([1][89][2468][048])(.)(0?2)(.)(29)$)|(^([2-9][0-9][2468][048])(.)(0?2)(.)(29)$)|(^([1][89][13579][26])(.)(0?2)(.)(29)$)|(^([2-9][0-9][13579][26])(.)(0?2)(.)(29)$))/));
        Deadline = DateRes ? DateRes[0] : '';
        if (Deadline != '') {
          ui.run(function () {
            clickButtonWindow.setPosition(device.width, device.height)
          })
          setTimeout(() => {
            threads.start(function () {
              main()
              ui.run(function () {
                clickButtonWindow.setPosition(device.width / 2 - ~~(clickButtonWindow.getWidth() / 2), device.height * 0.65)
              })
            })
          }, 500)
        } else {
            toastLog('查证截止日期格式不正确！')
            return;
        }
    }) 
  } else {
    toastLog('请在合种成就页面在点击查证')
  }

})

// 点击关闭
clickButtonWindow.closeBtn.click(function () {
  running = false
  exit()
})


setInterval(() => { }, 10000)
events.on('exit', () => {
  running = false
})

/**
 * 获取状态栏高度
 * 
 * @returns 
 */
function getStatusBarHeightCompat() {
  let result = 0
  let resId = context.getResources().getIdentifier("status_bar_height", "dimen", "android")
  if (resId > 0) {
    result = context.getResources().getDimensionPixelOffset(resId)
  }
  if (result <= 0) {
    result = context.getResources().getDimensionPixelOffset(R.dimen.dimen_25dp)
  }
  return result
}
