
/**
 * 锁屏相关配置
 */
const LockConfig = {
  mixins: [mixin_common],
  data() {
    return {
      configs: {
        password: '',
        is_alipay_locked: true,
        alipay_lock_password: '',
        auto_set_brightness: true,
        dismiss_dialog_if_locked: true,
        check_device_posture: true,
        check_distance: true,
        posture_threshold_z: 6,
        battery_keep_threshold: 20,
        auto_lock: true,
        hasRootPermission: false,
        lock_x: 150,
        lock_y: 970,
        timeout_unlock: 1000,
      },
      device: {
        pos_x: 0,
        pos_y: 0,
        pos_z: 0,
        distance: 0
      },
    }
  },
  filters: {
    toFixed3: function (v) {
      if (v) {
        return v.toFixed(3)
      }
      return v
    }
  },
  methods: {
    gravitySensorChange: function (data) {
      this.device.pos_x = data.x
      this.device.pos_y = data.y
      this.device.pos_z = data.z
    },
    distanceSensorChange: function (data) {
      this.device.distance = data.distance
    },
  },
  mounted() {
    $app.registerFunction('gravitySensorChange', this.gravitySensorChange, true)
    $app.registerFunction('distanceSensorChange', this.distanceSensorChange, true)
  },
  unmounted() {
    $app.unregisterFunction('gravitySensorChange')
    $app.unregisterFunction('distanceSensorChange')
  },
  template: `
  <div>
    <van-cell-group>
      <van-field v-model="configs.password" label="锁屏密码" type="password" placeholder="请输入锁屏密码" input-align="right" />
      <number-field v-model="configs.timeout_unlock" label="解锁超时时间" placeholder="请输入解锁超时时间">
        <template #right-icon><span>毫秒</span></template>
      </number-field>
      <switch-cell title="支付宝是否锁定" v-model="configs.is_alipay_locked" />
      <van-field v-if="configs.is_alipay_locked" v-model="configs.alipay_lock_password" label="手势密码" placeholder="请输入手势密码对应的九宫格数字" type="password" input-align="right" />
      <switch-cell title="锁屏启动设置最低亮度" v-model="configs.auto_set_brightness" />
      <switch-cell title="锁屏启动关闭弹窗提示" v-model="configs.dismiss_dialog_if_locked" />
      <switch-cell title="锁屏启动检测设备传感器" label="检测是否在裤兜内，防止误触" v-model="configs.check_device_posture" />
      <template  v-if="configs.check_device_posture">
        <switch-cell title="同时校验距离传感器" label="部分设备数值不准默认关闭" v-model="configs.check_distance" />
        <tip-block>z轴重力加速度阈值（绝对值小于该值时判定为在兜里）</tip-block>
        <tip-block>x: {{device.pos_x | toFixed3}} y: {{device.pos_y | toFixed3}} z: {{device.pos_z | toFixed3}} 距离传感器：{{device.distance}}</tip-block>
        <number-field v-if="configs.check_device_posture" v-model="configs.posture_threshold_z" error-message-align="right" :error-message="validationError.posture_threshold_z" label="加速度阈值" placeholder="请输入加速度阈值" />
      </template>
      <switch-cell title="自动锁屏" label="脚本执行完毕后自动锁定屏幕" v-model="configs.auto_lock" />
      <template v-if="configs.auto_lock && !configs.hasRootPermission">
        <tip-block>安卓9以上支持通过无障碍服务直接锁屏；低版本的需要通过模拟点击的方式自动锁屏，默认仅支持MIUI12+（在控制中心下拉放置锁屏快捷按钮然后配置坐标），其他系统需要自行扩展实现：extends/LockScreen.js</tip-block>
        <number-field v-model="configs.lock_x" label="横坐标位置" placeholder="请输入横坐标位置" />
        <number-field v-model="configs.lock_y" label="纵坐标位置" placeholder="请输入纵坐标位置" />
      </template>
      <tip-block>设置脚本运行的最低电量(充电时不受限制)，防止早晨低电量持续运行导致自动关机，发生意外情况，比如闹钟歇菜导致上班迟到等情况。如不需要设置为0即可</tip-block>
      <number-field v-model="configs.battery_keep_threshold" label="脚本可运行的最低电量" label-width="12em" placeholder="请输入最低电量" />
  </select>
    </van-cell-group>
  </div>`
}

/**
 * 悬浮窗设置
 */
const FloatyConfig = {
  mixins: [mixin_common],
  data() {
    return {
      configs: {
        show_small_floaty: true,
        bang_offset: -90,
        auto_set_bang_offset: true,
        min_floaty_color: '',
        min_floaty_text_size: '',
        min_floaty_x: '',
        min_floaty_y: '',
        not_lingering_float_window: true,
        release_screen_capture_when_waiting: false,
        not_setup_auto_start: true,
        disable_all_auto_start: true,
      },
      validations: {
        min_floaty_color: VALIDATOR.COLOR,
      }
    }
  },
  computed: {
    computedFloatyTextColor: function () {
      if (/#[\dabcdef]{6}/i.test(this.configs.min_floaty_color)) {
        return this.configs.min_floaty_color
      } else {
        return ''
      }
    },
  },
  template: `
  <div>
    <van-cell-group>
      <switch-cell title="是否显示悬浮窗" v-model="configs.show_small_floaty" />
      <swipe-color-input-field label="悬浮窗颜色" :error-message="validationError.min_floaty_color" v-model="configs.min_floaty_color" placeholder="悬浮窗颜色值 #FFFFFF"/>
      <number-field v-model="configs.min_floaty_text_size" label-width="8em" label="悬浮窗字体大小" placeholder="请输入悬浮窗字体大小" >
        <template #right-icon><span>sp</span></template>
      </number-field>
      <number-field v-model="configs.min_floaty_x" label="悬浮窗位置X" placeholder="请输入悬浮窗横坐标位置" />
      <number-field v-model="configs.min_floaty_y" label="悬浮窗位置Y" placeholder="请输入悬浮窗纵坐标位置" />
      <tip-block>刘海屏或者挖孔屏悬浮窗显示位置和实际目测位置不同，需要施加一个偏移量，一般是负值，脚本运行时会自动设置</tip-block>
      <switch-cell title="下次执行时重新识别" v-model="configs.auto_set_bang_offset" />
      <van-cell center title="当前偏移量">
        <span>{{configs.auto_set_bang_offset ? "下次执行时重新识别": configs.bang_offset}}</span>
      </van-cell> 
    </van-cell-group>
  </div>`
}

/**
 * 切号配置
 */
const ChangeConfig = {
  mixins: [mixin_common],
  data() {
    return {
      configs: {
        accounts: [{ account: 'a', accountName: '小A' }],
        enter_forest: true,
        look_sport: true,
        send_tool: true,
        send_tool_friendId: '',
        accoun_change_time: 30,
        version_choose: 'a',
        auto_delay: false,
        auto_Energy_rain: false,
        collect_self: false,
        is_watering_friend: false,
        watering_friendId: '',
        watering_friend_num: '66',
        watering_friend_times: '3',
        changeBack:true,
      },
      showAddAccountDialog: false,
      isEdit: false,
      newAccount: '',
      newAccountName: '',
      editIdx: '',
      versionOptions: [
        { text: '10.1.XX', value: 'a' },
        { text: '10.2.XX', value: 'b' },
      ],
      cycleTimesOptions: [
        { text: '一次', value: 1 },
        { text: '两次', value: 2 },
      ],
    }
  },
  methods:{
    addAccount: function () {
      this.newAccount = ''
      this.newAccountName = ''
      this.showAddAccountDialog = true
      this.isEdit = false
    },
    editAccount: function (idx) {
      let target = this.configs.accounts[idx]
      this.editIdx = idx
      this.isEdit = true
      this.newAccount = target.account
      this.newAccountName = target.accountName
      this.showAddAccountDialog = true
    },
    confirmAction: function () {
      if (this.isEdit) {
        this.doEditAccount()
      } else {
        this.doAddAccount()
      }
    },
    doAddAccount: function () {
      if (this.isNotEmpty(this.newAccount) && this.isNotEmpty(this.newAccountName) && this.configs.accounts.map(v => v.account).indexOf(this.newAccount) < 0) {
        this.configs.accounts.push({ account: this.newAccount, accountName: this.newAccountName })
      }
    },
    doEditAccount: function () {
      if (this.isNotEmpty(this.newAccount) && this.isNotEmpty(this.newAccountName)) {
        let newAccount = this.newAccount
        let editIdx = this.editIdx
        if (this.configs.accounts.filter((v, idx) => v.account == newAccount && idx != editIdx).length > 0) {
          return
        }
        this.configs.accounts[editIdx] = { account: this.newAccount, accountName: this.newAccountName }
      }
    },
    deleteAccount: function (idx) {
      this.$dialog.confirm({
        message: '确认要删除' + this.configs.accounts[idx].account + '吗？'
      }).then(() => {
        this.configs.accounts.splice(idx, 1)
      }).catch(() => { })
    },
    onInput: function () {
      if (this.configs.auto_Energy_rain) { 
        if(this.configs.auto_delay){
          this.configs.auto_delay = false 
          vant.Toast('自动打能量雨开启时不支持智能识别切号时间间隔！已关闭智能识别时间间隔，采用固定时间间隔。')
        }
      }
    },
    autoDelayOnInput: function () {
      if (this.configs.auto_Energy_rain) { 
        this.configs.auto_delay = false 
        vant.Toast('自动打能量雨开启时不支持智能识别切号时间间隔！')
      }
    },
  },

  filters: {
    displayTime: value => {
      if (value) {
        return `[${value}]`
      }
      return ''
    }
  },
  template: `
  <div>
      <van-cell-group>
        <van-cell center title="支付宝版本选择">
        <template #right-icon>
        <van-dropdown-menu active-color="#1989fa">
        <van-dropdown-item v-model="configs.version_choose" :options="versionOptions" />
        </van-dropdown-menu>
        </template>
        </van-cell>
        <tip-block>智能识别基于能量雨任务是否完成，如果异常请关闭智能识别开关，并手动设置时间间隔</tip-block>
        <van-cell center title="智能识别切号时间间隔">
        <template #right-icon>
          <van-switch v-model="configs.auto_delay" size="20" @input="autoDelayOnInput"/>
        </template>
     </van-cell>
        <tip-block v-if="!configs.auto_delay">脚本在切号之间做了防息屏，但是切号时间间隔一定要比系统休眠时间短，否则还没操作完一个号，系统就息屏了</tip-block>
        <number-field v-if="!configs.auto_delay" v-model="configs.accoun_change_time" label="切号时间间隔" label-width="12em" > 
        <template #right-icon><span>秒</span></template>
        </number-field>
        <switch-cell title="是否收自己能量" v-model="configs.collect_self" />
        <switch-cell title="是否查看步数" v-model="configs.look_sport" />
        <switch-cell title="是否进入森林" v-model="configs.enter_forest" />
        <van-cell center title="是否自动打能量雨">
           <template #right-icon>
             <van-switch v-model="configs.auto_Energy_rain" size="20" @input="onInput"/>
           </template>
        </van-cell>
        <switch-cell title="是否浇水" v-model="configs.is_watering_friend" />
        <van-notice-bar v-if="configs.is_watering_friend" wrapable :scrollable="false" text="浇水好友ID不是好友账号或者昵称，是以2088开头的支付宝userid，提取userid方法请自行百度！"/>
        <tip-block v-if="configs.is_watering_friend">多个森林ID请用|符号分隔</tip-block>
        <van-field v-if="configs.is_watering_friend" v-model="configs.watering_friendId" label="浇水森林ID" label-width="10em" type="text" placeholder="请输入2088开头的好友森林ID" input-align="right" />
        <van-cell v-if="configs.is_watering_friend" center title="浇水数量">
        <template #right-icon>
        <van-radio-group v-model="configs.watering_friend_num" direction="horizontal" icon-size="18px">
        <van-radio name='10'>10g</van-radio>
        <van-radio name='18'>18g</van-radio>
        <van-radio name='33'>33g</van-radio>
        <van-radio name='66'>66g</van-radio>
        </van-radio-group>
        </template>
        </van-cell>
        <van-cell v-if="configs.is_watering_friend" center title="浇水次数">
        <template #right-icon>
        <van-radio-group v-model="configs.watering_friend_times" direction="horizontal" icon-size="18px">
        <van-radio name='1'>1次</van-radio>
        <van-radio name='2'>2次</van-radio>
        <van-radio name='3'>3次</van-radio>
        </van-radio-group>
        </template>
        </van-cell>
        <tip-block>打开此开关由脚本给大号赠送道具，需要设置大号的userid。</tip-block>
        <switch-cell title="是否赠送道具" v-model="configs.send_tool" />
        <number-field v-if="configs.send_tool" v-model="configs.send_tool_friendId" label="赠送道具ID" label-width="8em" placeholder="请输入2088开头的好友ID" />
        <switch-cell title="完成后切回第一个账号" v-model="configs.changeBack" />
        </van-cell-group>
        <van-divider content-position="left">
        管理账号
        <van-button style="margin-left: 0.4rem" plain hairline type="primary" size="mini" @click="addAccount">增加</van-button>
      </van-divider>
      <tip-block>账号管理，用于自动执行小号收集、赠送道具、能量雨、浇水等</tip-block>
      <tip-block>配置账号切换界面的脱敏账号和昵称，昵称用于能量雨赠送</tip-block>
      <van-notice-bar wrapable :scrollable="false" text="如果有大号，请先添加大号信息"/>
      <van-cell-group>
      <div style="overflow:scroll;padding:1rem;background:#f1f1f1;">
        <van-swipe-cell v-for="(accountInfo,idx) in configs.accounts" :key="accountInfo.account" stop-propagation>
        <van-cell>
        <template #title>
        <van-icon name="user-o" color="#1989fa" />
        <span style="font-size: 10px;">账号：{{accountInfo.account}}</span>
      </template>
      <template #label>
      <van-icon name="fire-o" color="#ee0a24" />
      <span style="font-size: 10px;">昵称：{{accountInfo.accountName}}</span>
    </template>
          </van-cell>
          <template #right>
            <div style="display: flex;height: 100%;">
              <van-button square type="primary" text="修改" @click="editAccount(idx)" style="height: 100%" />
              <van-button square type="danger" text="删除" @click="deleteAccount(idx)" style="height: 100%" />
            </div>
          </template>
        </van-swipe-cell>
      </div>
    </van-cell-group>
    <van-dialog v-model="showAddAccountDialog" title="增加账号" show-cancel-button @confirm="confirmAction" :get-container="getContainer">
    <van-field v-model="newAccount" placeholder="请输入带星号的脱敏账号名称" label="账号名" />
    <van-field v-model="newAccountName" placeholder="请输入账号昵称,用于能量雨赠送" label="昵称" />
    </van-dialog>
  </div>
  `
}

/**
 * 钉钉配置
 */
 const DdwaterConfig = {
  mixins: [mixin_common],
  data() {
    return {
      configs: {
        water_pattern:'2',
        water_keywords: '',                
        skip_keywords: '', 
        is_watering:true,
        water_Num:500,
        water_mode:"2",
        No_interruptions:true,
        sticky:true,
        MaxContinue:true,
        pushplus:true,
        pushplus_token: '',
        change_bandage:true,
        Master_Account: '',
        change_water_Num: 500,
        version_choose: 'a',
        intent_or_click:'b',
      },
      versionOptions: [
        { text: '10.1.XX', value: 'a' },
        { text: '10.2.XX', value: 'b' },
      ],
      intentOptions: [
        { text: '模拟点击', value: 'a' },
        { text: '跳转直达', value: 'b' },
      ],
    }
  },
  template: `
 <div>
      <van-cell-group>
        <van-cell  center title="页面切换方式">
        <template #right-icon>
        <van-dropdown-menu active-color="#1989fa">
        <van-dropdown-item v-model="configs.intent_or_click" :options="intentOptions" />
        </van-dropdown-menu>
        </template>
        </van-cell>
        <van-cell center title="进群模式">
        <template #right-icon>
        <van-radio-group v-model="configs.water_pattern" direction="horizontal" icon-size="18px">
        <van-radio name="1">关键词匹配</van-radio>
        <van-radio name="2">群组列表</van-radio>
        </van-radio-group>
        </template>
        </van-cell>
        <van-notice-bar v-if="configs.water_pattern==2" wrapable :scrollable="false" text="没有勾选换绑小号优先浇水，会将小号和大号的群组列表合并后用大号浇水！"/>
        <van-cell v-if="configs.water_pattern==2" title="小号换绑浇水列表配置" is-link @click="routerTo('/basic/Ddwater/Groups')" />
        <van-cell v-if="configs.water_pattern==2" title="大号浇水群组列表配置" is-link @click="routerTo('/basic/Ddwater/Groups_Ex')" />
        <tip-block v-if="configs.water_pattern==1">群名关键词，多个关键词请用|隔开</tip-block>
        <van-field v-if="configs.water_pattern==1" v-model="configs.water_keywords" label="群名关键词" label-width="10em" type="text" placeholder="请输入群名关键词" input-align="right" />
        <tip-block v-if="configs.water_pattern==1">跳过群名关键词，多个关键词请用|隔开</tip-block>
        <van-field v-if="configs.water_pattern==1" v-model="configs.skip_keywords" label="跳过群名关键词" label-width="10em" type="text" placeholder="请输入跳过群名关键词" input-align="right" />
        <switch-cell title="是否浇水" v-model="configs.is_watering" />
        <van-cell center title="浇水水量设置" v-if="configs.is_watering">
        <template #right-icon>
        <van-radio-group v-model="configs.water_mode" direction="horizontal" icon-size="18px">
        <van-radio name="1">默认</van-radio>
        <van-radio name="2">最高</van-radio>
        <van-radio name="3">指定</van-radio>
        </van-radio-group>
        </template>
        </van-cell>
        <number-field v-if="configs.is_watering && configs.water_mode==3" v-model="configs.water_Num" label="浇水数量" label-width="8em" placeholder="请输入浇水数量">
        <template #right-icon><span>g</span></template>
        </number-field>
        <van-notice-bar wrapable :scrollable="false" text="换绑小号浇水仅支持群组列表模式浇水！"/>
        <switch-cell title="换绑小号优先浇水" v-model="configs.change_bandage" />
        <van-notice-bar v-if="configs.change_bandage" wrapable :scrollable="false" text="如果钉钉绑定了支付宝钱包，请事先手动解绑，否则不支持换绑操作！请事先登录好支付宝大号和小号！"/>
        <tip-block v-if="configs.change_bandage">优先换绑小号浇水，若小号能量低于换绑设定值，则换绑下一个小号，最多支持五个账号(包括大号)，若所有小号能量均不够，则继续使用大号浇水。浇水完毕后会换绑回大号！大号账号设置是支付宝切号页面显示的带*大号名称，例如jjzs***@163.com。请不要使用隐藏部分账号信息后与大号信息一致的小号，否则会识别错大号！</tip-block>
        <van-field v-if="configs.change_bandage" v-model="configs.Master_Account" label="大号账号" label-width="10em" type="text" placeholder="请输入支付宝切号页面大号名称" input-align="right" />
        <tip-block v-if="configs.change_bandage">换绑能量阈值用于判断小号能量低于多少g时去换绑下一个小号</tip-block>
        <number-field v-if="configs.change_bandage" v-model="configs.change_water_Num" label="小号换绑能量阈值" label-width="12em" placeholder="请输入换绑能量阈值">
        <template #right-icon><span>g</span></template>
        </number-field>
        <van-cell v-if="configs.change_bandage" center title="支付宝版本选择">
        <template #right-icon>
        <van-dropdown-menu active-color="#1989fa">
        <van-dropdown-item v-model="configs.version_choose" :options="versionOptions" />
        </van-dropdown-menu>
        </template>
        </van-cell>
        <switch-cell title="超200人是否继续浇水" v-if="configs.is_watering" v-model="configs.MaxContinue"/>
        <switch-cell title="是否开始群消息免打扰" v-model="configs.No_interruptions" />
        <switch-cell title="是否置顶群聊" v-model="configs.sticky"/>
        <switch-cell title="Push+消息推送浇水结果" v-model="configs.pushplus"/>
        <tip-block v-if="configs.pushplus">Push+消息推送是通过关注push公众号将每日浇水情况通过微信推送。Token获取：浏览器打开网址http://www.pushplus.plus 点击登录，微信扫码关注公众号后网页会显示一个token参数</tip-block>
        <van-field v-if="configs.pushplus" v-model="configs.pushplus_token" label="Push+ Token" label-width="7em" type="text" placeholder="请输入Push+ 的token" input-align="right" />
      </van-cell-group>
  </div>`
}

/**
 * 小号换绑浇水群组列表设置
 */
const GroupsConfig = {
  mixins: [mixin_common],
  data() {
    return {
      showAddGroupDialog: false,
      isEdit: false,
      newGroup: '',
      newWateringDate: '',
      editIdx: '',
      configs: {
        DdWateringGroups: [{ GroupName: 'aD234往事永动轮种的去的', WateringDate: '2022-06-10' }],
      }
    }
  },
  methods: {
    addGroup: function () {
      this.newGroup = ''
      this.newWateringDate = ''
      this.showAddGroupDialog = true
      this.isEdit = false
    },
    editGroup: function (idx) {
      let target = this.configs.DdWateringGroups[idx]
      this.editIdx = idx
      this.isEdit = true
      this.newGroup = target.GroupName
      this.newWateringDate = target.WateringDate
      this.showAddGroupDialog = true
    },
    confirmAction: function () {
      if (this.isEdit) {
        this.doEditGroup()
      } else {
        this.doAddGroup()
      }
    },
    doAddGroup: function () {
      if (this.isNotEmpty(this.newGroup) && this.configs.DdWateringGroups.map(v => v.GroupName).indexOf(this.newGroup) < 0) {
        if (this.isNotEmpty(this.newWateringDate)) {
          let DateRes = this.newWateringDate.match(new RegExp(/((^((1[8-9]\d{2})|([2-9]\d{3}))(-)(10|12|0[13578])(-)(3[01]|[12][0-9]|0[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(-)(11|0?[469])(-)(30|[12][0-9]|0[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(-)(02)(-)(2[0-8]|1[0-9]|0[1-9])$)|(^([2468][048]00)(-)(02)(-)(29)$)|(^([3579][26]00)(-)(02)(-)(29)$)|(^([1][89][0][48])(-)(02)(-)(29)$)|(^([2-9][0-9][0][48])(-)(02)(-)(29)$)|(^([1][89][2468][048])(-)(02)(-)(29)$)|(^([2-9][0-9][2468][048])(-)(02)(-)(29)$)|(^([1][89][13579][26])(-)(02)(-)(29)$)|(^([2-9][0-9][13579][26])(-)(02)(-)(29)$))/));
          let DateResult = DateRes ? DateRes[0] : '';
          if (DateResult != '') {
            this.configs.DdWateringGroups.push({ GroupName: this.newGroup, WateringDate: DateResult })
          } else {
            vant.Toast('浇水截止日期格式不正确')
          }
        } else {
          this.configs.DdWateringGroups.push({ GroupName: this.newGroup, WateringDate: '2122-01-01' })
        }
      }
    },
    doEditGroup: function () {
      if (this.isNotEmpty(this.newGroup)) {
        let newGroup = this.newGroup
        let editIdx = this.editIdx
        if (this.configs.DdWateringGroups.filter((v, idx) => v.GroupName == newGroup && idx != editIdx).length > 0) {
          return
        }
        if (this.isNotEmpty(this.newWateringDate)) {
          let DateRes = this.newWateringDate.match(new RegExp(/((^((1[8-9]\d{2})|([2-9]\d{3}))(-)(10|12|0[13578])(-)(3[01]|[12][0-9]|0[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(-)(11|0?[469])(-)(30|[12][0-9]|0[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(-)(02)(-)(2[0-8]|1[0-9]|0[1-9])$)|(^([2468][048]00)(-)(02)(-)(29)$)|(^([3579][26]00)(-)(02)(-)(29)$)|(^([1][89][0][48])(-)(02)(-)(29)$)|(^([2-9][0-9][0][48])(-)(02)(-)(29)$)|(^([1][89][2468][048])(-)(02)(-)(29)$)|(^([2-9][0-9][2468][048])(-)(02)(-)(29)$)|(^([1][89][13579][26])(-)(02)(-)(29)$)|(^([2-9][0-9][13579][26])(-)(02)(-)(29)$))/));
          let DateResult = DateRes ? DateRes[0] : '';
          if (DateResult != '') {
            this.configs.DdWateringGroups[editIdx] = { GroupName: this.newGroup, WateringDate: DateResult }
          } else {
            vant.Toast('浇水截止日期格式不正确')
          }
        } else {
          this.configs.DdWateringGroups[editIdx] = { GroupName: this.newGroup, WateringDate: '2122-01-01' }
        }
      }
    },
    deleteGroup: function (idx) {
      this.$dialog.confirm({
        message: '确认要删除' + this.configs.DdWateringGroups[idx].GroupName + '吗？'
      }).then(() => {
        this.configs.DdWateringGroups.splice(idx, 1)
      }).catch(() => { })
    },
  },
  template: `
  <div>
    <van-divider content-position="left">
      小号换绑浇水列表设置
      <van-button style="margin-left: 0.4rem" plain hairline type="primary" size="mini" @click="addGroup">增加</van-button>
    </van-divider>
    <tip-block>配置进行操作的群组名称</tip-block>
    <van-cell-group>
      <div style="overflow:scroll;padding:1rem;background:#f1f1f1;">
      <van-swipe-cell v-for="(GroupInfo,idx) in configs.DdWateringGroups" :key="GroupInfo.GroupName" stop-propagation>
        <van-cell>
        <template #title>
        <van-icon name="friends-o" color="#1989fa" />
        <span style="font-size: 10px;">合种群名：{{GroupInfo.GroupName}}</span>
      </template>
      <template #label>
      <van-icon name="calendar-o" color="#ee0a24" />
      <span style="font-size: 10px;">截止日期：{{GroupInfo.WateringDate}}</span>
    </template>
      </van-cell>
        <template #right>
          <div style="display: flex;height: 100%;">
            <van-button square type="primary" text="修改" @click="editGroup(idx)" style="height: 100%" />
            <van-button square type="danger" text="删除" @click="deleteGroup(idx)" style="height: 100%" />
          </div>
        </template>
      </van-swipe-cell>
      </div>
    </van-cell-group>
    <van-dialog v-model="showAddGroupDialog" title="增加群组" show-cancel-button @confirm="confirmAction" :get-container="getContainer">
      <van-field v-model="newGroup" required placeholder="请输入群组名称" label="群组名称" />
      <van-field v-model="newWateringDate" placeholder="请输入浇水截止日期" label="截止日期" />
      <tip-block>浇水截止日期格式YYYY-MM-DD,例如2022-06-01,不填则默认为2122-01-01 注：截止日期当天不浇水</tip-block>
    </van-dialog>
  </div>
  `
}

/**
 * 大号浇水群组列表设置
 */

const GroupsConfig_Ex = {
  mixins: [mixin_common],
  data() {
    return {
      showAddGroupExDialog: false,
      isEdit: false,
      newGroupEx: '',
      newWateringDateEx: '',
      editIdx: '',
      configs: {
        DdWateringGroupsEx: [{ GroupName: 'a', WateringDate: '2022-06-10' }],
      }
    }
  },
  methods: {
    addGroup: function () {
      this.newGroupEx = ''
      this.newWateringDateEx = ''
      this.showAddGroupExDialog = true
      this.isEdit = false
    },
    editGroup: function (idx) {
      let target = this.configs.DdWateringGroupsEx[idx]
      this.editIdx = idx
      this.isEdit = true
      this.newGroupEx = target.GroupName
      this.newWateringDateEx = target.WateringDate
      this.showAddGroupExDialog = true
    },
    confirmAction: function () {
      if (this.isEdit) {
        this.doEditGroup()
      } else {
        this.doAddGroup()
      }
    },
    doAddGroup: function () {
      if (this.isNotEmpty(this.newGroupEx) && this.configs.DdWateringGroupsEx.map(v => v.GroupName).indexOf(this.newGroupEx) < 0) {
        if (this.isNotEmpty(this.newWateringDateEx)) {
          let DateRes = this.newWateringDateEx.match(new RegExp(/((^((1[8-9]\d{2})|([2-9]\d{3}))(-)(10|12|0[13578])(-)(3[01]|[12][0-9]|0[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(-)(11|0?[469])(-)(30|[12][0-9]|0[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(-)(02)(-)(2[0-8]|1[0-9]|0[1-9])$)|(^([2468][048]00)(-)(02)(-)(29)$)|(^([3579][26]00)(-)(02)(-)(29)$)|(^([1][89][0][48])(-)(02)(-)(29)$)|(^([2-9][0-9][0][48])(-)(02)(-)(29)$)|(^([1][89][2468][048])(-)(02)(-)(29)$)|(^([2-9][0-9][2468][048])(-)(02)(-)(29)$)|(^([1][89][13579][26])(-)(02)(-)(29)$)|(^([2-9][0-9][13579][26])(-)(02)(-)(29)$))/));
          let DateResult = DateRes ? DateRes[0] : '';
          if (DateResult != '') {
            this.configs.DdWateringGroupsEx.push({ GroupName: this.newGroupEx, WateringDate: DateResult })
          } else {
            vant.Toast('浇水截止日期格式不正确')
          }
        } else {
          this.configs.DdWateringGroupsEx.push({ GroupName: this.newGroupEx, WateringDate: '2122-01-01' })
        }
      }
    },
    doEditGroup: function () {
      if (this.isNotEmpty(this.newGroupEx)) {
        let newGroupEx = this.newGroupEx
        let editIdx = this.editIdx
        if (this.configs.DdWateringGroupsEx.filter((v, idx) => v.GroupName == newGroupEx && idx != editIdx).length > 0) {
          return
        }
        if (this.isNotEmpty(this.newWateringDateEx)) {
          let DateRes = this.newWateringDateEx.match(new RegExp(/((^((1[8-9]\d{2})|([2-9]\d{3}))(-)(10|12|0[13578])(-)(3[01]|[12][0-9]|0[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(-)(11|0?[469])(-)(30|[12][0-9]|0[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(-)(02)(-)(2[0-8]|1[0-9]|0[1-9])$)|(^([2468][048]00)(-)(02)(-)(29)$)|(^([3579][26]00)(-)(02)(-)(29)$)|(^([1][89][0][48])(-)(02)(-)(29)$)|(^([2-9][0-9][0][48])(-)(02)(-)(29)$)|(^([1][89][2468][048])(-)(02)(-)(29)$)|(^([2-9][0-9][2468][048])(-)(02)(-)(29)$)|(^([1][89][13579][26])(-)(02)(-)(29)$)|(^([2-9][0-9][13579][26])(-)(02)(-)(29)$))/));
          let DateResult = DateRes ? DateRes[0] : '';
          if (DateResult != '') {
            this.configs.DdWateringGroupsEx[editIdx] = { GroupName: this.newGroupEx, WateringDate: DateResult }
          } else {
            vant.Toast('浇水截止日期格式不正确')
          }
        } else {
          this.configs.DdWateringGroupsEx[editIdx] = { GroupName: this.newGroupEx, WateringDate: '2122-01-01' }
        }
      }
    },
    deleteGroup: function (idx) {
      this.$dialog.confirm({
        message: '确认要删除' + this.configs.DdWateringGroupsEx[idx].GroupName + '吗？'
      }).then(() => {
        this.configs.DdWateringGroupsEx.splice(idx, 1)
      }).catch(() => { })
    },
  },
  template: `
  <div>
    <van-divider content-position="left">
      大号浇水群组列表设置
      <van-button style="margin-left: 0.4rem" plain hairline type="primary" size="mini" @click="addGroup">增加</van-button>
    </van-divider>
    <tip-block>配置进行操作的群组名称</tip-block>
    <van-cell-group>
      <div style="overflow:scroll;padding:1rem;background:#f1f1f1;">
      <van-swipe-cell v-for="(GroupInfo,idx) in configs.DdWateringGroupsEx" :key="GroupInfo.GroupName" stop-propagation>
        <van-cell>
        <template #title>
        <van-icon name="friends-o" color="#1989fa" />
        <span style="font-size: 10px;">合种群名：{{GroupInfo.GroupName}}</span>
      </template>
      <template #label>
      <van-icon name="calendar-o" color="#ee0a24" />
      <span style="font-size: 10px;">截止日期：{{GroupInfo.WateringDate}}</span>
    </template>
      </van-cell>
        <template #right>
          <div style="display: flex;height: 100%;">
            <van-button square type="primary" text="修改" @click="editGroup(idx)" style="height: 100%" />
            <van-button square type="danger" text="删除" @click="deleteGroup(idx)" style="height: 100%" />
          </div>
        </template>
      </van-swipe-cell>
      </div>
    </van-cell-group>
    <van-dialog v-model="showAddGroupExDialog" title="增加群组" show-cancel-button @confirm="confirmAction" :get-container="getContainer">
      <van-field v-model="newGroupEx" required placeholder="请输入群组名称" label="群组名称" />
      <van-field v-model="newWateringDateEx" placeholder="请输入浇水截止日期" label="截止日期" />
      <tip-block>浇水截止日期格式YYYY-MM-DD,例如2022-06-01,不填则默认为2122-01-01 注：截止日期当天不浇水</tip-block>
    </van-dialog>
  </div>
  `
}
/**
 * Study配置
 */
const StudyConfig = {
  mixins: [mixin_common],
  data() {
    return {
      configs: {
        choose: 'c',                 //文字识别(OCR)类型选择  华为OCR接口,需要填入以下关于华为的内容|第三方OCR插件,需要安装第三方插件|内置Paddle OCR->推荐|百度OCR接口,需要填入以下关于百度的内容
        meizhou_txt: true,           //每周答题(建议手动答题)
        zhuanxiang_txt: true,        //专项答题(建议手动答题)
        siren: true,                 //四人答题
        shuangren: true,             //双人答题
        articles: true,              //文章学习和广播收听
        video: 'd',                 //视频学习   不进行学习|百灵视频学习|看电视视频学习|新百灵视频学习
        meiri: true,                //每日答题
        tiaozhan: true,             //挑战答题
        专项答题下滑: 'b',            //专项答题模式选择 不向下滑动，只答当天的题目,没有则返回|向下滑动，直到找到可答题的题目
        每周答题下滑: 'b',           //每周答题模式选择 不向下滑动，只答当天的题目,没有则返回|向下滑动，直到找到可答题的题目
        订阅: 'a',                   //订阅  关闭订阅|翻遍全部，直到订阅完成|只查看上新
        乱序: 'a',
        stronger: 'a',             //每日、每周、专项答题增强模式 关闭|使用华为OCR识别答案|使用百度OCR识别答案
        username: '',              //华为OCR刚刚新建的用户名-username
        HWpassword: '',              //华为OCR刚刚新建的用户名密码-password
        domainname: '',             //华为OCR的账号名-domainname
        projectname: '',            //华为OCR的项目名-projectname
        endpoint: '',              //华为OCR的Endpoint
        projectId: '',             //华为OCR的projectId
        延迟时间: 0,            //四人/双人点击的延迟时间ms毫秒 
        aTime: 61,                  //有效阅读一分钟1分*6
        vTime: 6,                   //每个小视频学习-5秒
        LD_another: 1,
        ta: 2000,                     //看门狗-脚本运行的最长时间，超时或错误则自动重启脚本-时间s秒
        ddtsm: false,               //点点通刷满
        push_token: '',               //push+ 消息推送
        xianzhi: false,             //四人/双人不受积分限制开关
        apiKey: '',                // ApiKey和SecretKey都来自百度AI平台 需要自己申请// 秘钥
        secretKey: '',
        Open_countfloaty: true,
      },
      chooseOptions: [
        { text: '第三方OCR插件,需要安装插件', value: 'b' },
        { text: '内置Paddle OCR', value: 'c' },
      ],
      订阅Options: [
        { text: '关闭订阅', value: 'a' },
        { text: '翻遍全部，直到订阅完成', value: 'b' },
        { text: '只查看上新', value: 'c' },
      ],
      videoOptions: [
        { text: '不进行学习', value: 'a' },
        { text: '百灵视频学习', value: 'b' },
        { text: '看电视视频学习', value: 'c' },
        { text: '新百灵视频学习(推荐)', value: 'd' },
      ],
      专项答题下滑Options: [
        { text: '不向下滑动，只答当天的题目', value: 'a' },
        { text: '向下滑动，直到找到可答的题目', value: 'b' },
      ],
      每周答题下滑Options: [
        { text: '不向下滑动，只答当天的题目', value: 'a' },
        { text: '向下滑动，直到找到可答的题目', value: 'b' },
      ],
    }
  },
  methods: {

  },
  template: `
  <div>
      <van-cell-group>
        <van-cell center title="OCR类型：">
        <template #right-icon>
        <van-dropdown-menu active-color="#1989fa"> <van-dropdown-item v-model="configs.choose" :options="chooseOptions" /> </van-dropdown-menu>
        </template>
        </van-cell>
        <van-cell center title="订阅：">
        <template #right-icon>
        <van-dropdown-menu active-color="#1989fa"> <van-dropdown-item v-model="configs.订阅" :options="订阅Options" /> </van-dropdown-menu>
        </template>
        </van-cell> 
        <switch-cell title="文章学习和广播收听" v-model="configs.articles" />
        <van-cell center title="视频学习：">
        <template #right-icon>
        <van-dropdown-menu active-color="#1989fa"> <van-dropdown-item v-model="configs.video" :options="videoOptions" /> </van-dropdown-menu>
        </template>
        </van-cell>
        <switch-cell title="每日答题" v-model="configs.meiri" />
        <switch-cell title="挑战答题" v-model="configs.tiaozhan" />
        <switch-cell title="专项答题" v-model="configs.zhuanxiang_txt" />
        <van-cell center title="专项答题模式：">
        <template #right-icon>
        <van-dropdown-menu active-color="#1989fa"> <van-dropdown-item v-model="configs.专项答题下滑" :options="专项答题下滑Options" /> </van-dropdown-menu>
        </template>
        </van-cell>
        <switch-cell title="每周答题" v-model="configs.meizhou_txt" />
        <van-cell center title="每周答题模式：">
        <template #right-icon>
        <van-dropdown-menu active-color="#1989fa"> <van-dropdown-item v-model="configs.每周答题下滑" :options="每周答题下滑Options" /> </van-dropdown-menu>
        </template>
        </van-cell>
        <switch-cell title="四人答题" v-model="configs.siren" />
        <switch-cell title="双人答题" v-model="configs.shuangren" />
        <number-field v-model="configs.延迟时间" label="四人/双人点击延迟" label-width="12em" placeholder="请输入四人/双人点击延迟时间">
        <template #right-icon><span>毫秒</span></template>
        </number-field>
        <number-field v-model="configs.ta" label="看门狗-脚本运行的最长时间" label-width="16em" placeholder="请输入脚本运行的最长时间">
        <template #right-icon><span>秒</span></template>
        </number-field>
        <number-field v-model="configs.aTime" label="每篇文章学习的时间" label-width="16em" placeholder="请输入每篇文章学习的时间">
        <template #right-icon><span>秒</span></template>
        </number-field>
        <number-field v-model="configs.vTime" label="每个视频学习的时间" label-width="16em" placeholder="请输入每个视频学习的时间">
        <template #right-icon><span>秒</span></template>
        </number-field>
        <number-field v-model="configs.LD_another" label="四人/双人额外的随机答题次数(乱答)" label-width="18em">
        <template #right-icon><span>次</span></template>
      </van-cell-group>
  </div>`
}

/**
 * 日志配置
 */
const LogConfig = {
  mixins: [mixin_common],
  data() {
    return {
      configs: {
        is_pro: false,
        show_debug_log: true,
        show_engine_id: true,
        save_log_file: true,
        // 日志保留天数
        log_saved_days: 3,
        back_size: '',
        async_save_log_file: true,
        console_log_maximum_size: 1500,
      }
    }
  },
  methods: {
    showLogs: function () {
      $app.invoke('showLogs', {})
    }
  },
  template: `
  <div>
    <van-divider content-position="left">
      <van-button style="margin-left: 0.4rem" plain hairline type="primary" size="mini" @click="showLogs">查看日志</van-button>
    </van-divider>
      <van-cell-group>
        <tip-block v-if="!configs.is_pro">控制台保留的日志行数，避免运行时间长后保留太多的无用日志，导致内存浪费</tip-block>
        <number-field v-if="!configs.is_pro" v-model="configs.console_log_maximum_size" label="控制台日志最大保留行数" label-width="12em" />
        <switch-cell title="是否显示debug日志" v-model="configs.show_debug_log" />
        <switch-cell title="是否显示脚本引擎id" v-model="configs.show_engine_id" />
        <switch-cell title="是否保存日志到文件" v-model="configs.save_log_file" />
        <number-field v-if="configs.save_log_file" v-model="configs.back_size" label="日志文件滚动大小" label-width="8em" placeholder="请输入单个文件最大大小" >
          <template #right-icon><span>KB</span></template>
        </number-field>
        <number-field v-if="configs.save_log_file" v-model="configs.log_saved_days" label="日志文件保留天数" label-width="8em" placeholder="请输入日志文件保留天数" >
          <template #right-icon><span>天</span></template>
        </number-field>
        <switch-cell title="是否异步保存日志到文件" v-model="configs.async_save_log_file" />
    </van-cell-group>
  </div>`
}


/**
 * 高级设置
 */
const AdvanceCommonConfig = {
  mixins: [mixin_common],
  data() {
    return {
      configs: {
        single_script: true,
        auto_restart_when_crashed: true,
        useCustomScrollDown: true,
        scrollDownSpeed: null,
        bottomHeight: null,
        other_accessisibility_services: '',
        // 截图相关
        async_waiting_capture: true,
        capture_waiting_time: 500,
        request_capture_permission: true,
        capture_permission_button: 'START NOW|立即开始|允许',
        is_pro: false,
        enable_call_state_control: true,
      }
    }
  },
  methods: {
    doAuthADB: function () {
      $app.invoke('doAuthADB', {})
    },
  },
  template: `
  <div>
    <van-cell-group>
      <tip-block>当需要使用多个脚本时不要勾选（如同时使用我写的蚂蚁庄园脚本），避免抢占前台</tip-block>
      <switch-cell title="是否单脚本运行" v-model="configs.single_script" />
      <tip-block>AutoJS有时候会莫名其妙的崩溃，但是授权了自启动权限之后又会自动启动。开启该选项之后会创建一个广播事件的定时任务，
        当脚本执行过程中AutoJS崩溃自启，将重新开始执行脚本。如果脚本执行完毕，则不会触发执行</tip-block>
      <switch-cell title="AutoJS崩溃自启后重启脚本" title-style="flex:2;" v-model="configs.auto_restart_when_crashed" />
      <tip-block>拥有ADB权限时，授权AutoJS无障碍权限的同时授权其他应用无障碍服务权限 多个服务用:分隔
        <van-button style="margin-left: 0.4rem" plain hairline type="primary" size="mini" @click="doAuthADB">触发授权</van-button>
      </tip-block>
      <van-field v-model="configs.other_accessisibility_services" label="无障碍服务service" label-width="10em" type="text" placeholder="请输入" input-align="right" stop-propagation />
      <switch-cell title="是否使用模拟滑动" v-model="configs.useCustomScrollDown" />
      <template v-if="configs.useCustomScrollDown">
        <number-field v-model="configs.scrollDownSpeed" label="模拟滑动速度" label-width="8em" />
        <number-field v-model="configs.bottomHeight" label="模拟底部起始高度" label-width="8em" />
      </template>
      <switch-cell title="是否自动授权截图权限" v-model="configs.request_capture_permission" />
      <van-field v-if="configs.request_capture_permission" v-model="configs.capture_permission_button" label="确定按钮文本" type="text" placeholder="请输入确定按钮文本" input-align="right" />
      <tip-block>偶尔通过captureScreen获取截图需要等待很久，或者一直阻塞无法进行下一步操作，建议开启异步等待，然后设置截图等待时间</tip-block>
      <switch-cell title="是否异步等待截图" v-model="configs.async_waiting_capture" />
      <number-field v-if="configs.async_waiting_capture" v-model="configs.capture_waiting_time" label="获取截图超时时间" label-width="8em" placeholder="请输入超时时间" >
        <template #right-icon><span>毫秒</span></template>
      </number-field>
      <switch-cell v-if="!configs.is_pro" title="是否通话时暂停脚本" title-style="width: 10em;flex:2;" label="需要授权AutoJS获取通话状态，Pro版暂时无法使用" v-model="configs.enable_call_state_control" />
    </van-cell-group>
  </div>`
}
/**
 * 前台应用白名单
 */
const SkipPackageConfig = {
  mixins: [mixin_common],
  data() {
    return {
      newSkipRunningPackage: '',
      newSkipRunningAppName: '',
      showAddSkipRunningDialog: false,
      configs: {
        warn_skipped_ignore_package: true,
        warn_skipped_too_much: true,
        skip_running_packages: [{ packageName: 'com.tony.test', appName: 'test' }, { packageName: 'com.tony.test2', appName: 'test2' }],
      }
    }
  },
  methods: {
    addSkipPackage: function () {
      this.newSkipRunningPackage = ''
      this.newSkipRunningAppName = ''
      this.showAddSkipRunningDialog = true
    },
    doAddSkipPackage: function () {
      if (!this.isNotEmpty(this.newSkipRunningAppName)) {
        vant.Toast('请输入应用名称')
        return
      }
      if (!this.isNotEmpty(this.newSkipRunningPackage)) {
        vant.Toast('请输入应用包名')
        return
      }
      if (this.addedSkipPackageNames.indexOf(this.newSkipRunningPackage) < 0) {
        this.configs.skip_running_packages.push({ packageName: this.newSkipRunningPackage, appName: this.newSkipRunningAppName })
      }
    },
    deleteSkipPackage: function (idx) {
      this.$dialog.confirm({
        message: '确认要删除' + this.configs.skip_running_packages[idx].packageName + '吗？'
      }).then(() => {
        this.configs.skip_running_packages.splice(idx, 1)
      }).catch(() => { })
    },
    handlePackageChange: function (payload) {
      this.newSkipRunningAppName = payload.appName
      this.newSkipRunningPackage = payload.packageName
    },
  },
  computed: {
    addedSkipPackageNames: function () {
      return this.configs.skip_running_packages.map(v => v.packageName)
    }
  },
  template: `
  <div>
    <van-divider content-position="left">
      前台应用白名单设置
      <van-button style="margin-left: 0.4rem" plain hairline type="primary" size="mini" @click="addSkipPackage">增加</van-button>
    </van-divider>
    <van-cell-group>
      <switch-cell title="当前台白名单跳过次数过多时提醒" label="当白名单跳过3次之后会toast提醒，按音量下可以直接执行" title-style="width: 12em;flex:2;" v-model="configs.warn_skipped_too_much" />
      <switch-cell v-if="configs.warn_skipped_too_much" title="是否无视前台包名" title-style="width: 10em;flex:2;" label="默认情况下包名相同且重复多次时才提醒，开启后连续白名单跳过三次即提醒" v-model="configs.warn_skipped_ignore_package" />
      <div style="min-height:10rem;overflow:scroll;padding:1rem;background:#f1f1f1;">
        <van-swipe-cell v-for="(skip,idx) in configs.skip_running_packages" :key="skip.packageName" stop-propagation>
          <van-cell :title="skip.appName" :label="skip.packageName" />
          <template #right>
            <van-button square type="danger" text="删除" @click="deleteSkipPackage(idx)" style="height: 100%"/>
          </template>
        </van-swipe-cell>
      </div>
    </van-cell-group>
    <van-dialog v-model="showAddSkipRunningDialog" show-cancel-button @confirm="doAddSkipPackage" :get-container="getContainer">
      <template #title>
        <installed-package-selector @value-change="handlePackageChange" :added-package-names="addedSkipPackageNames"/>
      </template>
      <van-field v-model="newSkipRunningAppName" placeholder="请输入应用名称" label="应用名称" />
      <van-field v-model="newSkipRunningPackage" placeholder="请输入应用包名" label="应用包名" />
    </van-dialog>
  </div>`
}


/**
 * 小米运动账号
 */
 const ModificationStepConfig = {
  mixins: [mixin_common],
  data() {
    return {
      newHMuser: '',
      newHMpassword: '',
      showAddHMaccountDialog: false,
      configs: {
        step_min: 18000,
        step_max: 21000,
        Sportpushplus:false,
        pushplus_token:'',
        huami_account_lists: [{ username: 'com.tony.test', password: 'test' }, { username: 'com.tony.test2', password: 'test2' }],
      }
    }
  },
  methods: {
    addHMaccount: function () {
      this.newHMuser = ''
      this.newHMpassword = ''
      this.showAddHMaccountDialog = true
    },
    editAccount: function (idx) {
      let target = this.configs.huami_account_lists[idx]
      this.editIdx = idx
      this.isEdit = true
      this.newHMuser = target.username
      this.newHMpassword = target.password
      this.showAddHMaccountDialog = true
    },
    confirmAction: function () {
      if (this.isEdit) {
        this.doEditHMAccount()
      } else {
        this.deleteHMaccount()
      }
    },
    doaddHMaccount: function () {
      if (!this.isNotEmpty(this.newHMuser)) {
        vant.Toast('请输入小米运动账号')
        return
      }
      if (!this.isNotEmpty(this.newHMpassword)) {
        vant.Toast('请输入小米运动密码')
        return
      }
      if (this.configs.huami_account_lists.map(v => v.username).indexOf(this.newHMuser) < 0) {
        this.configs.huami_account_lists.push({ username: this.newHMuser, password: this.newHMpassword })
      }
    },
    doEditHMAccount: function () {
      if (this.isNotEmpty(this.newHMuser) && this.isNotEmpty(this.newHMpassword)) {
        let newHMuser = this.newHMuser
        let editIdx = this.editIdx
        if (this.configs.huami_account_lists.filter((v, idx) => v.username == newHMuser && idx != editIdx).length > 0) {
          return
        }
        this.configs.huami_account_lists[editIdx] = { username: this.newHMuser, password: this.newHMpassword }
      }
    },
    deleteHMaccount: function (idx) {
      this.$dialog.confirm({
        message: '确认要删除' + this.configs.huami_account_lists[idx].username + '吗？'
      }).then(() => {
        this.configs.huami_account_lists.splice(idx, 1)
      }).catch(() => { })
    },
    AddAccount: function () {
      //$app.invoke('AddHMAccount', {})
      this.getHMAccount()
    },
    getHMAccount: function() {
      $nativeApi.request('getHMAccount').then(resp => {
        this.configs.huami_account_lists = resp
      })
    },
    handlePackageChange: function (payload) {
      this.newHMuser = payload.username
      this.newHMpassword = payload.password
    },
  },
  filters: {
    displayTime: value => {
      if (value) {
        return `[${value}]`
      }
      return ''
    }
  },
  template: `
  <div>
    <van-divider content-position="left">
      小米运动同步步数账号设置
      <van-button style="margin-left: 0.4rem" plain hairline type="primary" size="mini" @click="addHMaccount">增加</van-button>
    </van-divider>
    <tip-block>如需批量导入小米运动账号，请将账号文件命名为：小米运动账号.txt后存放在/sdcard/森林梦/文件夹下。账号格式为：账号----密码(一行一个账号)：<van-button style="margin-left: 0.4rem" plain hairline type="primary" size="mini" @click="AddAccount">导入账号</van-button></tip-block>
    <van-notice-bar wrapable :scrollable="false" text="同时支持小米运动手机账号和邮箱账号，手机账号请使用'+86手机号'这个格式"/>
    <van-cell-group>
    <number-field v-model="configs.step_min" label="改步最小值" placeholder="请输入改步最小值" />
    <number-field v-model="configs.step_max" label="改步最大值" placeholder="请输入改步最大值" />
    <switch-cell title="Push+推送步数修改结果" v-model="configs.Sportpushplus"/>
        <tip-block v-if="configs.Sportpushplus">Push+消息推送是通过关注push公众号将每日步数修改情况通过微信推送。Token获取：浏览器打开网址http://www.pushplus.plus 点击登录，微信扫码关注公众号后网页会显示一个token参数</tip-block>
        <van-field v-if="configs.Sportpushplus" v-model="configs.pushplus_token" label="Push+ Token" label-width="7em" type="text" placeholder="请输入Push+ 的token" input-align="right" />
    <tip-block>配置进行步数同步的小米运动账号</tip-block>
      <div style="min-height:10rem;overflow:scroll;padding:1rem;background:#f1f1f1;">
        <van-swipe-cell v-for="(HM,idx) in configs.huami_account_lists" :key="HM.username" stop-propagation>
          <van-cell>
        <template #title>
        <van-icon name="user-o" color="#1989fa" />
        <span style="font-size: 10px;">账号：{{HM.username}}</span>
      </template>
      <template #label>
      <van-icon name="bulb-o" color="#ee0a24" />
      <span style="font-size: 10px;">密码：{{HM.password}}</span>
    </template>
      </van-cell>
          <template #right>
          <van-button square type="primary" text="修改" @click="editAccount(idx)" style="height: 100%" />
            <van-button square type="danger" text="删除" @click="deleteHMaccount(idx)" style="height: 100%"/>
          </template>
        </van-swipe-cell>
      </div>
    </van-cell-group>
    <van-dialog v-model="showAddHMaccountDialog" title="增加小米运动账号" show-cancel-button @confirm="confirmAction" :get-container="getContainer">
      <van-field v-model="newHMuser" required placeholder="请输入小米运动账号" label="账号" />
      <van-field v-model="newHMpassword" required placeholder="请输入小米运动密码" label="密码" />
    </van-dialog>
  </div>`
}


/**
 * 日榜查催设置
 */

 const DailyChartsCheckConfig = {
  mixins: [mixin_common],
  data() {
    return {
      showAddGroupDialog: false,
      isEdit: false,
      newGroup: '',
      newWhiteList: '',
      editIdx: '',
      configs: {
        InviteWateringGroupList: [{ groupName: 'aD234往事永动轮种的去的', whiteList: 'WS0001|WS0029|VIP|WS0029|VIP' }],
        DailyOnly:false,
      }
    }
  },
  methods: {
    addGroup: function () {
      this.newGroup = ''
      this.newWhiteList = ''
      this.showAddGroupDialog = true
      this.isEdit = false
    },
    editGroup: function (idx) {
      let target = this.configs.InviteWateringGroupList[idx]
      this.editIdx = idx
      this.isEdit = true
      this.newGroup = target.groupName
      this.newWhiteList = target.whiteList
      this.showAddGroupDialog = true
    },
    confirmAction: function () {
      if (this.isEdit) {
        this.doEditGroup()
      } else {
        this.doAddGroup()
      }
    },
    doAddGroup: function () {
      if (this.isNotEmpty(this.newGroup) && this.configs.InviteWateringGroupList.map(v => v.groupName).indexOf(this.newGroup) < 0) {
        if (this.isNotEmpty(this.newWhiteList)) {
            this.configs.InviteWateringGroupList.push({ groupName: this.newGroup, whiteList: this.newWhiteList })
        } else {
          this.configs.InviteWateringGroupList.push({ groupName: this.newGroup, whiteList: '' })
        }
      }
    },
    doEditGroup: function () {
      if (this.isNotEmpty(this.newGroup)) {
        let newGroup = this.newGroup
        let editIdx = this.editIdx
        if (this.configs.InviteWateringGroupList.filter((v, idx) => v.groupName == newGroup && idx != editIdx).length > 0) {
          return
        }
        if (this.isNotEmpty(this.newWhiteList)) {      
          this.configs.InviteWateringGroupList[editIdx] = { groupName: this.newGroup, whiteList: this.newWhiteList }   
        } else {
          this.configs.InviteWateringGroupList[editIdx] = { groupName: this.newGroup, whiteList: '' }   
        }
      }
    },
    deleteGroup: function (idx) {
      this.$dialog.confirm({
        message: '确认要删除' + this.configs.InviteWateringGroupList[idx].groupName + '吗？'
      }).then(() => {
        this.configs.InviteWateringGroupList.splice(idx, 1)
      }).catch(() => { })
    },
  },
  template: `
  <div>
    <van-divider content-position="left">
      日榜查催群组列表设置
      <van-button style="margin-left: 0.4rem" plain hairline type="primary" size="mini" @click="addGroup">增加</van-button>
    </van-divider>
    <switch-cell title="只查催带WS编号" v-model="configs.DailyOnly"/>
    <tip-block>配置进行操作的群组名称</tip-block>
    <van-cell-group>
      <div style="overflow:scroll;padding:1rem;background:#f1f1f1;">
      <van-swipe-cell v-for="(GroupInfo,idx) in configs.InviteWateringGroupList" :key="GroupInfo.groupName" stop-propagation>
        <van-cell>
        <template #title>
        <van-icon name="friends-o" color="#1989fa" />
        <span style="font-size: 10px;">合种群名：{{GroupInfo.groupName}}</span>
      </template>
      </van-cell>
        <template #right>
          <div style="display: flex;height: 100%;">
            <van-button square type="primary" text="修改" @click="editGroup(idx)" style="height: 100%" />
            <van-button square type="danger" text="删除" @click="deleteGroup(idx)" style="height: 100%" />
          </div>
        </template>
      </van-swipe-cell>
      </div>
    </van-cell-group>
    <van-dialog v-model="showAddGroupDialog" title="增加群组" show-cancel-button @confirm="confirmAction" :get-container="getContainer">
      <van-field v-model="newGroup" required placeholder="请输入群组名称" label="群组名称" />
      <van-field v-model="newWhiteList" placeholder="请输入查催白名单" label="白名单" />
      <tip-block>多个白名单请用|分隔</tip-block>
    </van-dialog>
  </div>
  `
}

/**
 * VIP项目
 */
 const VIPConfigs = {
  mixins: [mixin_common],
  data () {
    return {
    }
  },
  template: `
  <div>
    <van-cell-group>
    <van-cell title="日榜查催群组列表配置" is-link @click="routerTo('/advance/VIP/DailyChartsCheck')"/>
    <van-cell title="总榜查催群组列表配置" is-link @click="routerTo('/advance/VIP/SumChartsCheck')"/>
    </van-cell-group>
  </div>
  `
}

/**
 * 日榜查催设置
 */

 const SumChartsCheckConfig = {
  mixins: [mixin_common],
  data() {
    return {
      showAddGroupDialog: false,
      isEdit: false,
      newGroup: '',
      newWhiteList: '',
      newCheckNum: '',
      editIdx: '',
      configs: {
        InviteWateringGroupListSum: [{ groupName: 'aD234往事永动轮种的去的', whiteList: 'WS0001|WS002989157|VIP',CheckNum:'20000' }],
        SumOnly:false,
      }
    }
  },
  methods: {
    addGroup: function () {
      this.newGroup = ''
      this.newWhiteList = ''
      this.newCheckNum = ''
      this.showAddGroupDialog = true
      this.isEdit = false
    },
    editGroup: function (idx) {
      let target = this.configs.InviteWateringGroupListSum[idx]
      this.editIdx = idx
      this.isEdit = true
      this.newGroup = target.groupName
      this.newWhiteList = target.whiteList
      this.newCheckNum = target.CheckNum
      this.showAddGroupDialog = true
    },
    confirmAction: function () {
      if (this.isEdit) {
        this.doEditGroup()
      } else {
        this.doAddGroup()
      }
    },
    doAddGroup: function () {
      if (this.isNotEmpty(this.newGroup) && this.configs.InviteWateringGroupListSum.map(v => v.groupName).indexOf(this.newGroup) < 0 ) {
        if(!this.isNotEmpty(this.newCheckNum)){
          vant.Toast('总水量不能空！')
          return
        }
        if (this.isNotEmpty(this.newWhiteList)) {
            this.configs.InviteWateringGroupListSum.push({ groupName: this.newGroup, whiteList: this.newWhiteList,CheckNum:this.newCheckNum })
        } else {
          this.configs.InviteWateringGroupListSum.push({ groupName: this.newGroup, whiteList: '' ,CheckNum:this.newCheckNum })
        }
      }
    },
    doEditGroup: function () {
      if (this.isNotEmpty(this.newGroup)) {
        let newGroup = this.newGroup
        let editIdx = this.editIdx
        if (this.configs.InviteWateringGroupListSum.filter((v, idx) => v.groupName == newGroup && idx != editIdx).length > 0) {
          return
        }
        if (this.isNotEmpty(this.newCheckNum)) {
          if (this.isNotEmpty(this.newWhiteList)) {
            this.configs.InviteWateringGroupListSum[editIdx] = { groupName: this.newGroup, whiteList: this.newWhiteList, CheckNum: this.newCheckNum }
          } else {
            this.configs.InviteWateringGroupListSum[editIdx] = { groupName: this.newGroup, whiteList: '', CheckNum: this.newCheckNum }
          }
        }else{
          vant.Toast('总水量不能空！')
        }
      }
    },
    deleteGroup: function (idx) {
      this.$dialog.confirm({
        message: '确认要删除' + this.configs.InviteWateringGroupListSum[idx].groupName + '吗？'
      }).then(() => {
        this.configs.InviteWateringGroupListSum.splice(idx, 1)
      }).catch(() => { })
    },
  },
  template: `
  <div>
    <van-divider content-position="left">
      总榜查催群组列表设置
      <van-button style="margin-left: 0.4rem" plain hairline type="primary" size="mini" @click="addGroup">增加</van-button>
    </van-divider>
    <switch-cell title="只查催带WS编号" v-model="configs.SumOnly"/>
    <tip-block>配置进行操作的群组名称</tip-block>
    <van-notice-bar left-icon="volume-o" text="查催总水量请去尾后设置成100的倍数，例如总水量为8888g时需要设置为8800！"/>
    <van-cell-group>
      <div style="overflow:scroll;padding:1rem;background:#f1f1f1;">
      <van-swipe-cell v-for="(GroupInfo,idx) in configs.InviteWateringGroupListSum" :key="GroupInfo.groupName" stop-propagation>
        <van-cell>
        <template #title>
        <van-icon name="friends-o" color="#1989fa" />
        <span style="font-size: 10px;">合种群名：{{GroupInfo.groupName}}</span>
      </template>
      <template #label>
      <van-icon name="flower-o" color="#ee0a24" />
      <span style="font-size: 10px;">总水量：{{GroupInfo.CheckNum}}g</span>
    </template>
      </van-cell>
        <template #right>
          <div style="display: flex;height: 100%;">
            <van-button square type="primary" text="修改" @click="editGroup(idx)" style="height: 100%" />
            <van-button square type="danger" text="删除" @click="deleteGroup(idx)" style="height: 100%" />
          </div>
        </template>
      </van-swipe-cell>
      </div>
    </van-cell-group>
    <van-dialog v-model="showAddGroupDialog" title="增加群组" show-cancel-button @confirm="confirmAction" :get-container="getContainer">
      <van-field v-model="newGroup" required placeholder="请输入群组名称" label="群组名称" />
      <van-field v-model="newCheckNum" required placeholder="请输入查催水量" label="总水量(g)" type="digit" />
      <van-field v-model="newWhiteList"  placeholder="请输入查催白名单" label="白名单" />
      <tip-block>多个白名单请用|分隔</tip-block>
    </van-dialog>
  </div>
  `
}