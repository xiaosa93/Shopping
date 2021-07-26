/*
    1 发送请求获取数据
    2 点击轮播图 预览放大
        1 绑定事件
        2 预览调用小程序api previewImage
    3.点击加入购物车
        1 绑定点击事件
        2 获取缓存中的购物车数据 数组格式
        3 先判断 当前的商品是否已经存在于 购物车
        4 已经存在 修改商品数据 执行购物车数量++ 重新把购物车数组 填充到缓存中
        5 不存在于购物车的数组中，直接给购物车数组添加一个新元素，带上购买数量属性num 重新把购物车数组填充到缓冲中
        6 弹出提示
    4 商品收藏
        1 页面onShow的时候，加载缓存中的商品收藏的数据
        2 判断是否被收藏
          1 是，改变页面图标
          2 不是，
        3 点击收藏按钮
          1 判断商品是否缓存在数组中
          2 已经存在 删除
          3 没有存在 添加收藏数组中，添加缓存中
        
*/ 
import {request} from '../../request/index.js'
// 引入
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        goodsObj:{},
        isCollect:false
    },
    // 商品对象
    GoodsInfo:{},

    /**
     * 生命周期函数--监听页面加载
     */
    onShow: function () {
        let pages =  getCurrentPages();
        let currentPage=pages[pages.length-1];
        let options=currentPage.options;          
        const {goods_id}=options;
        this.getGoodsDetail(goods_id)

       
          
    },

    // 获取商品详情数据
    async getGoodsDetail(goods_id){
        const res = await request({
            url:'/goods/detail',
            data:{goods_id}
        })
        // 保存商品全局对象
        this.GoodsInfo=res;

         // 1 获取缓存中商品收藏的数组
         let collect=wx.getStorageSync('collect')||[];
         // 2 判断当前商品是否收藏
         let isCollect=collect.some(v=>v.goods_id===this.GoodsInfo.goods_id);

        this.setData({
            goodsObj:{
                goods_name:res.goods_name,
                goods_price:res.goods_price,
                // iphone 部分手机不支持webp图片格式
                // 1找后台 2临时自己改 改成jpg首先确保后台存在jpg格式
                goods_introduce:res.goods_introduce.replace(/\.webp/g,'.jpg'),
                // goods_introduce:res.goods_introduce,
                pics:res.pics
            },
            isCollect
        })
    },

    // 点击轮播图 放大预览 
    handlePreviewImage(e){
        // 1先构造要预览的图片数组
        const urls=this.GoodsInfo.pics.map(v=>v.pics_mid)
        // 2接收传递过来的图片url
        const current=e.currentTarget.dataset.url;
        wx.previewImage({
            current: current,
            urls: urls
        });
          
    },
    // 点击加入购物车
    handleCartAdd(){
        // 1获取缓存中的购物车 数组
        let cart=wx.getStorageSync('cart')||[];
        // 2判断当前的商品是否已经存在于 购物车中
        let index=cart.findIndex(v=>v.goods_id===this.GoodsInfo.goods_id)
        if(index===-1){
            // 3不存在 第一次加入
            this.GoodsInfo.num=1;
                //添加是否选中状态 
            this.GoodsInfo.checked=true;
            cart.push(this.GoodsInfo)
        }else{
            // 4已经存在 执行num++
            cart[index].num++;
        }
        // 5把购物车重新添加回缓存中
        wx.setStorageSync('cart',cart);
        // 6弹窗提示
        wx.showToast({
            title: '加入成功',
            icon: 'success',
            mask: true,//防止用户手抖 疯狂点击按钮
        });
          
          
    },
    // 点击商品收藏
    handleCollect(){
        let isCollect=false;
        // 1 获取缓存中的商品数组
        let collect=wx.getStorageSync('collect')||[];
        // 2 是否被收藏过
        let index=collect.findIndex(v=>v.goods_id===this.GoodsInfo.goods_id);
        // 3 当index!=-1  已经收藏过了
        if(index!=-1){
            collect.splice(index,1)
            isCollect=false;
            wx.showToast({
                title: '取消成功',
                icon: 'success',
                mask: true
            });
              
        }else{
            collect.push(this.GoodsInfo);
            isCollect=true
            wx.showToast({
                title: '收藏成功',
                icon: 'success',
                mask: true
            });
        }
        // 4 存入缓存中
        wx.setStorageSync('collect', collect);
        // 5 修改data中的属性，isCollect
        this.setData({isCollect})

    }
})