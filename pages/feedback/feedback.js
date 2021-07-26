/*
    1 点击+触发tap点击事件
      1 调用小程序内置的 选择图片的api
      2 获取到 图片的路径 数组
      3 把路径存到data的变量中，
      4 页面就可以根据 图片数组进行循环显示，自定义组件
    2 点击自定义图片组件
      1 获取索引
      2 根据索引删除数组对应元素
      3 把数组重新设置回data中
    3 提交按钮  
      1 获取文本域的内容  类似输入框的获取
        data中定义变量表示输入框内容
        文本域绑定输入事件，事件触发的时候，输入框的值，存变量中
      2 对这些内容合法性验证
      3 验证通过，用户选择图片，上传到专门的图片服务器，返回图片外网的链接
        遍历数组   挨个上传  自己维护图片数组，存放 图片上传后的外网的链接
      4 文本域和外网的图片的路径 一起提交到服务器  前端模拟
      5 清空当前页面，
      6 返回上一页
*/ 
import {request} from '../../request/index.js'
// 引入
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({

    data: {
        tabs:[
            {id:0,value:'体验问题',isActive:true},
            {id:1,value:'商家投诉',isActive:false},
        ],
        goodsList:[],
        // 被选中的图片路径数组
        chooseImgs:[],
        // 文本域内容
        textValue:''
    },
        // 外网的图片的路径数组
        UploadImgs:[],

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
    // 点击“+”选择图片
    handleChooseImg(){
        wx.chooseImage({
            count: 9,   //同时选中的图片数量
            sizeType: ['original', 'compressed'],   //原图,压缩
            sourceType: ['album', 'camera'],    //来源 相册，相机
            success: (result) => {
                this.setData({
                    chooseImgs:[...this.data.chooseImgs,...result.tempFilePaths]
                })
            }
        });
          
    },
    // 点击自定义 图片组件
    handleRemoveImage(e){
        const {index}=e.currentTarget.dataset
        let {chooseImgs}=this.data;
        chooseImgs.splice(index,1)
        this.setData({
            chooseImgs
        })
    },
    //文本域的输入事件
    handleTextInput(e){
        this.setData({
            textValue:e.detail.value
        })
    },
    // 提交按钮
    handleFormSubmit(){
        // 1获取文本域 图片数组
        const{textValue,chooseImgs}=this.data;
        // 2 合法性判断
        if(!textValue.trim()){
            wx.showToast({
                title: '输入不合法',
                mask: true
            });              
            return 
        }
        // 3 准备上传图片到图片服务器
        // 此api不支持多个文件同时上传  遍历数组，挨个上传
        // 显示正在等待的图标

        wx.showLoading({
            title: '图片正在上传中',
            mask: true
        });

        // 判断有没有需要上传的图片数组
        if(chooseImgs.length!=0){
             chooseImgs.forEach((v, i) => {
                 wx.uploadFile({
                     url: 'https://imgtu.com/i/MjaXxU',
                     filePath: v,
                     name: 'file',
                     formData: {},
                     success: (res) => {
                         console.log(res);
                         let url = res.cookies[0];
                         console.log(url);
                         //将成功上传到服务器到地址返回存储
                         this.UploadImgs.push(url);
                         //判断是否为最后一张图片
                         if (i === chooseImgs.length - 1) {
                             wx.hideLoading();
                             console.log("把文本的内容和外网的图片数组 提交到后台中");
                             this.setData({
                                 textValue: "",
                                 chooseImgs: []
                             });
                             // 返回上一个页面
                             wx.navigateBack({
                                 delta: 1
                             });
                         }
                     }
                 });
             })
        } else{
            wx.hideLoading();
            // console.log("只是提交了文本");
            this.setData({
                textValue: "",
                chooseImgs: []
            });
            wx.navigateBack({
                delta: 1
            });
        }
          
       
       
          
    }
})