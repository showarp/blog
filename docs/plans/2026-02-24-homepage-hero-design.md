# Homepage Hero Redesign - Design Document

## Overview

将博客首页的欢迎区域改造为占满整个视口的全屏 Hero 区域，用户向下滑动后才能看到文章列表。在欢迎页底部添加简约线条风格的向下箭头，点击后可平滑滚动到文章区域。

## 用户需求

1. 欢迎页占满整个浏览器视口（100vh）
2. 保留现有的 LiquidGradient 动态背景效果
3. 显示文案：
   - "Technical Blog"（eyebrow）
   - "Thoughts on code, design & everything in between."（标题）
   - "Exploring software development, one article at a time."（副标题）
4. 欢迎页底部添加向下箭头
5. 点击箭头后平滑滚动，将欢迎页移出视窗

## 设计方案

### 架构

**修改的文件**：
- `app/HomeClient.tsx` - 添加滚动逻辑和箭头组件
- `app/globals.css` - 添加全屏样式和箭头动画

### 视觉设计

**布局结构**：
```
┌─────────────────────────────────────┐
│  [LiquidGradient 背景]               │
│                                     │
│         Technical Blog              │
│                                     │
│    Thoughts on code,                │
│    design & everything in between.  │
│                                     │
│    Exploring software development,  │
│    one article at a time.           │
│                                     │
│              ↓ (箭头)               │
└─────────────────────────────────────┘
        ▼ 滚动后 ▼
┌─────────────────────────────────────┐
│  [搜索框和过滤器]                    │
│  [文章列表]                         │
└─────────────────────────────────────┘
```

**箭头样式**：
- 简约线条 SVG 图标（无填充）
- 颜色：`var(--accent)`（主题色，暗色主题为 lime green，亮色主题为 blue）
- 尺寸：48x48px
- 位置：欢迎页底部居中，距离底部 40px
- 动画：上下浮动（bounce 动画，2s 循环）

### 交互设计

**滚动行为**：
- 点击箭头 → 调用 `window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })`
- 滚动距离：一个视口高度
- 使用 React 的 `useCallback` 包装滚动函数

### CSS 样式

```css
/* 全屏 Hero 区域 */
.home-hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* 向下箭头 */
.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  animation: bounce 2s infinite;
}

.scroll-indicator svg {
  width: 48px;
  height: 48px;
  stroke: var(--accent);
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(8px); }
}
```

### 组件结构

```
HomeClient
├── Hero Section (min-height: 100vh)
│   ├── Hero Content
│   │   ├── Eyebrow text
│   │   ├── Title
│   │   └── Subtitle
│   └── Scroll Indicator (↓)
└── Filters & Posts Section
    ├── Search input
    ├── Tag filters
    ├── Category filters
    └── Posts grid
```

## 技术决策

1. **使用 React 方案而非纯 CSS** - 用户选择，更精确的滚动控制
2. **保持动态背景** - 用户确认保留 LiquidGradient 效果
3. **简约线条箭头** - 符合博客的 brutalist 设计风格
4. **滚动距离 = window.innerHeight** - 简单直接，将欢迎页完全移出视窗

## 验收标准

1. [ ] 欢迎页占满整个浏览器视口（100vh）
2. [ ] LiquidGradient 背景正常工作
3. [ ] 向下箭头位于欢迎页底部居中位置
4. [ ] 箭头有上下浮动动画
5. [ ] 点击箭头后平滑滚动到文章区域
6. [ ] 主题切换时箭头颜色正确响应
