# vue3-ts-lazyload
一个简单的懒加载
> 使用方式
1. 引入
在 ```main.ts```中
```ts
app.use(MyLazyLoad,{
  preload:1.1,
  loading:"https://ts1.cn.mm.bing.net/th/id/R-C.289c5bdbdd838d59245fc60620532fe5?rik=pQZoPRPeXTjCHg&riu=http%3a%2f%2fimg.zcool.cn%2fcommunity%2f01c30c571a507e32f875a3997c03db.gif&ehk=8%2bGl4aOtyDN7LK26jneUOroHcjOxuIqPysGAv0ZZUg4%3d&risl=&pid=ImgRaw&r=0"
})
```
2. 页面中使用
```html
 <ul>
      <li v-for="(img, index) in imgArrs" :Key="index">
        <img alt="图片" v-lazy="img"
          src="https://ts1.cn.mm.bing.net/th/id/R-C.289c5bdbdd838d59245fc60620532fe5?rik=pQZoPRPeXTjCHg&riu=http%3a%2f%2fimg.zcool.cn%2fcommunity%2f01c30c571a507e32f875a3997c03db.gif&ehk=8%2bGl4aOtyDN7LK26jneUOroHcjOxuIqPysGAv0ZZUg4%3d&risl=&pid=ImgRaw&r=0"
          style="height: 300px;">
      </li>
    </ul>
```
简简单单的使用


2022年7月31日18:39:35
