// pages/login/login.js
Page({
    getUserProfile(e){
        wx.getUserProfile({
            desc: "获取你的昵称、头像、地区及性别",
            success: res => {
              const {userInfo}=res;
              wx.setStorageSync('userInfo', userInfo);
              wx.navigateBack({
                  delta: 1
              });
                
                
            },
            fail: res => {
                 //拒绝授权
              that.showErrorModal('您拒绝了请求');
              return;
            }
          })
    }
    
})