const CollectSummary = {
  name: 'CollectSummary',
  data() {
    return {
      totalCollect: 10,    
      totalWater: 10,
      totalIncreased: 100,
      showDatePicker: false,
      currentDate: new Date(),
      pickDate: new Date(),
      loading: false,
      friendCollectList: [
        {
          friendName: 'C333往事全家福~父亲节~20kg满',    //群名
          friendEnergy: '424.4kg',          //合种能量
          collectEnergy: '145240g',         //自己剩余能量
          waterEnergy: 500,                 //浇水
          createTime: '2022-04-06 15:12:11'
        },
        {
          friendName: 'Jame',
          friendEnergy: 8888,
          collectEnergy: 49,
          waterEnergy: 10,
          createTime: '2022-04-06 16:12:11'
        }
      ],
      orderByOptions: [
        { text: '默认排序', value: '' },
        { text: '剩余数量', value: 'COLLECT_ENERGY DESC,CREATE_TIME ASC' },
        { text: '浇水数量', value: 'WATER_ENERGY DESC,CREATE_TIME ASC' },
        { text: '群组名称', value: 'FRIEND_NAME ASC,CREATE_TIME ASC' },
      ],
      query: {
        size: 999,
        start: 0,
        current: 0,
        total: 0,
        collectDate: '',
        orderBy: ''
      },
      orderBy: ''
    }
  },
  watch: {
    showDatePicker: function (newVal) {
      if (!newVal) {
        let collectDate = formatDate(this.pickDate, 'yyyy-MM-dd')
        if (collectDate != this.query.collectDate) {
          this.query.collectDate = collectDate
          this.pageCollectInfo()
          this.getCollectSummary()
        }
      }
    },
    orderBy: function (newVal) {
      this.query.orderBy = newVal
      this.pageCollectInfo()
    }
  },
  methods: {
    pageCollectInfo: function() {
      this.loading = true
      $nativeApi.request('pageCollectInfo', this.query).then(resp => {
        this.query.size = resp.size
        this.query.total = resp.total
        console.log('resp:', JSON.stringify(resp))
        this.friendCollectList = resp.result
        this.loading = false
      }).catch(e => this.loading = false)
    },
    getCollectSummary: function() {
      $nativeApi.request('getCollectSummary', this.query).then(resp => {
        this.totalCollect = resp.totalCollect
        this.totalWater = resp.totalWater
      })
      $nativeApi.request('getMyEnergyIncreased', this.query.collectDate).then(resp => {
        this.totalIncreased = resp.totalIncreased
      })
    },
  },
  mounted() {
    this.query.collectDate = formatDate(this.pickDate, 'yyyy-MM-dd')
    this.pageCollectInfo()
    this.getCollectSummary()
  },
  template: `
  <div style="height: 100%">
    <van-overlay :show="loading" z-index="1000">
      <div class="wrapper">
        <van-loading size="4rem" vertical>加载中...</van-loading>
      </div>
    </van-overlay>
    <van-cell-group>
      <tip-block>
        <van-row type="flex" justify="center">
          <van-col :span="16" style="display: flex; align-items: center;">
            浇水数据 日期：<van-button type='default' size="small" @click="showDatePicker=true">{{query.collectDate}}</van-button>
          </van-col>
          <van-col :span="8">
            <van-dropdown-menu active-color="#1989fa">
              <van-dropdown-item v-model="orderBy" :options="orderByOptions" />
            </van-dropdown-menu>
          </van-col>
        </van-row>
      </tip-block>
      <tip-block>总浇水次数：{{friendCollectList.length}}  总浇水：{{totalWater}}g</tip-block>
      <van-cell v-for="(item,idx) in friendCollectList"
        :key="item.friendName+item.createTime"
        class="van-clearfix"
        :border="true"
        :label="item.createTime">
        <template #title>
          <span style="font-size: 10px;">{{item.friendName}}</span>
        </template>
        <template #default>
        <span style="color: green; font-size: 10px;">合种:{{item.friendEnergy}}</span>         
          <div style="color: gray; font-size: 10px;">
          浇水:{{item.waterEnergy}}g
          <span style="color: orange; font-size: 10px;">剩余:{{item.collectEnergy}}</span>
          </div>
        </template>
      </van-cell>
    </van-cell-group>
    <van-popup v-model="showDatePicker" position="bottom" :style="{ height: '40%' }">
      <van-datetime-picker v-model="pickDate" type="date" title="选择查询日期" :max-date="currentDate" :show-toolbar="false"/>
    </van-popup>
  </div>
  `
}