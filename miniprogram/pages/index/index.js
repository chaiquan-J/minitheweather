// miniprogram/pages/index/index.js
var QQMapWX = require("../../libs/qqmap-wx-jssdk.js");
var qqmapsdk = new QQMapWX({
  key: "P6IBZ-OWZ3U-OE4VW-BEUKF-LKMH5-PDFJK", // 必填
});
const utils = require("../../utils/util.js");

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
        url: "../../images/icon/健康.png",
      },
      {
        title: "旅行",
        url: "../../images/icon/旅行.png",
      },
      {
        title: "美食",
        url: "../../images/icon/美食.png",
      },
      {
        title: "种树",
        url: "../../images/icon/种树.png",
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
    prelicolor: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    utils.getUserstatus(this.formSubmit, this.setPositi);
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
    });
  },

  // 处理位置数据
  setPositi: function (data) {
    this.setData({
      positionData: data,
    });
    let position = this.data.positionData;
    // 获取天气数据
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

  // 处理天气数据
  setWeather: function (data, datatype) {
    // console.log(data, datatype);
    let oldData = data;
    let newData;
    let preliminary = this.data.preliminary;
    let prelicolor = this.data.prelicolor
    if (datatype == "weather") {
      if (oldData.alarm != {}) {
        // console.log(oldData.alarm);
        // console.log(1);
        if (oldData.alarm[0].level_name == "蓝色") {
          prelicolor = "blue"
        } else {
          prelicolor = "yellow"
        }
        preliminary = true;
      }
      // let newData;
      oldData.forecast_1h = Object.values(oldData.forecast_1h);
      oldData.forecast_24h = Object.values(oldData.forecast_24h);

      let len_1h = oldData.forecast_1h.length;
      let len_24h = oldData.forecast_24h.length;

      for (let i = 0; i < len_1h; i++) {
        oldData.forecast_1h[i].nwetimeh = oldData.forecast_1h[
          i
        ].update_time.substring(8, 10);
      }
      for (let i = 0; i < len_24h; i++) {
        oldData.forecast_24h[i].month = oldData.forecast_24h[i].time.substring(
          5,
          7
        );
        oldData.forecast_24h[i].date = oldData.forecast_24h[i].time.substring(
          8,
          10
        );
        oldData.forecast_24h[i].week = this.modifyweek(oldData.forecast_24h[i].time);
      }
      newData = oldData;
      // console.log(week)
    } else {
      newData = oldData;
    }
    console.log(newData);
    this.setData({
      [datatype]: newData,
      prelicolor: prelicolor,
      preliminary: preliminary,
    });
  },

  // 添加星期
  modifyweek: function (time) {
    var dt = new Date(time.replace(/-/g, '/'));
    var a = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return a[dt.getDay()];
  },

  // 顶部弹出层
  showToppup: function () {
    this.setData({ topshow: true });
  },

  showPrelim: function () {
    this.setData({ prelimshow: true });
  },

  // 关闭弹出层
  onClosetop: function () {
    this.setData({ topshow: false });
  },

  onCloseprelim: function () {
    this.setData({ prelimshow: false });
  },

  // 禁止用户滑动
  prohibitSlide: function (e) {
    return false;
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
