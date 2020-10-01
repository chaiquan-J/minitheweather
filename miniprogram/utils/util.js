const formatTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    [year, month, day].map(formatNumber).join("/") +
    " " +
    [hour, minute, second].map(formatNumber).join(":")
  );
};

const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : "0" + n;
};

// 用户授权地理位置
function getUserstatus(getfun, getpoiti) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting["scope.userLocation"]) {
        wx.authorize({
          scope: "scope.userLocation",
          success() {
            // 用户已经同意小程序，后续调用接口不会弹窗询问
            // getUserposition(getfun);
            wx.getLocation({
              type: "gcj02", //返回可以用于wx.openLocation的经纬度
              // isHighAccuracy: true,
              success(res) {
                // console.log(res);
                const latitude = res.latitude;
                const longitude = res.longitude;
                getfun(latitude, longitude, getpoiti);
                // console.log("成功");
              },
            });
          },
        });
      } else {
        // getUserposition(getfun);
        wx.getLocation({
          type: "gcj02", //返回可以用于wx.openLocation的经纬度
          // isHighAccuracy: true,
          success(res) {
            // console.log(res);
            const latitude = res.latitude;
            const longitude = res.longitude;
            getfun(latitude, longitude, getpoiti);
            // console.log("成功");
          },
        });
      }
    },
  });
}

// 授权后获取经纬传回页面处理数据
function getUserposition(getpost) {
  wx.getLocation({
    type: "gcj02", //返回可以用于wx.openLocation的经纬度
    isHighAccuracy: true,
    success(res) {
      // console.log(res);
      const latitude = res.latitude;
      const longitude = res.longitude;
      getpost(latitude, longitude);
      // console.log("成功");
    },
  });
}

// 获取天气信息
function getWeather() { }

module.exports = {
  formatTime: formatTime,
  getUserstatus: getUserstatus,
};
