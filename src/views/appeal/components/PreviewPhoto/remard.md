const demoPhoto =[
  {
    path: "https://lorempixel.com/640/480/?28208"
    version: "original_photo"
  },
  {
    path: "https://lorempixel.com/640/480/?28208"
    version: "original_photo"
  },
  {
    path: "https://lorempixel.com/640/480/?28208"
    version: "original_photo"
  }
]

使用：

```
<div v-for="(photoItem, photoIndex) in photos" :key="photoIndex" class="photo-box">
  <div class="photo-box"  @click.native="showPriviewPhoto(photoIndex)">
    <img :src="photoItem.path" />
  </div>
</div>

methods: {
  /**
    * @description 展示搜索框
    */
  showPriviewPhoto (photoIndex) {
    this.photos.forEach(item => {
      item.src = item.path
    })
    this.priviewPhotoData = this.photos
    this.imgIndex = photoIndex
    this.showPreview = true
  }
}

<preview-photo
  v-if="showPreview"
  :imgarray="priviewPhotoData"
  :orderindex="imgIndex"
  :show-preview.sync="showPreview"
/>

- showPreview: 是否显示组件
- imgarray: 传入组件的照片数据 格式要求 件demoPhoto version 可以自己更改 需要的格式
- imgIndex: 点击照片的索引
```