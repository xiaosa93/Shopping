/*
  1 页面加载的时候，
    1 从缓存中获取购物车数据 渲染到页面中
      这些数据 checked=true
    2 微信支付
      1 哪些人 哪些账号可以实现微信支付
        1 企业账号 
        2 企业账号小程序后台中 必须给开发者添加上白名单 
          一个AppID可以绑定多个开发者 可以共用这个AppID和开发权限
        3 点击支付按钮
          1 判断缓存中有无token
          2 没有则调到授权页面，进行获取token
          3 有token
          4 创建订单编号
          5 已经完成微信支付
          6 手动删除缓存中，已经被选中了的商品
          7 删除后的购物车数据填回缓存中
          8 跳转页面
*/ 
import {
    chooseAddress,
    showModal,
    showToast,
    getSetting,
    openSetting,
    requestPayment
} from '../../utils/asyncWx.js'
import regeneratorRuntime from '../../lib/runtime/runtime'
import {request} from '../../request/index.js'
Page({
    data:{
        address:{},
        cart:[],
        totalPrice:0,
        totalNum:0
    },
    onShow(){
        // 1获取缓存中的收货地址信息
        const address=wx.getStorageSync('address');
        // 1.1获取购物车缓存数据
        let cart=wx.getStorageSync('cart')||[];
        // 过滤后的购物车数组
        cart=cart.filter(v=>v.checked);
        this.setData({address})
        // 总价格 总数量
        let totalPrice=0;
        let totalNum=0;

        cart.forEach(v => {
            totalPrice+=v.num*v.goods_price;
            totalNum+=v.num;           
        })
        // 2给data赋值
        this.setData({
            cart,
            totalPrice,totalNum,address
        }) 
    },
    // 修改地址信息
    async handleUserInfo(){
        const res = await chooseAddress();
        // 将收货地址存入到一个属性中，避免在wxml中字符串拼接过长
        res.all=res.provinceName+res.cityName+res.countyName+res.detailInfo
        // 3存入到缓存中
        wx.setStorageSync('address', res);
    },
    // 点击支付
    async handleOrderPay(){
        // 1 判断有无token
        const token = wx.getStorageSync('token',token);
        if(!token){
            wx.navigateTo({
                url: '/pages/auth/auth',
            });
            return ;  
        }
        //创建订单 
        //准备请求头参数
        // const header={Authorization:token};
        // 准备请求体参数
        const order_price=this.data.totalPrice;
        const consignee_addr=this.data.address.all;
        const cart=this.data.cart;
        let goods=[];
        cart.forEach(v=>goods.push({
            goods_id:v.goods_id,
            goods_number:v.num,
            goods_price:v.goods_price
        }))
        const orderParams={order_price,consignee_addr,goods}
        // 准备发请求
        const {order_number}=await request({
            url:'/my/orders/create',
            method:'POST',
            data:orderParams,
            // header,
        })
        // 发起预支付接口
        const {pay}=await request({
            url:'/my/orders/req_unifiedorder',
            method:'POST',
            data:{order_number},
            // header,
        })
        // 发起微信支付
        // await requestPayment(pay);
        
        // // 查询订单状态
        // const res=await request({
        //     url:'/my/orders/chkOrder',
        //     method:'POST',
        //     data:{order_number},
        //     header,
        // })
        
        //手动删除缓存中已经支付了的数据
        let newCart=wx.getStorageSync('cart')
        newCart=newCart.filter(v=>!v.checked);
        wx.setStorageSync('cart',newCart)
        wx.navigateTo({
            url: '/pages/order/order',
        });
          
    }

})

  