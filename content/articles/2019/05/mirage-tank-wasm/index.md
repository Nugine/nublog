---
postDate: "2019-05-25"
editDate: "2019-05-26"
links:
    知乎: https://zhuanlan.zhihu.com/p/66954892
---

# 幻影坦克与 WASM

在QQ聊天中有时会遇到一种神奇的图片，看起来是一张图，打开一看是另一张图，我们称这种图片为“幻影坦克”。

于是我产生了一个想法，如果能实现自动合成“幻影坦克”，为什么不把它做成一个WASM应用呢？

在本系列文章中，我将使用`Rust`与`TypeScript`逐步实现幻影坦克制作工具，最终以静态单页应用的形式发布。

## 理论基础

[幻影坦克架构指南（一）](https://zhuanlan.zhihu.com/p/31164700)

[幻影坦克架构指南（二）](https://zhuanlan.zhihu.com/p/31191377)

[幻影坦克架构指南（三）](https://zhuanlan.zhihu.com/p/32532733)

[棋盘格与幻影坦克](https://zhuanlan.zhihu.com/p/33148445)

感谢作者 ElPsyConGree，以上文章讲解得很清楚。

事实上，幻影坦克没有那么神秘，只需要将两张图片按简单的公式计算，合成一张新的图片就行了。

## 架构设计

底层： 通用算法库，实现算法，暴露一个通用的抽象，这样可以同时给binary和wasm使用。

绑定：将Rust数据结构导出为js风格的对象，便于操作。

应用：使用html实现界面，js调用wasm进行计算。

## 算法库

基础图像处理库：[image-rs/image](https://github.com/image-rs/image)

首先，虽然这是一个接收两张图片，输出一张图片的纯函数，但用Rust特色的面向对象范式来写会比较舒服。

用一个结构体来存储输入的两张图片。

```rust
pub struct MirageTank {
    wimage: DynamicImage,
    bimage: DynamicImage,
}
```

定义两个构造函数，`new`直接由结构体内字段构造，`from_raw`从内存中载入图片，让wasm调用时减少数据复制。

```rust
impl MirageTank {
    #[inline]
    pub fn new(wimage: DynamicImage, bimage: DynamicImage) -> Self {
        Self { wimage, bimage }
    }

    pub fn from_raw(wbuffer: &[u8], bbuffer: &[u8]) -> ImageResult<Self> {
        let wimage = load_from_memory(wbuffer)?;
        let bimage = load_from_memory(bbuffer)?;
        Ok(Self { wimage, bimage })
    }
}
```

直接实现处理算法。

```rust
impl MirageTank {
    pub fn grey_output(
        &self,
        width: u32,
        height: u32,
        checkerboarded: bool,
        wlight: f32,
        blight: f32,
    ) -> RgbaImage { ... }

    pub fn colorful_output(
        &self,
        width: u32,
        height: u32,
        checkerboarded: bool,
        wlight: f32,
        blight: f32,
        wcolor: f32,
        bcolor: f32,
    ) -> RgbaImage { ... }
}
```

看起来几步就写完了，实际上需要阅读算法理论，借鉴已有的实现，考虑如何尽量减少数据复制，精简API。如果这一步没有做好，在往高层应用走的时候会经常返工。

想要阅读完整代码，请移步GitHub仓库：[Nugine/mirage-tank](https://github.com/Nugine/mirage-tank)

---

上次完成了算法库，这次到绑定库了。绑定库沟通Rust与JS，做好数据传输与转换。某些时候也可以直接在这一层实现算法，省得分库。

## 参考链接

<https://rustwasm.github.io/book/game-of-life/setup.html>

<https://rustwasm.github.io/docs/wasm-bindgen/introduction.html>

## 初始化

安装完`wasm-pack`和`cargo-generate`后，用项目模板初始化。

```bash
cargo generate --git https://github.com/rustwasm/wasm-pack-template
```

输入项目名称，一键完成初始化。

## 对象定义

使用 New Type 模式包装算法库提供的结构，`wasm_bindgen`会导出一个对应的JS对象。
```rust
#[wasm_bindgen]
pub struct MirageTank {
    inner: mirage_tank::MirageTank,
}
```

但要注意的是，这个JS对象只是wasm内存数据在js内存中的“投影”，js对象中只有指向wasm内存空间的指针。如果wasm内存中的真实数据被`drop`了，那么在js对象上调用方法会产生“空指针”异常。反过来，如果js对象被回收了，wasm内存数据将不会受到影响。

## 构造函数

定义构造函数。这里通过js传入`Uint8Array`，将数据复制到wasm内存空间，然后执行Rust结构体的初始化。

`wasm_bindgen`自动生成了复制函数，将复制好的数据的引用传入`from_raw`。初始化完成后，传入的数据被释放，而初始化过程中还存在数据复制，所以这里执行了两轮数据复制。

如果载入失败，构造函数将会抛出异常，异常类型是js字符串。

```rust
#[wasm_bindgen]
impl MirageTank {
    #[wasm_bindgen(constructor)]
    pub fn from_raw(wbuf: &[u8], bbuf: &[u8]) -> Result<MirageTank, JsValue> {
        let inner = mirage_tank::MirageTank::from_raw(wbuf, bbuf)
            .map_err::<JsValue, _>(|_| "fail to load image".into())?;
        Ok(Self { inner })
    }
```

## getter

写到后面发现获取图像尺寸不怎么方便，于是在算法库中加入了几个getter，这里对应导出。

```rust
    #[wasm_bindgen(getter)]
    pub fn wimage_width(&self) -> u32 {
        self.inner.wimage_size().0
    }

    #[wasm_bindgen(getter)]
    pub fn wimage_height(&self) -> u32 {
        self.inner.wimage_size().1
    }

    #[wasm_bindgen(getter)]
    pub fn bimage_width(&self) -> u32 {
        self.inner.bimage_size().0
    }

    #[wasm_bindgen(getter)]
    pub fn bimage_height(&self) -> u32 {
        self.inner.bimage_size().1
    }
}
```

## 导出功能

关于参数的校验应该放在哪里的问题，这个见仁见智。我倾向于把它放在算法库外面。

当Rust返回 `Box<[u8]>` 时，`wasm_bindgen` 的做法是将数据复制到 js 空间，然后释放 wasm 空间的数据。其实可以做到用 js读取wasm 空间，减少一次复制，但所有权和释放时机的问题都要手动操作，比较麻烦。

```rust

#[inline]
pub(crate) fn is_param(p: f32) -> bool {
    p.is_normal() && p >= 0.0 && p <= 1.0
}

#[wasm_bindgen]
impl MirageTank {
    pub fn grey_output(
        &self,
        width: u32,
        height: u32,
        checkerboarded: bool,
        wlight: f32,
        blight: f32,
    ) -> Result<Box<[u8]>, JsValue> {
        if !is_param(wlight) || !is_param(blight) {
            return Err("invalid parameter".into());
        }

        let output = self
            .inner
            .grey_output(width, height, checkerboarded, wlight, blight);
        Ok(output.into_raw().into_boxed_slice())
    }

    pub fn colorful_output(
        &self,
        width: u32,
        height: u32,
        checkerboarded: bool,
        wlight: f32,
        blight: f32,
        wcolor: f32,
        bcolor: f32,
    ) -> Result<Box<[u8]>, JsValue> {
        if ![wlight, blight, wcolor, bcolor]
            .into_iter()
            .all(|&p| is_param(p))
        {
            return Err("invalid parameter".into());
        }
        let output = self.inner.colorful_output(
            width,
            height,
            checkerboarded,
            wlight,
            blight,
            wcolor,
            bcolor,
        );
        Ok(output.into_raw().into_boxed_slice())
    }
}
```

## 构建

```bash
wasm-pack build
```


## 总结

借助 `wasm_bindgen`，绑定库写起来非常容易，还能生成对应的`TypeScript`声明文件。但有时会增加数据在js和wasm之间的来回复制，有可能影响性能。

除此以外，还需要对wasm内存模型有所了解。js里面没有所有权的概念，使用js调度wasm对象有时会产生js中不存在的诡异错误。

想要阅读完整代码，请移步GitHub仓库：[Nugine/mirage-tank-wasm-binding](https://github.com/Nugine/mirage-tank-wasm-binding)

---

这是本系列的最终章，使用wasm作为核心，构建静态单页应用。

前篇：[幻影坦克与WASM (二)](https://zhuanlan.zhihu.com/p/67009146)


## 初始化

```bash
npm init wasm-app ./
```

修改`package.json`，删去多余信息。

```bash
npm install
npm start
```

打开`localhost:8080`，正常的话，网页会弹出hello提示。

## 启用 TypeScript

```bash
npm install -D typescript tslint ts-loader
```

在`webpack.config.js`中写入配置

```javascript
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.wasm']
  },
```

`index.js`重命名为`index.ts`，`bootstrap.js`中的导入语句做相应修改。

`tsconfig.json`和`tslint.json`按自己喜好配置。

## 链接绑定库

如果不想把绑定库发布到npm上，可以使用`npm link`。

在绑定库文件夹中执行：
```bash
wasm-pack build
cd pkg
npm link
```

在应用文件夹中执行：
```bash
npm link mirage-tank-wasm-binding
```

此时绑定库生成的wasm模块已经可以包含到构建过程中了。

## 实现界面逻辑

关键代码

```typescript
const render = async () => {
    if (!state.mt) { return }

    const width = parseInt(widthInput.value, 10)
    const height = parseInt(heightInput.value, 10)
    const checkerboarded = checkerboardCheckbox.checked
    const isColorful = colorfulCheckbox.checked
    const wlight = parseFloat(foregroundLightInput.value)
    const blight = parseFloat(backgroundLightInput.value)
    const wcolor = parseFloat(foregroundColorInput.value)
    const bcolor = parseFloat(backgroundColorInput.value)

    let imageBuf
    if (isColorful) {
        imageBuf = state.mt.colorful_output(width, height, checkerboarded, wlight, blight, wcolor, bcolor)
    } else {
        imageBuf = state.mt.grey_output(width, height, checkerboarded, wlight, blight)
    }

    const data = imageEncode(imageBuf, 'png', { width, height })
    const urlBlob = URL.createObjectURL(new Blob([data]))

    outputImg.src = urlBlob
    downloadAnchor.href = urlBlob
}
```

使用wasm完成关键计算，将结果编码为png格式，下载链接指向Blob。

在js中不需要考虑对象的生命周期，但操作wasm时不能忘记释放对象，否则wasm内存很快会不够用。

```typescript
if (state.mt) { state.mt.free(); state.mt = undefined }
```

## 最终成品

应用地址：
<https://nugine.github.io/mirage-tank-wasm-app/>

GitHub仓库：[Nugine/mirage-tank-wasm-app](https://github.com/Nugine/mirage-tank-wasm-app)
