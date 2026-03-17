重温 ts 初始化：
```pwsh
pnpm init -y
pnpm i typescript -D
npx tsc --init
```

这默认 tsconfig.json 现在这个好简洁不像之前全部列出来

---

## CCM 这几个视觉效果是怎么实现的

下面这部分是针对当前 demo 里已经加上的几个效果做拆解，主要看 [ts/styles/ccm.scss](../../ts/styles/ccm.scss) 和 [demo.html](../../demo.html) 这两处。

### 1. center 的动态背景光晕

目标：让中间按钮不是一块静态底色，而是有一点“活”的流动感，但又不能像 loading 特效那样喧宾夺主。

实现方法：

1. 在 `.ccm-center` 上使用 `::before` 伪元素，单独放一层比本体大很多的背景画布。
2. 这层背景不是图片，而是几层 `radial-gradient(...)` 叠加出来的彩色光斑。
3. 再给这层伪元素加 `rotate(...) + scale(...)` 的 keyframes，让光斑缓慢旋转和呼吸。

核心思路大概是这样：

```scss
.ccm-center {
	position: relative;
	overflow: hidden;

	&::before {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		width: 260%;
		height: 260%;
		background:
			radial-gradient(circle at 22% 32%, hsl(194 90% 68% / 0.45) 0%, transparent 45%),
			radial-gradient(circle at 78% 72%, hsl(328 95% 68% / 0.35) 0%, transparent 40%),
			radial-gradient(circle at 50% 50%, hsl(42 95% 72% / 0.25) 0%, transparent 56%);
		transform: translate(-50%, -50%);
		animation: ccm-center-aurora 13s linear infinite;
	}
}
```

为什么伪元素要做这么大：

因为它会旋转。如果只做和本体差不多大，旋转到对角线方向时很容易露出底色。现在把画布做成 `260%`，并且固定以中心点旋转，基本就不会出现“没填满”的问题。

对应动画：

```scss
@keyframes ccm-center-aurora {
	0% {
		transform: translate(-50%, -50%) rotate(0deg) scale(1);
	}

	50% {
		transform: translate(-50%, -50%) rotate(180deg) scale(1.08);
	}

	100% {
		transform: translate(-50%, -50%) rotate(360deg) scale(1);
	}
}
```

注意点：

- `translate(-50%, -50%)` 必须写进动画每一帧里，不然浏览器会用 keyframes 的 `transform` 覆盖掉初始定位。
- `overflow: hidden` 用来裁掉超出 center 盒子的光斑画布，只保留边界内的部分。

### 2. center 上面的扫光

目标：让 center 看起来更像玻璃或抛光材质，而不是一块纯色卡片。

实现方法：

1. 再用一个 `::after` 伪元素。
2. 给它一条斜着的半透明线性渐变。
3. 让它从左边滑到右边，形成偶尔扫过的高光。

核心代码：

```scss
&::after {
	content: "";
	position: absolute;
	inset: 0;
	opacity: 0.22;
	background: linear-gradient(
		115deg,
		transparent 22%,
		rgb(255 255 255 / 0.85) 49%,
		transparent 78%
	);
	transform: translateX(-120%);
	animation: ccm-center-sheen 7s ease-in-out infinite;
}
```

这个效果本质上不是“发光”，而是“高光反射”，所以透明度不能太高，不然会显得廉价。

### 3. 整个组件的鼠标视差和 3D 倾斜

目标：让组件随着鼠标位置产生一点空间感，像漂浮在页面上，而不是死板地贴在屏幕上。

实现分两步：

#### 第一步：CSS 先预留变量

在 `.ccm-con` 上定义几个 CSS 自定义属性：

```scss
.ccm-con {
	--ccm-parallax-x: 0px;
	--ccm-parallax-y: 0px;
	--ccm-tilt-x: 0deg;
	--ccm-tilt-y: 0deg;
	transform-style: preserve-3d;
	transform: perspective(900px) rotateX(var(--ccm-tilt-y)) rotateY(var(--ccm-tilt-x));
}
```

这一步的意思是：

- `--ccm-parallax-x/y` 用来存鼠标偏移量。
- `--ccm-tilt-x/y` 用来存容器当前的倾斜角度。
- `perspective(900px)` 提供透视感，没有这个，`rotateX/rotateY` 看起来会很平。

#### 第二步：JS 根据鼠标实时写变量

在 [demo.html](../../demo.html) 里监听 `pointermove`：

```html
<script>
	(() => {
		const ccm = document.getElementById('ccm-con');
		if (!ccm) return;

		const update = (event) => {
			const rect = ccm.getBoundingClientRect();
			const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
			const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

			ccm.style.setProperty('--ccm-parallax-x', `${(nx * 24).toFixed(2)}px`);
			ccm.style.setProperty('--ccm-parallax-y', `${(ny * 24).toFixed(2)}px`);
			ccm.style.setProperty('--ccm-tilt-x', `${(nx * 5).toFixed(2)}deg`);
			ccm.style.setProperty('--ccm-tilt-y', `${(-ny * 4).toFixed(2)}deg`);
		};
	})();
</script>
```

这里先把鼠标位置归一化到 `-1 ~ 1`，再映射成像素和角度。这样组件不管大小怎么变化，交互手感都比较稳定。

### 4. center 自己也跟着做一点反向漂移

只有整个组件倾斜还不够，中心块如果完全不动，空间层次会弱一些。

所以 `.ccm-center` 又单独用了一个轻量 `translate3d(...)`：

```scss
.ccm-center {
	transform: translate3d(
		calc(var(--ccm-parallax-x) * -0.08),
		calc(var(--ccm-parallax-y) * -0.08),
		0
	);
}
```

这里用了一个负号，意思是中心块会和鼠标方向做一点反向位移，看起来更像“镜头在动”，而不是元素被鼠标硬拽着走。

系数为什么是 `0.08`：

- 太小，看不出来。
- 太大，会有晕和飘的感觉。
- `0.08` 这种量级比较克制，只是增加层次，不会破坏主交互。

### 6. 为什么这里大量使用 CSS 变量

这个组件天然适合用 CSS 变量，因为它有很多“同结构，不同参数”的 item：

- 每个 item 的旋转角度不同
- x/y 偏移不同
- hover 外推距离不同
- 字号、颜色、背景也可能不同

如果这些都写死成类名，类会非常多；如果都写在 JS 里，又会让样式逻辑分散。现在这种做法的好处是：结构统一，参数开放。

### 7. 为什么还要照顾 `prefers-reduced-motion`

视差、旋转、扫光这些效果很容易“好看”，但也很容易让一部分用户不舒服。

所以最后做了一个降级：

```scss
@media (prefers-reduced-motion: reduce) {
	.ccm-con {
		transform: none;
		transition: none;

		.ccm-center {
			transform: none;

			&::before,
			&::after {
				animation: none;
			}
		}
	}
}
```

这类动效最好都留一个“关掉”的出口。不是可选项，是成熟组件应该有的基本面。

### 8. 这一套效果的设计思路

这次不是简单地“多加点动画”，而是把动效拆成了三层：

1. 大层：整个组件的 3D 倾斜，提供空间感。
2. 中层：center 的 aurora 和 sheen，提供材质感。
3. 小层：menu item 悬浮外推，提供交互反馈。

这样做的好处是每层职责都不一样：

- 倾斜负责“活起来”
- 背景负责“有质感”
- hover 负责“可操作”

如果把所有注意力都堆在某一层，比如让按钮疯狂缩放、疯狂发光，短时间看会很炸，但很快就会显得俗。分层控制，整体会更耐看。

### 9. 后面还能继续优化什么

如果后面继续做，可以往这几个方向走：

1. 把 center 的旋转 aurora 改成“渐变锚点漂移”，会比整张画布旋转更细腻。
2. 把 demo 里的内联 style 参数抽成配置对象，然后由 JS/TS 自动写入 CSS 变量。
3. 给不同方向的 item 设置不同的 `transform-origin`，让 hover 放大更像从中心“长出来”。
4. 给深色和浅色主题拆两套更稳定的色板，不要只靠单个 item 的临时背景色撑效果。

如果后面你想，我可以再在 `project/learn` 里补一篇“如何把 demo 里的视觉参数收敛成组件配置项”的说明，把这些变量正式整理进 TS 配置结构。