var { default_config, config, storage_name: _storage_name } = require('../config.js')(runtime, global)
let args = engines.myEngine().execArgv
let storageConfig = storages.create(_storage_name)


function readHMAccount() {
    let counti = 0
    if (args.HMAccountText) {
        var text = args.HMAccountText
        let HMAccountlist = text.split('\n');
        for (var i = 0; i < HMAccountlist.length; i++) {
            var t = HMAccountlist[i].split('----');
            if (t[1] && t[0]) {
                if (config.huami_account_lists.map(v => v.username).indexOf(t[0].replace(/\r/g, '')) < 0) {
                    config.huami_account_lists.push({ username: t[0].replace(/\r/g, ''), password: t[1].replace(/\r/g, '') });
                    counti++
                }
            }
        }
    } else {
        toastLog('未输入账号文本！')
    }
    if (counti > 0) {
        storageConfig.put("huami_account_lists", config.huami_account_lists)
        toastLog("成功导入小米运动账号：" + counti + '个')
    } else {
        toastLog("所有账号已保存或账号文本为空！")
    }
}

readHMAccount()

