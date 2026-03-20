# 零碎问题记录

## 视差问题导致 menu hover 抽搐
问题并不是一开始出现，是在发布后去除 body 居中样式并让 .ccm-con 占满全屏后出现的，通过 pointer-events 等方式无法解决，曾经暂时禁用，后来新加一层 div 解决