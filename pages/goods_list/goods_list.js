/*
    1.用户上划页面 滚动天触底 开始加载下一页数据
      1-1找到滚动条触底事件
      1-2判断是否还有下一页数据
        获取总页数Math.ceil(总条数total/页容量pagesize)
        获取当前页码pagenum
        判断当前页码是否大于总页数
      1-3假如没有 弹出一个提示
      1-4还有的话，就加载
        当前的页码++
        重新发送请求
        数据请求回来，要对data中的数组进行拼接 而不是替换
    2.下拉刷新页面
      1触发下拉刷新事件
      2重置数据 数组清空
      3重置页码 设置为1
      4重新发送请求
      5数据请求回来，需要手动关闭等待效果
*/ 

import {request} from '../../request/index.js'
// 引入
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({

    data: {
        tabs:[
            {id:0,value:'综合',isActive:true},
            {id:1,value:'销量',isActive:false},
            {id:2,value:'价格',isActive:false},
        ],
        goodsList:[]
    },
    // 接口要的参数
    QueryParams:{
        query:'',
        cid:'',
        pagenum:1,
        pagesize:10
    },
    // 总页数
    totalPages:1,
    onLoad: function (options) {
        this.QueryParams.cid=options.cid||'';
        this.query.cid=options.query||'';
        this.getGoodsList();
    },
    // 获取商品列表数据
    async getGoodsList(){
        const res=await request({url:'/goods/search',data:this.QueryParams})
        // 获取总条数
        const total=res.total;
        // 计算总页数
        this.totalPages=Math.ceil(total/this.QueryParams.pagesize)
        // console.log(this.totalPages);
        this.setData({
            // 拼接数组
            goodsList:[...this.data.goodsList,...res.goods]
        })
        // 关闭下拉刷新窗口 如果没有调用直接关闭也不会报错
        wx.stopPullDownRefresh();  
    },

    // 标题点击事件，从子组件传递过来
    handleTabsItemChange(e){
        // 获取被点击的索引
        const {index}=e.detail;
        // 2.修改原数组
        let {tabs}=this.data;
        tabs.forEach((v,i)=>i===index?v.isActive=true:v.isActive=false)
        // 3.赋值到data中
        this.setData({
            tabs
        })
    },
    //下拉刷新
    onPullDownRefresh: function () {
        // 重置数组
        this.setData({
            goodsList:[]
        })
        // 重置页码
        this.QueryParams.pagenum=1;
        // 发送请求
        this.getGoodsList();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        // 判断还有没有下一页数据
        if(this.QueryParams.pagenum>=this.totalPages){
           wx.showToast({
               title: '我是有底线的',              
           });             
        }else{
            this.QueryParams.pagenum++;
            this.getGoodsList()
        }
    }
})