var { default_config, config, storage_name: _storage_name } = require('../config.js')(runtime, global)

function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
            return 0;
    }
}

function change_step(HM_username, HM_password, HM_step) {
    try {
        url = 'https://m.youxiangdao.com/api/yundong/changeSteps?user=' + HM_username.replace(/ /g, '') + '&password=' + HM_password.replace(/ /g, '') + '&step=' + parseInt(HM_step);
        var res = http.get(url);
        //log(res.body.json())
        var result = res.body.json().message
        return result
    }
    catch (e) { return '未知错误' }
}

let step_num
if (config.huami_account_lists.length > 0) {
    for (var i = 0; i < config.huami_account_lists.length; i++) {
        step_num = randomNum(config.step_min, config.step_max)
        var change_result = change_step(config.huami_account_lists[i].username, config.huami_account_lists[i].password, step_num)
        console.warn("账号：" + config.huami_account_lists[i].username + ">>>+[" + change_result + "]" + "  步数：" + step_num)
    }
}