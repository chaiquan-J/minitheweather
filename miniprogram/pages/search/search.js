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
    setInfo: false,
    userInfo: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  // 测试数据库
  getUserInfo: function (e) {
    const db = wx.cloud.database();

    if (e.detail.userInfo) {
      db.collection("users")
        .add({
          data: {
            useravatarUrl: e.detail.userInfo.nickName,
            usernickName: e.detail.userInfo.avatarUrl,
            userphone: "",
            time: new Date(),
          },
        })
        .then((res) => {
          db.collection("users")
            .doc(res._id)
            .get({
              success: function (res) {
                // res.data 包含该记录的数据
                console.log(res);
              },
            });
        });

      this.setData({
        setInfo: true,
        userInfo: e.detail.userInfo,
      });
    }
    // console.log(e)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const query = wx.createSelectorQuery();
    query
      .select("#myCanvas")
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");

        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        ctx.fillRect(0, 0, 100, 100);
      });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
