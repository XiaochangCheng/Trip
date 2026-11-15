# Trip

旅行行程合集，纯静态网页，无需登录。访客只能修改自己的本地完成进度，不能修改公共行程。

## 当前行程

- 南加州五日自驾：2026-11-26 至 2026-11-30，San Diego / Joshua Tree / Palm Springs，共 55 项。
- 按2026-11-14最新清单调整顺序；Torrey Pines四条旧步道资料留在详情中，标明施工期间不安排。
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
- time 为页面显示时间；事项按数组顺序连续显示，不区分上午、下午或晚上。start/end为当地午夜起分钟数，end用于“收起上午行程”（不晚于12 PM结束）；不设上午/下午分组标题。
- notes 为备注数组；destination 为地图目的地，不明确时设为 null。

进度按浏览器保存，不跨设备同步，清理站点数据会清除进度。用户指定时间予以保留，其余时段和车程标注为规划估算；营业及道路情况出发前复核。JFK 出发为纽约时间，加州行程为太平洋时间。

旧地址 `trips/southern-california-2026/` 自动跳转到 `trips/san-deigo/`；日期链接和本地完成记录保留。


## 2026-11-14 行程内容更新

固定安排：11/26 Balboa Park 14:00–15:00；11/27 Gaslamp 17:30后；11/28市场08:00–09:00，Hidden Valley → Skull Rock → Keys View；周六住Joshua Tree Town（酒店未定）；周日仅Cholla后去Palm Springs，缆车15:15–18:15预留3小时；11/30 USS Midway只看外观，22:35 SAN起飞。

其他新时间段和车程为规划估算。每个景点详情默认关闭，展开后显示照片、中文介绍、地址、停车导航和官方来源。点击“展开全部”同时取消隐藏上午/已完成并展开当前日期详情。完成状态的旧存储键保持不变，移动到另一天的同一景点保留id。

新增JSON字段：kind（sight/drive/activity）、description、address、duration、parking数组（name/destination/fee）、details数组、sources数组（label/url）、photos数组（src/alt/credit/source/license/licenseUrl/changes）、next（title/time/mode）。photos和来源独立于展示代码，后续可直接编辑。

信息核对截至2026-11-14：Balboa感恩节停车收费豁免、植物馆城市假日闭馆；Torrey Pines自然保护区施工至2027年2月，海滩仍开放；缆车2026感恩节时段及票价/停车费已查官方。市场11/28是否营业及海胆供应尚未确认；NPS道路动态入口已检查，出发前须再查封闭地图，不能保证旅行日道路开放。

照片许可、来源和缩放说明见 `trips/san-deigo/data/photo-credits.json` 及图片下方署名；市场使用官网远程参考图，可能受外站可用性影响。
