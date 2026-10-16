# 腾讯云部署副本

这个入口保留原作品集页面和交互，使用静态文件加 Nginx 部署。
原 Cloudflare/Vinext 构建入口保持不变，腾讯云服务器无需安装 Node.js。

## 构建和更新

开发电脑需要符合 package.json 要求的 Node.js 和已安装的依赖：

```sh
npm run build:tencent
```

完整输出在 `dist-tencent/`。提交发布文件时，只将生成的 `index.html`
和 `assets/` 放入 `deploy/tencent/site/`；图片、视频沿用仓库 `public/`。
不要把 node_modules、整个 dist 或托管平台私有配置上传到网站根目录。
安装脚本把两部分组合到独立目录 `/var/www/4ndras-preview`。

## 备案前的内部验证

1. 下载并解压经过核对的固定 GitHub 提交版本。
2. 检查 `install-preview.sh` 和 `portfolio-preview.conf`。
3. 在仓库目录执行 `sudo bash deploy/tencent/install-preview.sh`。
4. 从服务器终端请求 `http://127.0.0.1:8080/`，确认 HTTP 200。

此配置仅监听回环地址，不开放公网作品集访问，不修改 DNS 和防火墙，
不覆盖系统默认站点。已有任何同名部署目录或配置时，脚本会停止，
以免覆盖文件。若 Nginx 检查失败，不会执行 reload，请先解决错误。

## 正式上线

目前尚未完成正式上线：须先确认 ICP 备案通过，再单独配置域名、
HTTPS、访问规则，以及页面备案号。不要只把回环监听地址改为公网。
服务器内网测试通过，不等于已经能从手机或公网访问。

当前图片保留原质量，未做体积压缩，3Mbps 带宽下仍需后续加载优化。
