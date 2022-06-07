let Index = {
  mixins: [mixin_methods],
  data: function () {
    return {
      menuItems: [
        {
          title: '锁屏设置',
          link: '/basic/lock'
        },
        {
          title: '切号设置',
          link: '/basic/change'
        },
        {
          title: '步数修改',
          link: '/advance/ModificationStep'
        },
        {
          title: '能量雨设置',
          link: '/basic/rain'
        },
        {
          title: '图像识别相关设置',
          link: '/advance/region'
        },
        {
          title: '钉钉设置',
          link: '/basic/Ddwater'
        },
        {
          title: '钉钉加群浇水设置',
          link: '/basic/DdAddGroup'
        },
        {
          title: 'VIP功能',
          link: '/advance/VIP'
        },
        {
          title: '悬浮窗设置',
          link: '/basic/floaty'
        },
        {
          title: '浇水统计',
          link: '/view/collectSummary'
        },
        {
          title: 'Study设置',
          link: '/basic/study'
        },
        {
          title: '日志设置',
          link: '/basic/log'
        },
        {
          title: '前台应用白名单设置',
          link: '/advance/skipPackage'
        },
        {
          title: '高级设置',
          link: '/advance/common'
        },
        {
          title: '关于项目',
          link: '/about'
        },
        {
          title: '常见问题',
          link: '/QA'
        },
      ]
    }
  },
  methods: {
    routerTo: function (item) {
      this.$router.push(item.link)
      this.$store.commit('setTitleWithPath', { title: item.title, path: item.link })
    }
  },
  template: `<div>
    <van-cell-group>
      <van-cell :title="item.title" is-link v-for="item in menuItems" :key="item.link" @click="routerTo(item)"/>
    </van-cell-group>
  </div>`
}
