export const COLOUR_SCHEME = {
  RED: 'red',
  GREEN: 'green',
  GRAY: 'gray',
  YELLOW: 'yellow',
  PURPLE: 'purple',
  BLUE: 'blue',
  PINK: 'pink'
}

export const colorCN = {
  [COLOUR_SCHEME.RED]: '红色系',
  [COLOUR_SCHEME.GREEN]: '绿色系',
  [COLOUR_SCHEME.GRAY]: '灰色系',
  [COLOUR_SCHEME.YELLOW]: '黄色系',
  [COLOUR_SCHEME.PURPLE]: '紫色系',
  [COLOUR_SCHEME.BLUE]: '蓝色系',
  [COLOUR_SCHEME.PINK]: '粉色系',
}

const baseBackgroundPath = `http://localhost:3000/background_photo/`
const BackGroundDomain = 'https://cloud.cdn-qn.hzmantu.com/background_photo/'
const compressExt = '_compress.png'

const BackgroundMap = [
  {
    md5: '44f63067620f25e579f3d1394a1b90b2',
    name: '秋冬银河蓝',
    url: `${BackGroundDomain}44f63067620f25e579f3d1394a1b90b2.jpg`,
    localPath: `${baseBackgroundPath}44f63067620f25e579f3d1394a1b90b2.jpg`,
    compressPath: `${baseBackgroundPath}44f63067620f25e579f3d1394a1b90b2${compressExt}`,
    colourScheme: COLOUR_SCHEME.BLUE,
    isCommonUse: false
  },
  {
    md5: '7ac0d26c70708789f16d45bc22ef29f5',
    name: '39度灰',
    url: `${BackGroundDomain}7ac0d26c70708789f16d45bc22ef29f5.jpg`,
    localPath: `${baseBackgroundPath}7ac0d26c70708789f16d45bc22ef29f5.jpg`,
    compressPath: `${baseBackgroundPath}7ac0d26c70708789f16d45bc22ef29f5${compressExt}`,
    colourScheme: COLOUR_SCHEME.GRAY,
    isCommonUse: true
  },
  {
    md5: '21bb206f4029c319b65003d1559224fd',
    name: '春夏珊瑚橘',
    url: `${BackGroundDomain}21bb206f4029c319b65003d1559224fd.jpg`,
    localPath: `${baseBackgroundPath}21bb206f4029c319b65003d1559224fd.jpg`,
    compressPath: `${baseBackgroundPath}21bb206f4029c319b65003d1559224fd${compressExt}`,
    colourScheme: COLOUR_SCHEME.YELLOW,
    isCommonUse: false
  },
  {
    md5: '86c172c852007d9e7fd7c2f88d2fd18d',
    name: '薄荷绿',
    url: `${BackGroundDomain}86c172c852007d9e7fd7c2f88d2fd18d.jpg`,
    localPath: `${baseBackgroundPath}86c172c852007d9e7fd7c2f88d2fd18d.jpg`,
    compressPath: `${baseBackgroundPath}86c172c852007d9e7fd7c2f88d2fd18d${compressExt}`,
    colourScheme: COLOUR_SCHEME.GREEN,
    isCommonUse: false
  },
  {
    md5: '7bac824ab219ba7c83b74900ea36dd2c',
    name: '春夏牛油果',
    url: `${BackGroundDomain}7bac824ab219ba7c83b74900ea36dd2c.jpg`,
    localPath: `${baseBackgroundPath}7bac824ab219ba7c83b74900ea36dd2c.jpg`,
    compressPath: `${baseBackgroundPath}7bac824ab219ba7c83b74900ea36dd2c${compressExt}`,
    colourScheme: COLOUR_SCHEME.GREEN,
    isCommonUse: false
  },
  {
    md5: 'aa0f4d3bead6fe7ddbca8c42cd2973ca',
    name: '春夏月灰蓝',
    url: `${BackGroundDomain}aa0f4d3bead6fe7ddbca8c42cd2973ca.jpg`,
    localPath: `${baseBackgroundPath}aa0f4d3bead6fe7ddbca8c42cd2973ca.jpg`,
    compressPath: `${baseBackgroundPath}aa0f4d3bead6fe7ddbca8c42cd2973ca${compressExt}`,
    colourScheme: COLOUR_SCHEME.BLUE,
    isCommonUse: false
  },
  {
    md5: '1643e72ac41e451966f2fbfde5399990',
    name: '大师店渐变粉',
    url: `${BackGroundDomain}1643e72ac41e451966f2fbfde5399990.jpg`,
    localPath: `${baseBackgroundPath}1643e72ac41e451966f2fbfde5399990.jpg`,
    compressPath: `${baseBackgroundPath}1643e72ac41e451966f2fbfde5399990${compressExt}`,
    colourScheme: COLOUR_SCHEME.PINK,
    isCommonUse: false
  },
  {
    md5: '3ff09f5db5a22c27ec8dd465a47f254b',
    name: '鹅黄',
    url: `${BackGroundDomain}3ff09f5db5a22c27ec8dd465a47f254b.jpg`,
    localPath: `${baseBackgroundPath}3ff09f5db5a22c27ec8dd465a47f254b.jpg`,
    compressPath: `${baseBackgroundPath}3ff09f5db5a22c27ec8dd465a47f254b${compressExt}`,
    colourScheme: COLOUR_SCHEME.YELLOW,
    isCommonUse: false
  },
  {
    md5: 'e8033ab7077edbab59e291be1f91e469',
    name: '蓝标粉底',
    url: `${BackGroundDomain}e8033ab7077edbab59e291be1f91e469.jpg`,
    localPath: `${baseBackgroundPath}e8033ab7077edbab59e291be1f91e469.jpg`,
    compressPath: `${baseBackgroundPath}e8033ab7077edbab59e291be1f91e469${compressExt}`,
    colourScheme: COLOUR_SCHEME.PINK,
    isCommonUse: false
  },
  {
    md5: '9a9271972d8549b587480a258656ffd0',
    name: '秋冬浆果红',
    url: `${BackGroundDomain}9a9271972d8549b587480a258656ffd0.jpg`,
    localPath: `${baseBackgroundPath}9a9271972d8549b587480a258656ffd0.jpg`,
    compressPath: `${baseBackgroundPath}9a9271972d8549b587480a258656ffd0${compressExt}`,
    colourScheme: COLOUR_SCHEME.RED,
    isCommonUse: false
  },
  {
    md5: '67b18bde22e65d8703a3e953dcd08f94',
    name: '秋冬焦糖黄',
    url: `${BackGroundDomain}67b18bde22e65d8703a3e953dcd08f94.jpg`,
    localPath: `${baseBackgroundPath}67b18bde22e65d8703a3e953dcd08f94.jpg`,
    compressPath: `${baseBackgroundPath}67b18bde22e65d8703a3e953dcd08f94${compressExt}`,
    colourScheme: COLOUR_SCHEME.YELLOW,
    isCommonUse: false
  },
  {
    md5: 'eb204c67e253f55f1f0603a9da7f3918',
    name: '秋冬暖米白',
    url: `${BackGroundDomain}eb204c67e253f55f1f0603a9da7f3918.jpg`,
    localPath: `${baseBackgroundPath}eb204c67e253f55f1f0603a9da7f3918.jpg`,
    compressPath: `${baseBackgroundPath}eb204c67e253f55f1f0603a9da7f3918${compressExt}`,
    colourScheme: COLOUR_SCHEME.YELLOW,
    isCommonUse: false
  },
  {
    md5: '86cee89b66bcf72b7dd0bd52fc599560',
    name: '水天蓝',
    url: `${BackGroundDomain}86cee89b66bcf72b7dd0bd52fc599560.jpg`,
    localPath: `${baseBackgroundPath}86cee89b66bcf72b7dd0bd52fc599560.jpg`,
    compressPath: `${baseBackgroundPath}86cee89b66bcf72b7dd0bd52fc599560${compressExt}`,
    colourScheme: COLOUR_SCHEME.BLUE,
    isCommonUse: false
  },
  {
    md5: '122de69bddf5dc0ad441a58b786d8bbe',
    name: '芽黄',
    url: `${BackGroundDomain}122de69bddf5dc0ad441a58b786d8bbe.jpg`,
    localPath: `${baseBackgroundPath}122de69bddf5dc0ad441a58b786d8bbe.jpg`,
    compressPath: `${baseBackgroundPath}122de69bddf5dc0ad441a58b786d8bbe${compressExt}`,
    colourScheme: COLOUR_SCHEME.YELLOW,
    isCommonUse: false
  },
  {
    md5: '0df56442105e59186795070a53b10075',
    name: '大师店渐变蓝',
    url: `${BackGroundDomain}0df56442105e59186795070a53b10075.jpg`,
    localPath: `${baseBackgroundPath}0df56442105e59186795070a53b10075.jpg`,
    compressPath: `${baseBackgroundPath}0df56442105e59186795070a53b10075${compressExt}`,
    colourScheme: COLOUR_SCHEME.BLUE,
    isCommonUse: true
  },
  {
    md5: '4a0100e419fac7d5d62674b31ca9a4bc',
    name: '39度渐变灰',
    url: `${BackGroundDomain}4a0100e419fac7d5d62674b31ca9a4bc.jpg`,
    localPath: `${baseBackgroundPath}4a0100e419fac7d5d62674b31ca9a4bc.jpg`,
    compressPath: `${baseBackgroundPath}4a0100e419fac7d5d62674b31ca9a4bc${compressExt}`,
    colourScheme: COLOUR_SCHEME.GRAY,
    isCommonUse: true
  },
  {
    md5: 'aa1aa112be2d38e56a42f3f13503391d',
    name: '纯红',
    url: `${BackGroundDomain}aa1aa112be2d38e56a42f3f13503391d.jpg`,
    localPath: `${baseBackgroundPath}aa1aa112be2d38e56a42f3f13503391d.jpg`,
    compressPath: `${baseBackgroundPath}aa1aa112be2d38e56a42f3f13503391d${compressExt}`,
    colourScheme: COLOUR_SCHEME.RED,
    isCommonUse: true
  },
  {
    md5: 'f425f172971ee8d9874ed87f4345ac1c',
    name: '纯蓝',
    url: `${BackGroundDomain}f425f172971ee8d9874ed87f4345ac1c.jpg`,
    localPath: `${baseBackgroundPath}f425f172971ee8d9874ed87f4345ac1c.jpg`,
    compressPath: `${baseBackgroundPath}f425f172971ee8d9874ed87f4345ac1c${compressExt}`,
    colourScheme: COLOUR_SCHEME.BLUE,
    isCommonUse: true
  },
  {
    md5: '5a074e47686686692589079e00525b25',
    name: '大师渐变灰',
    url: `${BackGroundDomain}5a074e47686686692589079e00525b25.jpg`,
    localPath: `${baseBackgroundPath}5a074e47686686692589079e00525b25.jpg`,
    compressPath: `${baseBackgroundPath}5a074e47686686692589079e00525b25${compressExt}`,
    colourScheme: COLOUR_SCHEME.GRAY,
    isCommonUse: true
  },
  {
    md5: '4ceb0091bf0efcdbd016eea89eec9cdd',
    name: '灰底渐变',
    url: `${BackGroundDomain}4ceb0091bf0efcdbd016eea89eec9cdd.jpg`,
    localPath: `${baseBackgroundPath}4ceb0091bf0efcdbd016eea89eec9cdd.jpg`,
    compressPath: `${baseBackgroundPath}4ceb0091bf0efcdbd016eea89eec9cdd${compressExt}`,
    colourScheme: COLOUR_SCHEME.GRAY,
    isCommonUse: true
  },
  {
    md5: 'f517e60f4c349cf1d69b188ba40aa94a',
    name: '蓝白渐变',
    url: `${BackGroundDomain}f517e60f4c349cf1d69b188ba40aa94a.jpg`,
    localPath: `${baseBackgroundPath}f517e60f4c349cf1d69b188ba40aa94a.jpg`,
    compressPath: `${baseBackgroundPath}f517e60f4c349cf1d69b188ba40aa94a${compressExt}`,
    colourScheme: COLOUR_SCHEME.BLUE,
    isCommonUse: true
  },
  {
    md5: '9f1c57b23188739c5c0656b1e9763b61',
    name: '蓝标店渐变蓝',
    url: `${BackGroundDomain}9f1c57b23188739c5c0656b1e9763b61.jpg`,
    localPath: `${baseBackgroundPath}9f1c57b23188739c5c0656b1e9763b61.jpg`,
    compressPath: `${baseBackgroundPath}9f1c57b23188739c5c0656b1e9763b61${compressExt}`,
    colourScheme: COLOUR_SCHEME.BLUE,
    isCommonUse: true
  },
  {
    md5: 'f33b2b15420bb2d8716989439e4d5ac8',
    name: '普通蓝底',
    url: `${BackGroundDomain}f33b2b15420bb2d8716989439e4d5ac8.jpg`,
    localPath: `${baseBackgroundPath}f33b2b15420bb2d8716989439e4d5ac8.jpg`,
    compressPath: `${baseBackgroundPath}f33b2b15420bb2d8716989439e4d5ac8${compressExt}`,
    colourScheme: COLOUR_SCHEME.BLUE,
    isCommonUse: true
  },
  {
    md5: '9da61634976d53e028b704556b916f1c',
    name: '浅蓝',
    url: `${BackGroundDomain}9da61634976d53e028b704556b916f1c.jpg`,
    localPath: `${baseBackgroundPath}9da61634976d53e028b704556b916f1c.jpg`,
    compressPath: `${baseBackgroundPath}9da61634976d53e028b704556b916f1c${compressExt}`,
    colourScheme: COLOUR_SCHEME.BLUE,
    isCommonUse: true
  },
  {
    md5: '7cb6c7858a386d684dd3d703f4553cd7',
    name: '司法蓝',
    url: `${BackGroundDomain}7cb6c7858a386d684dd3d703f4553cd7.jpg`,
    localPath: `${baseBackgroundPath}7cb6c7858a386d684dd3d703f4553cd7.jpg`,
    compressPath: `${baseBackgroundPath}7cb6c7858a386d684dd3d703f4553cd7${compressExt}`,
    colourScheme: COLOUR_SCHEME.BLUE,
    isCommonUse: true
  },
  {
    md5: '4075bb8b3a1636efaa1635ba724117c8',
    name: 'kids纯灰底色',
    url: `${BackGroundDomain}4075bb8b3a1636efaa1635ba724117c8.jpg`,
    localPath: `${baseBackgroundPath}4075bb8b3a1636efaa1635ba724117c8.jpg`,
    compressPath: `${baseBackgroundPath}4075bb8b3a1636efaa1635ba724117c8${compressExt}`,
    colourScheme: COLOUR_SCHEME.GRAY,
    isCommonUse: true
  },
  {
    md5: 'c394ed3fdc67fd0416c5788fc198cd83',
    name: '薄纱紫',
    url: `${BackGroundDomain}c394ed3fdc67fd0416c5788fc198cd83.jpg`,
    localPath: `${baseBackgroundPath}c394ed3fdc67fd0416c5788fc198cd83.jpg`,
    compressPath: `${baseBackgroundPath}c394ed3fdc67fd0416c5788fc198cd83${compressExt}`,
    colourScheme: COLOUR_SCHEME.PURPLE,
    isCommonUse: false
  },
  {
    md5: '7277767d4eb0276e8475de21c735f894',
    name: '纯白',
    url: `${BackGroundDomain}7277767d4eb0276e8475de21c735f894.png`,
    localPath: `${baseBackgroundPath}7277767d4eb0276e8475de21c735f894.png`,
    compressPath: `${baseBackgroundPath}7277767d4eb0276e8475de21c735f894${compressExt}`,
    colourScheme: COLOUR_SCHEME.GRAY,
    isCommonUse: false
  },
]


export default BackgroundMap
