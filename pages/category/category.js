import {request} from '../../request/index.js'

// 引入
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({
    data: {
        // 左侧的菜单数据
        leftMenuList:[],
        // 右侧的商品数据
        rightContent:[],
        // 被点击的左侧的菜单
        currentIndex:0,
        // 右侧内容的滚动条距离顶部的距离
        scrollTop:0

    },
    // 接口的返回数据
    Cates:[],
    onLoad: function (options) {
    /*
        0web中的存储和小程序中的本地存储的区别
            1.写代码的方式不一样
              web:localStorage.setItm("key","value")  localStorage.getItem("key")
              小程序: wx.setStorageSync('key', "value"); wx.getStorageSync('key');
            2.存的时候，有没有类型转换
              web:不管存入的是什么类型的数据，最终都会先调用一下toString(),转换为字符串再存进去
              小程序:不存在类型转换，存啥取啥。
        1.先判断一下本地存储中有没有旧的数据
        {time:Data.now(),data:[...]}
        2.没有旧数据，发送请求
        3.有旧数据，同时旧数据没有过期，就使用本地存储的旧数据

    */ 
        // 1获取本地存储的数据（小程序也是存在本地存储 技术）
        const Cates=wx.getStorageSync('cates');
        // 2判断
        if(!Cates){
            // 不存在  发送请求获取数据
            this.getCates()
        }else{
            // 有旧的数据 定义过期时间 10s 改成5分钟
            if(Date.now()-Cates.time>1000*300){
                // 重新发送请求
                this.getCates()
            }else{
                // 可以使用旧的数据
                this.Cates=Cates.data;

                // 构造左右两侧数据
                this.setData({
                    leftMenuList:this.Cates.map(v=>v.cat_name),
                    rightContent:this.Cates[0].children
                })
            }
        }
          
    },
    // 获取分类数据
    async getCates() {
        // request({
        //     url:'/categories'
        // })
        // .then(resolve=>{
        //     this.Cates=resolve.data.message;
        //     // 把接口的数据存入到本地存储中
        //     wx.setStorageSync('cates', {time:Date.now(),data:this.Cates});
              
        //     // 构造左右两侧数据
        //     this.setData({
        //         leftMenuList:this.Cates.map(v=>v.cat_name),
        //         rightContent:this.Cates[0].children
        //     })
        // })
        // 使用es7的async awai来发送请求
        const res = await request({url:'/categories'});
        // this.Cates=res.data.message;
        this.Cates=res;
            // 把接口的数据存入到本地存储中
            wx.setStorageSync('cates', {time:Date.now(),data:this.Cates});              
            // 构造左右两侧数据
            this.setData({
                leftMenuList:this.Cates.map(v=>v.cat_name),
                rightContent:this.Cates[0].children
            })
    },
    // 左侧菜单的点击事件
    handleItemTap(e){
        // const{index}=e.currentTarget.dataset;
        // this.setData({
        //     currentIndex:index,
        //     rightContent:this.Cates[index].children
        // })
       const currentIndex=e.currentTarget.dataset.index;
        this.setData({
            currentIndex,
            // 右侧内容
            rightContent:this.Cates[currentIndex].children,
            // 点击左侧菜单时,重新设置 右侧内容的scroll-view标签的距离顶部的距离
            scrollTop:0

        })
    }
})