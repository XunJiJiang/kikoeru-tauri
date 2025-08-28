
# kikoeru-tauri

本项目是将[kikoeru](https://github.com/XunJiJiang/kikoeru) 包装为桌面应用程序的 Tauri 项目。

## 相关项目

- 后端：[kikoeru-express](https://github.com/XunJiJiang/kikoeru-express)
- 前端：[kikoeru-quasar](https://github.com/XunJiJiang/kikoeru-quasar)

## 下载

- [下载](https://github.com/XunJiJiang/kikoeru-tauri/releases)

## 构建

将[相关项目](#相关项目)和此项目共三个项目下载并放到同一目录下，保持如下命名：

```tree
your-workspace/
├── kikoeru-express
├── kikoeru-quasar
└── kikoeru-tauri
```

进入 `kikoeru-express` 目录，安装依赖并构建（建议 Node 版本 12-14）：

```sh
cd kikoeru-express
npm install
npm run build:tauri
```

进入 `kikoeru-tauri` 目录，安装依赖并构建（建议 Node 20+ 或 bun）：

```sh
cd ../kikoeru-tauri
bun install
bun tauri build
```

## TODO

- [x] 重启服务
- [x] 数据库和配置文件的导入和导出

## 声明

本项目作为开源软件，本身不包含任何版权内容或其它违反法律的内容。项目中的程序是为了个人用户管理自己所有的合法数据资料而设计的。  
程序作者并不能防止内容提供商（如各类网站）或其它用户使用本程序提供侵权或其它非法内容。程序作者与使用本程序的各类内容提供商并无联系，不为其提供技术支持，也不为其不当使用承担法律责任。

## 许可协议

GNU General Public License v3.0
