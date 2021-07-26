/*
    1 获取用户的收货地址
      1 绑定点击事件
      2 调用小程序内置api 获取用户收货地址 wx.chooseAddress
      3 获取 用户对小程序所授予获取地址的权限状态
       authSetting对象里有scope.address为true属性
      4 把获取到的收货地址存入到本地存储中
    2页面加载完毕 onLoad  onShow
      1 获取本地存储的地址数据
      2 把数据设置给data中的一个变量 
      3 onShow
        0 回到商品详情页面 第一次添加商品的时候，手动添加属性
            num=1,checked=true
        1 获取缓存中的购物车数组
        2 把购物车中的数据填充到data中
    3 全选的实现 数据的展示
      1 onShow 获取缓存中的购物车数组
      2 根据购物车中的商品数据计算 所有商品都被选中，全选按钮就选中   
    4 总价格总数量     
      1 都需要商品被选中 我们才拿来计算
      2 获取购物车数组，遍历是否被选中 
      3 总价格=单价*数量
      4 总数量+=商品树龄
      5 计算后的价格和数量设置回data中即可
    5 商品的选中功能
      1 绑定事件 获取被修改的对象
      2 商品对象选中状态取反，重新填充会data中和缓存中
      3 重新计算全选，总价格 总数量....
    6 全选和反选
      1 全选复选框绑定事件
      2 获取 data中的全选变量 allChecked
      3 直接取反 
      4 遍历购物车数组 让里面的商品状态跟随选中状态改变
      5 把购物车数组和allChecked重新设置回data 把购物车重新放回缓存中
    7 商品数量的编辑
      1 "+" "-"按钮 绑定同一个事件，区分的关键在自定义属性
        1 "+" +1
        2 "-" -1
      2 传递被点击的商品id   goods_id
      3 获取data中的购物车数组 获取需要被修改的商品对象
       当购物车的数量等于一同时点击减一按钮，弹出（wx.showModal）是否删除。
      4 直接修改商品的对象的num属性
      5 把cart数组 重新设置回缓存中和data中 this.setCart
    8 点击结算 
      1 判断有没有收货地址和选购商品
      2 经过以上验证，跳转到支付页面
      
*/
import {
    chooseAddress,
    showModal,
    showToast,
    getSetting,
    openSetting
} from '../../utils/asyncWx.js'
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({
    data:{
        address:{},
        cart:[],
        allChecked:false,
        totalPrice:0,
        totalNum:0
    },
    onShow(){
        // 1获取缓存中的收货地址信息
        const address=wx.getStorageSync('address');
        // 1.1获取购物车缓存数据
        const cart=wx.getStorageSync('cart')||[];
        this.setCart(cart);
        this.setData({
            address
        })
          
    },
    //  1点击收货地址
    async handleChooseAddress() {
        try {
            //  2获取收货地址

            //   wx.getSetting({
            //     success: (result) => {
            //         wx.chooseAddress({
            //             success: (result1) => {
            //                 console.log(result1);
            //              }
            //          });

            //       }
            //   });

            // 封装后
            const res = await chooseAddress();
            // 将收货地址存入到一个属性中，避免在wxml中字符串拼接过长
            res.all=res.provinceName+res.cityName+res.countyName+res.detailInfo
            // 3存入到缓存中
            wx.setStorageSync('address', res);
              
        } catch (error) {
            console.log(error);
        }

    },
    // 修改地址信息
    async handleUserInfo(){
        const res = await chooseAddress();
        // 将收货地址存入到一个属性中，避免在wxml中字符串拼接过长
        res.all=res.provinceName+res.cityName+res.countyName+res.detailInfo
        // 3存入到缓存中
        wx.setStorageSync('address', res);
        },
    // 商品的选中
    handleItemChange(e){
        // 1 获取被点击的id
        const goods_id=e.currentTarget.dataset.id
        this.data.cart.checked=!this.data.cart.checked
        // 2 获取购物车数组
        let {cart}=this.data;
        // 3 找到被修改的商品对象
        let index=cart.findIndex(v=>v.goods_id===goods_id);
        // 4 状态取反
        cart[index].checked=!cart[index].checked;
        this.setCart(cart);
                
    },
    // 设置购物车的状态，重新计算，底部工具栏的数据，全选 价格...
    setCart(cart){   
        let allChecked=true;
        // 总价格 总数量
        let totalPrice=0;
        let totalNum=0;

        cart.forEach(v => {
            if(v.checked){
                totalPrice+=v.num*v.goods_price;
                totalNum+=v.num;
            }else{
                allChecked=false;
            }
        })
        //判断数组是否为空
        allChecked=cart.length!=0? allChecked:false   
        // 2给data赋值
        this.setData({
            cart,
            totalPrice,allChecked,totalNum,
        })
        wx.setStorageSync('cart',cart)
    },
    // 商品全选功能
    handleItemAllCheck(){
        // 1获取data数据
        let {cart,allChecked}=this.data;
        // 2修改值
        allChecked=!allChecked;
        // 3循环修改cart数组中商品选中的状态
        cart.forEach(v=>v.checked=allChecked);
        // 4把购物车数组和allChecked重新设置回data 把购物车重新放回缓存中
        this.setCart(cart);
        
    },
    //商品数量的编辑功能
    async handleItemNumEdit(e){
                 
        const {operation,id}=e.currentTarget.dataset;
        let {cart}=this.data;
        const index=cart.findIndex(v=>v.goods_id===id);
        // 弹窗提示
        if(cart[index].num===1&&operation===-1){
            const res=await showModal({content:'确定要删除吗'})
            if(res.confirm){
                cart.splice(index,1)
                this.setCart(cart) 
            }
        }
        else{
            cart[index].num+=operation;
            this.setCart(cart) 
        }              

    },
    // 点击结算功能
    async handlePay(){
        // 1 判断收货地址
        const {address}=this.data;
        if(!address.userName){
            await showToast({
               title:"您还没有选择收货地址哦！",
            });
              
            return
        }
        // 2 判断用户有无选择商品
        const {totalNum}=this.data;
        if(!totalNum){
            await showToast({
                title:"您还没有选择商品哦！",
             });
            return;
        }
    }
})