/*
    1 输入框绑定 改变事件 input事件
      1 获取到输入框的值
      2 合法性判断
      3 检验通过 把输入框的值发送到后台
      4 返回的数据 打印到页面上
    2 防抖
        一般用于输入框 防止重复输入 重复发送请求
      节流
        一般用在页面下拉和上拉
    定义全局定时器id
*/ 

import {request} from '../../request/index.js'
// 引入
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({
    data:{
        goods:[],
        // 取消按钮是否显示
        isFocus:false,
        // 输入框的值
        inpValue:[]
    },
    TimeId:-1,
    // 输入框改变就会触发的事件
    handleInput(e){
        // 1 获取输入框的值
        const {value} = e.detail;
        // 2 检验合法性
        if(!value.trim()){
            // 值不合法
            this.setData({
                isFocus:false,
                goods:[]
            })
            return ;
        }
        // 3 准备发送请求，获取数据
        this.setData({isFocus:true})
        clearTimeout(this.TimeId);
        this.TimeId=setTimeout(() => {
            this.qsearch(value)
        }, 1000);
        
    },
    // 发送请求获取建议数据
    async qsearch(query){
        const res=await request({
            url:'/goods/qsearch',
            data:{query}
        })
        console.log(res);
        this.setData({goods:res})
    },
    // 点击取消按钮
    handleCancel(){
        this.setData({
            goods:[],
            inpValue:''
        })
    }
})