import {request} from '../../request/index.js'
// 引入
import regeneratorRuntime from '../../lib/runtime/runtime'
import {login} from '../../utils/asyncWx.js'
Page({
    async handleGetUserInfo(e){
        try {
            // 获取用户信息
        const {encryptedData,rawData,iv,signature}=e.detail;
        // 获取小程序登陆成功后的code值
        const {code} =await login()
        const loginParams={encryptedData,rawData,iv,signature,code}
        // 发送请求，获取token值!!!!!非企业级账号获取不了
        // const res=await request ({url:'/users/wxlogin',data:loginParams,methods:'post'})
        const token="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIzLCJpYXQiOjE1NjQ3MzAwNzksImV4cCI6MTAwMTU2NDczMDA3OH0.YPt-XeLnjV-_1ITaXGY2FhxmCe4NvXuRnRB8OMCfnPo"
        // 把 token存入到缓存中，同时跳回到上一个页面
        wx.setStorageSync('token', token);
        wx.navigateBack({
            delta: 1
        }); 
        } catch (error) {
            console.log(error);
        }                
          
    }
    
})