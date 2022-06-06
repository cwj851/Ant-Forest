
const router = new VueRouter({
  scrollBehavior (to, from, savedPosition) {
    console.log('savedPosition', savedPosition)
    if (savedPosition) {
      return savedPosition
    }
    return { x: 0, y: 0 }
  },
  routes: [
    { path: '/', component: Index, meta: { index: 0 } },
    { path: '/basic/rain', component: RainConfig, meta: { index: 1, title: '能量雨设置' } },
    { path: '/basic/lock', component: LockConfig, meta: { index: 1, title: '锁屏设置' } },
    { path: '/basic/floaty', component: FloatyConfig, meta: { index: 1, title: '悬浮窗设置' } },
    { path: '/basic/change', component: ChangeConfig, meta: { index: 1, title: '切号设置' } },
    { path: '/advance/ModificationStep', component: ModificationStepConfig, meta: { index: 1, title: '步数修改' } },
    { path: '/advance/region', component: RegionConfig, meta: { index: 1, title: '图像识别相关设置' } },
    { path: '/advance/VIP', component: VIPConfigs, meta: { index: 1, title: 'VIP功能' } },
    { path: '/advance/VIP/DailyChartsCheck', component: DailyChartsCheckConfig, meta: { index: 2, title: '日榜查催群组列表设置' } },
    { path: '/advance/VIP/SumChartsCheck', component: SumChartsCheckConfig, meta: { index: 2, title: '总榜查催群组列表设置' } },
    { path: '/basic/Ddwater', component: DdwaterConfig, meta: { index: 1, title: '钉钉设置' } },
    { path: '/basic/Ddwater/mineGroupList', component: DDmineGroupListConfig, meta: { index: 2, title: '钉钉群组列表配置' } },
    { path: '/basic/Ddwater/Groups', component: GroupsConfig, meta: { index: 2, title: '小号换绑浇水列表设置' } },
    { path: '/basic/Ddwater/Groups_Ex', component: GroupsConfig_Ex, meta: { index: 2, title: '大号浇水群组列表设置' } },
    { path: '/basic/study', component: StudyConfig, meta: { index: 1, title: 'Study设置' } },
    { path: '/basic/log', component: LogConfig, meta: { index: 1, title: '日志设置' } },
    { path: '/advance/skipPackage', component: SkipPackageConfig, meta: { index: 1, title: '前台应用白名单设置' } },
    { path: '/advance/common', component: AdvanceCommonConfig, meta: { index: 1, title: '高级设置' } },
    { path: '/about', component: About, meta: { index: 1, title: '关于项目' } },
    { path: '/QA', component: QuestionAnswer, meta: { index: 1, title: '常见问题' } },
    { path: '/view/collectSummary', component: CollectSummary, meta: { index: 1, title: '浇水统计', keepAlive: true } },
  ]
})