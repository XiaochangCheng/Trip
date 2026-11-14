# Trip

旅行行程合集，纯静态网页，无需登录。访客只能修改自己的本地完成进度，不能修改公共行程。

## 当前行程

- 南加州五日自驾：2026-11-26 至 2026-11-30，San Diego / Joshua Tree / Palm Springs，共 54 项。
- 保留完整时间、备注和 Torrey Pines 四条步道资料。
- 支持日期 tabs、Google Maps 导航、勾选完成、收起已完成事项、本地保存。

## 文件结构

```text
index.html / app.js / styles.css    简洁的行程目录
 data/trips.json                    目录中的旅行列表
trips/san-deigo/
  index.html / app.js / styles.css  本次旅行页面
  data/itinerary.json               本次完整行程数据
.github/workflows/pages.yml         推送 main 后自动发布
```

## 本地使用

在仓库根目录运行 `python3 -m http.server 8765 --bind 127.0.0.1`，访问 http://127.0.0.1:8765 。勿直接双击 HTML，页面需要通过 HTTP 加载 JSON。

## GitHub Pages

目前仓库为私有，尚未启用或部署 Pages。私有仓库使用 Pages 取决于 GitHub 套餐；如需改为公开仓库，应由仓库拥有者明确决定。

启用时进入仓库 Settings → Pages，将 Source 设为 GitHub Actions；再到 Settings → Secrets and variables → Actions → Variables 新建仓库变量 `PAGES_ENABLED`，值为 `true`。然后推送 main，或在 Actions 手动运行 Publish travel itinerary。未设置此变量时发布任务自动跳过，避免尚未配置 Pages 时产生失败。部署成功的网址以 GitHub 返回结果为准，预计主页为 https://xiaochangcheng.github.io/Trip/ 。仓库上传和网站部署是两个独立步骤，只有部署任务成功才代表网站已上线。

配置只发布 index.html、app.js、styles.css、data 和 trips。参考 [GitHub Pages 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 日后修改与添加城市

在有仓库写权限的 ChatGPT/Codex 会话中说明修改要求及仓库 XiaochangCheng/Trip。修改提交到 main 后自动更新；PR 则合并后更新。普通聊天不会自动修改 GitHub。

- 修改已有旅行：编辑对应 `trips/<旅行名称>/data/itinerary.json`。
- 新增城市：复制现有旅行目录为新目录，更新行程 JSON、页面标题和文案；将新目录的 app.js 中 KEY 改为独立键名，避免完成状态与其他旅行冲突。
- 在 `data/trips.json` 添加新旅行的 title、route、dates 和相对 url，首页自动显示。
- 事项 id 必须唯一且稳定，调整时间或文案不要修改 id。新增活动使用新 id。
- time 为原文展示；事项按数组顺序连续显示，不区分上午、下午或晚上。start/end 和 period 为历史数据字段，不影响显示。
- notes 为备注数组；destination 为地图目的地，不明确时设为 null。

进度按浏览器保存，不跨设备同步，清理站点数据会清除进度。时间及待确认的营业、交通信息按原行程保留。JFK 出发为纽约时间，加州行程为太平洋时间。

旧地址 `trips/southern-california-2026/` 自动跳转到 `trips/san-deigo/`；日期链接和本地完成记录保留。
