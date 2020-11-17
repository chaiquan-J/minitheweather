// miniprogram/pages/index/index.js
// 腾讯地图api
var QQMapWX = require("../../libs/qqmap-wx-jssdk.js");
var qqmapsdk = new QQMapWX({
  key: "P6IBZ-OWZ3U-OE4VW-BEUKF-LKMH5-PDFJK", // 必填
});
// 共通方法
const utils = require("../../utils/util.js");
import Toast from '@vant/weapp/toast/toast';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 控制顶部弹出层
    topshow: false,
    prelimshow: false,
    // 跳转图标
    external: [
      {
        title: "健康",
        url: "../../images/icon/jiankang.png",
      },
      {
        title: "旅行",
        url: "../../images/icon/lvxing.png",
      },
      {
        title: "美食",
        url: "../../images/icon/meishi.png",
      },
      {
        title: "种树",
        url: "../../images/icon/zhongshu.png",
      },
    ],
    // 位置
    positionData: null,
    // 天气
    weather: null,
    // 空气质量
    weatherair: null,
    // 是否有预警
    preliminary: false,
    // 预警颜色
    prelicolor: "",
    // 发布时间
    nonetime: "",
    // 生活卡片
    lifeshow: false,
    // 卡片颜色
    lifecolor: "",
    // 卡片内容
    lifeid: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.hiddenTime();
    this.showToast();
    if (JSON.stringify(options) == "{}") {
      console.log(1)
      utils.getUserstatus(this.formSubmit, this.setPositi);
    } else {
      console.log(JSON.parse(options.position))
      this.searchWeather(JSON.parse(options.position))
    }
  },

  // 使用腾讯提供的方法把用户位置用文字显示
  formSubmit(lati, longi, setfun) {
    var _this = this;
    qqmapsdk.reverseGeocoder({
      //位置坐标，默认获取当前位置，非必须参数
      location: lati + "," + longi || "", //获取表单传入的位置坐标,不填默认当前位置,示例为string格式
      //get_poi: 1, //是否返回周边POI列表：1.返回；0不返回(默认),非必须参数
      success: function (res) {
        //成功后的回调
        // console.log(res.result);
        setfun(res.result.address_component);
      },
    });
  },

  // 获取天气数据
  getApi: function (prov, city, county, type, dataType, setfun) {
    let _this = this;
    wx.request({
      url: "https://wis.qq.com/weather/common",
      data: {
        source: "xw",
        weather_type: type,
        province: prov,
        city: city,
        county: county,
      },
      header: { "content-type": "json" },
      success: (res) => {
        setfun(res.data.data, dataType);
      },
      fail: (err) => {
        console.log(err)
      }
    });
  },

  // 处理位置数据
  setPositi: function (data) {
    // 位置数据放到data中保存
    // console.log(data)
    this.setData({
      positionData: data,
    });
    // 把获取到位置数据存在中间变量
    let position = this.data.positionData;
    // 获取天气数据
    // 请求两次是因为包含城区的天气数据不会带空气质量数据
    // 参数只有城市时，才会有空气质量的数据
    this.getApi(
      position.province,
      position.city,
      position.district,
      "observe|forecast_1h|forecast_24h|index|alarm|limit|tips|rise",
      "weather",
      this.setWeather
    );
    this.getApi(
      position.province,
      position.city,
      "",
      "air",
      "weatherair",
      this.setWeather
    );
    // console.log(this.data.positionData);
  },

  // 跳转搜索
  navSearch: function () {
    wx.navigateTo({
      url: "/pages/search/search"
    })
  },

  // 搜索时调用的方法
  searchWeather: function (e) {
    console.log(e)
    this.setData({
      positionData: e
    })

    this.getApi(
      e.province,
      e.city,
      "",
      "observe|forecast_1h|forecast_24h|index|alarm|limit|tips|rise",
      "weather",
      this.setWeather
    );
    this.getApi(
      e.province,
      e.city,
      "",
      "air",
      "weatherair",
      this.setWeather
    );
  },

  // 处理天气数据
  setWeather: function (data, datatype) {
    console.log(data, datatype);
    let oldData = data;
    let newData;
    // 预警数据
    let preliminary = this.data.preliminary;
    let prelicolor = this.data.prelicolor;
    // 判断是空气质量还是天气数据
    if (datatype == "weather") {
      let alarm = oldData.alarm;
      // 判断是否有天气预警
      if (!JSON.stringify(alarm) == "{}") {
        // console.log(oldData.alarm);
        switch (oldData.alarm[0].level_name) {
          case "蓝色":
            prelicolor = "blue";
            break;
          case "黄色":
            prelicolor = "yellow";
            break;
          case "橙色":
            prelicolor = "orange";
            break;
          case "红色":
            prelicolor = "red";
            break;
        }
        preliminary = true;
      }
      // let newData;
      // 把对象转成数组形式
      oldData.forecast_1h = Object.values(oldData.forecast_1h);
      oldData.forecast_24h = Object.values(oldData.forecast_24h);
      oldData.index = Object.values(oldData.index);

      let len_1h = oldData.forecast_1h.length;
      let len_24h = oldData.forecast_24h.length;
      let update_time = oldData.observe.update_time;

      // 处理24小时时间
      for (let i = 0; i < len_1h; i++) {
        oldData.forecast_1h[i].nwetimeh = oldData.forecast_1h[
          i
        ].update_time.substring(8, 10);

        // 给24小时天气加上图片id属性
        switch (oldData.forecast_1h[i].weather) {
          case '晴':
            oldData.forecast_1h[i].weatherimg = 'qing'
            break;
          case '多云':
            oldData.forecast_1h[i].weatherimg = 'duoyun'
            break;
          case '阴':
            oldData.forecast_1h[i].weatherimg = 'yin'
            break;
          case '小雨':
            oldData.forecast_1h[i].weatherimg = 'xiaoyu'
            break;
          case '中雨':
            oldData.forecast_1h[i].weatherimg = 'zhongyu'
            break;
          case '大雨':
            oldData.forecast_1h[i].weatherimg = 'dayu'
            break;
          case '阵雨':
            oldData.forecast_1h[i].weatherimg = 'zhenyu'
            break;
          case '暴雨':
            oldData.forecast_1h[i].weatherimg = 'baoyu'
            break;
          case '大暴雨':
            oldData.forecast_1h[i].weatherimg = 'dabaoyu'
            break;
          case '特大暴雨':
            oldData.forecast_1h[i].weatherimg = 'tedabaoyu'
            break;
          case '雷阵雨':
            oldData.forecast_1h[i].weatherimg = 'leizhenyu'
            break;
          case '雷阵雨伴冰雹':
            oldData.forecast_1h[i].weatherimg = 'leizhenyubanbingbao'
            break;
          case '冻雨':
            oldData.forecast_1h[i].weatherimg = 'dongyu'
            break;
          case '阵雪':
            oldData.forecast_1h[i].weatherimg = 'zhenxue'
            break;
          case '小雪':
            oldData.forecast_1h[i].weatherimg = 'xiaoxue'
            break;
          case '大雪':
            oldData.forecast_1h[i].weatherimg = 'daxue'
            break;
          case '中雪':
            oldData.forecast_1h[i].weatherimg = 'zhongxue'
            break;
          case '暴雪':
            oldData.forecast_1h[i].weatherimg = 'baoxue'
            break;
          case '雾':
            oldData.forecast_1h[i].weatherimg = 'wu'
            break;
          case '浮尘':
            oldData.forecast_1h[i].weatherimg = 'fuchen'
            break;
          case '扬沙':
            oldData.forecast_1h[i].weatherimg = 'yangsha'
            break;
          case '沙尘暴':
            oldData.forecast_1h[i].weatherimg = 'shachenbao'
            break;
          case '强沙尘暴':
            oldData.forecast_1h[i].weatherimg = 'qiangshachenbao'
            break;
          default:
            oldData.forecast_1h[i].weatherimg = 'duoyun'
        }
      }
      // 处理一周时间
      for (let i = 0; i < len_24h; i++) {
        oldData.forecast_24h[i].month = oldData.forecast_24h[i].time.substring(
          5,
          7
        );

        oldData.forecast_24h[i].date = oldData.forecast_24h[i].time.substring(
          8,
          10
        );

        oldData.forecast_24h[i].week = this.modifyweek(
          oldData.forecast_24h[i].time
        );

        switch (oldData.forecast_24h[i].day_weather) {
          case '晴':
            oldData.forecast_24h[i].dayimg = 'qing'
            break;
          case '多云':
            oldData.forecast_24h[i].dayimg = 'duoyun'
            break;
          case '阴':
            oldData.forecast_24h[i].dayimg = 'yin'
            break;
          case '小雨':
            oldData.forecast_24h[i].dayimg = 'xiaoyu'
            break;
          case '中雨':
            oldData.forecast_24h[i].dayimg = 'zhongyu'
            break;
          case '大雨':
            oldData.forecast_24h[i].dayimg = 'dayu'
            break;
          case '阵雨':
            oldData.forecast_24h[i].dayimg = 'zhenyu'
            break;
          case '暴雨':
            oldData.forecast_24h[i].dayimg = 'baoyu'
            break;
          case '大暴雨':
            oldData.forecast_24h[i].dayimg = 'dabaoyu'
            break;
          case '特大暴雨':
            oldData.forecast_24h[i].dayimg = 'tedabaoyu'
            break;
          case '雷阵雨':
            oldData.forecast_24h[i].dayimg = 'leizhenyu'
            break;
          case '雷阵雨伴冰雹':
            oldData.forecast_24h[i].dayimg = 'leizhenyubanbingbao'
            break;
          case '冻雨':
            oldData.forecast_24h[i].dayimg = 'dongyu'
            break;
          case '阵雪':
            oldData.forecast_24h[i].dayimg = 'zhenxue'
            break;
          case '小雪':
            oldData.forecast_24h[i].dayimg = 'xiaoxue'
            break;
          case '大雪':
            oldData.forecast_24h[i].dayimg = 'daxue'
            break;
          case '中雪':
            oldData.forecast_24h[i].dayimg = 'zhongxue'
            break;
          case '暴雪':
            oldData.forecast_24h[i].dayimg = 'baoxue'
            break;
          case '雾':
            oldData.forecast_24h[i].dayimg = 'wu'
            break;
          case '浮尘':
            oldData.forecast_24h[i].dayimg = 'fuchen'
            break;
          case '扬沙':
            oldData.forecast_24h[i].dayimg = 'yangsha'
            break;
          case '沙尘暴':
            oldData.forecast_24h[i].dayimg = 'shachenbao'
            break;
          case '强沙尘暴':
            oldData.forecast_24h[i].dayimg = 'qiangshachenbao'
            break;
          default:
            oldData.forecast_24h[i].dayimg = 'duoyun'
        }

        switch (oldData.forecast_24h[i].night_weather) {
          case '晴':
            oldData.forecast_24h[i].nightimg = 'qing'
            break;
          case '多云':
            oldData.forecast_24h[i].nightimg = 'duoyun'
            break;
          case '阴':
            oldData.forecast_24h[i].nightimg = 'yin'
            break;
          case '小雨':
            oldData.forecast_24h[i].nightimg = 'xiaoyu'
            break;
          case '中雨':
            oldData.forecast_24h[i].nightimg = 'zhongyu'
            break;
          case '大雨':
            oldData.forecast_24h[i].nightimg = 'dayu'
            break;
          case '阵雨':
            oldData.forecast_24h[i].nightimg = 'zhenyu'
            break;
          case '暴雨':
            oldData.forecast_24h[i].nightimg = 'baoyu'
            break;
          case '大暴雨':
            oldData.forecast_24h[i].nightimg = 'dabaoyu'
            break;
          case '特大暴雨':
            oldData.forecast_24h[i].nightimg = 'tedabaoyu'
            break;
          case '雷阵雨':
            oldData.forecast_24h[i].nightimg = 'leizhenyu'
            break;
          case '雷阵雨伴冰雹':
            oldData.forecast_24h[i].nightimg = 'leizhenyubanbingbao'
            break;
          case '冻雨':
            oldData.forecast_24h[i].nightimg = 'dongyu'
            break;
          case '阵雪':
            oldData.forecast_24h[i].nightimg = 'zhenxue'
            break;
          case '小雪':
            oldData.forecast_24h[i].nightimg = 'xiaoxue'
            break;
          case '大雪':
            oldData.forecast_24h[i].nightimg = 'daxue'
            break;
          case '中雪':
            oldData.forecast_24h[i].nightimg = 'zhongxue'
            break;
          case '暴雪':
            oldData.forecast_24h[i].nightimg = 'baoxue'
            break;
          case '雾':
            oldData.forecast_24h[i].nightimg = 'wu'
            break;
          case '浮尘':
            oldData.forecast_24h[i].nightimg = 'fuchen'
            break;
          case '扬沙':
            oldData.forecast_24h[i].nightimg = 'yangsha'
            break;
          case '沙尘暴':
            oldData.forecast_24h[i].nightimg = 'shachenbao'
            break;
          case '强沙尘暴':
            oldData.forecast_24h[i].nightimg = 'qiangshachenbao'
            break;
          default:
            oldData.forecast_24h[i].nightimg = 'duoyun'
        }
      }
      // 处理发布时间
      let update_time_h = update_time.substring(8, 10);
      let update_time_m = update_time.substring(10, 12);
      oldData.observe.newtime = `${update_time_h}:${update_time_m}`;

      // 处理日出日落
      let sunrise = oldData.rise[0].sunrise;
      let sunset = oldData.rise[0].sunset;
      let riseh = sunrise.substring(0, 2);
      let seth = sunset.substring(0, 2);

      oldData.rise[0].riseh = riseh;

      oldData.rise[0].seth = seth;

      // 处理完成赋值给新变量
      newData = oldData;
      // console.log(newData.observe.newtime);
      // console.log(week)
    } else {
      // 如果是天气质量直接赋值 不需要处理
      newData = oldData;
    }
    // console.log(newData);
    // console.log(newData.index);
    // 改变data中的数据
    this.setData({
      [datatype]: newData,
      prelicolor: prelicolor,
      preliminary: preliminary,
    });
    // 关闭加载中
    setTimeout(() => {
      this.hiddenToast()
    }, 500)
  },

  // 添加星期
  modifyweek: function (time) {
    var dt = new Date(time.replace(/-/g, "/"));
    var a = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return a[dt.getDay()];
  },

  // 打开弹出层
  showToppup: function () {
    this.setData({ topshow: true });
  },

  showPrelim: function () {
    this.setData({ prelimshow: true });
  },

  showLife: function (e) {
    let lifeid = e.currentTarget.dataset.id
    let lifecolor;

    // 筛选当前点击的是哪一条数据
    switch (lifeid) {
      case 0:
        lifecolor = "conditioner"
        break;
      case 1:
        lifecolor = "allergy"
        break;
      case 2:
        lifecolor = "car"
        break;
      case 3:
        lifecolor = "cold"
        break;
      case 4:
        lifecolor = "clad"
        break;
      case 5:
        lifecolor = "influenza"
        break;
      case 6:
        lifecolor = "comfort"
        break;
      case 7:
        lifecolor = "air"
        break;
      case 8:
        lifecolor = "traffic"
        break;
      case 9:
        lifecolor = "field"
        break;
      case 10:
        lifecolor = "fish"
        break;
      case 11:
        lifecolor = "sunstroke"
        break;
      case 12:
        lifecolor = "cosmetics"
        break;
      case 13:
        lifecolor = "mood"
        break;
      case 14:
        lifecolor = "morning"
        break;
      case 15:
        lifecolor = "exercise"
        break;
      default:
        lifecolor = "conditioner"
    }

    this.setData({
      lifeid: lifeid,
      lifecolor: lifecolor,
      lifeshow: true
    });
  },
  // 打开弹出层

  // 关闭弹出层
  onClosetop: function () {
    this.setData({ topshow: false });
  },

  onCloseprelim: function () {
    this.setData({ prelimshow: false });
  },

  onCloselife: function () {
    this.setData({ lifeshow: false });
  },
  // 关闭弹出层

  // 禁止用户滑动
  prohibitSlide: function (e) {
    return false;
  },

  // 隐藏发布时间
  hiddenTime: function (e) {
    setTimeout(() => {
      this.setData({ nonetime: "hidden_time" });
    }, 5000);
  },

  // 页面加载提示
  showToast: function () {
    Toast.loading({
      message: '加载中',
      forbidClick: true,
      duration: 0,
      mask: true
    });
  },

  // 关闭提示
  hiddenToast: function () {
    Toast.clear()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },
});
