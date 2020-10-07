// pages/search/search.js
const app = getApp();
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
    thisCity: null,
    city: "",
    // 默认显示热门城市
    hotcity: [
      {
        province: "北京",
        city: '北京'
      },
      {
        province: "上海",
        city: '上海'
      },
      {
        province: "广东",
        city: '广州'
      },
      {
        province: "广东",
        city: '深圳'
      },
      {
        province: "河南",
        city: '郑州'
      },
      {
        province: "陕西",
        city: '西安'
      },
      {
        province: "江苏",
        city: '南京'
      },
      {
        province: "浙江",
        city: '杭州'
      },
      {
        province: "湖北",
        city: '武汉'
      },
      {
        province: "四川",
        city: '成都'
      },
      {
        province: "辽宁",
        city: '沈阳'
      },
      {
        province: "天津",
        city: '天津'
      }
    ],
    // 当前是否是搜索
    searflg: false,
    searchdata: "",
    searnull: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  getValue: function (e) {
    // console.log(e.detail)
    let value = e.detail
    // console.log(newvlaue)
    // this.getCity(newvlaue)
    let _this = this
    // 连接数据库
    const db = wx.cloud.database()

    const _ = db.command
    // 查询数据
    // 利用或查询多条数据
    db.collection('search').where(_.or([
      {
        province: db.RegExp({
          regexp: ".*" + value,
          options: 'i'
        })
      },
      {
        city: db.RegExp({
          regexp: ".*" + value,
          options: 'i'
        })
      }
    ])).get({
      success: function (res) {
        // console.log(res)
        let newres = res.data
        let results = []
        let position = {}
        for (let i = 0; i < newres.length; i++) {
          for (let j = 0; j < newres[i].city.length; j++) {
            // console.log(newres[i].city[j].indexOf(value))
            if (newres[i].city[j].indexOf(value) == 0) {
              position.province = newres[i].province
              position.city = newres[i].city[j]
              results.push(position)
              position = {}
            }
          }
        }
        // console.log(results)
        if (res.data.length == 0) {
          _this.setData({
            searflg: true,
            searnull: true
          })
        } else if (value == "") {
          _this.setData({
            searflg: false
          })
        } else {
          _this.setData({
            searflg: true,
            searchdata: results
          })
        }
        console.log(_this.data.searchdata)
      }
    })
  },

  searchCity: function (e) {
    console.log(e)
    let position = {
      province: e.currentTarget.dataset.province,
      city: e.currentTarget.dataset.city,
      district: ""
    }
    wx.reLaunch({
      url: '/pages/index/index?position=' + JSON.stringify(position)
    })
  },

  backNav: function () {
    wx.redirectTo({
      url: '/pages/index/index'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

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
