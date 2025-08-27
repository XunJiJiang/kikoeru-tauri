// save as scripts/gen-tauri-resources.js
const fs = require('fs');
const path = require('path');

const osMap = {
  darwin: 'mac',
  win32: 'win',
  linux: 'linux',
};

const currentOS = osMap[process.platform];
if (!currentOS) {
  console.error('不支持的操作系统:', process.platform);
  process.exit(1);
}

const configPath = path.resolve(__dirname, '../src-tauri/tauri.conf.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const allResources = {
  mac: ['resources/mac/node_sqlite3.node', 'resources/mac/kikoeru-express'],
  win: ['resources/win/node_sqlite3.node', 'resources/win/kikoeru-express.exe'],
  linux: ['resources/linux/node_sqlite3.node', 'resources/linux/kikoeru-express'],
};

const selected = {};
const externalBin = [];
for (const file of allResources[currentOS]) {
  selected[file] = file;
  // 只将可执行文件加入 externalBin
  // if (file.endsWith('kikoeru-express') || file.endsWith('kikoeru-express.exe')) {
  //   externalBin.push(file);
  //   // 额外添加 target triple 软链接文件
  //   const archMap = { arm64: 'aarch64', x64: 'x86_64' };
  //   const platformTriple = {
  //     mac: { aarch64: 'aarch64-apple-darwin', x86_64: 'x86_64-apple-darwin' },
  //     win: { x86_64: 'x86_64-pc-windows-msvc' },
  //     linux: { aarch64: 'aarch64-unknown-linux-gnu', x86_64: 'x86_64-unknown-linux-gnu' },
  //   };
  //   const osArch = process.arch;
  //   const arch = archMap[osArch];
  //   const triple = platformTriple[currentOS]?.[arch];
  //   if (arch && triple) {
  //     let ext = '';
  //     if (currentOS === 'win') ext = '.exe';
  //     const tripleName = `resources/${currentOS}/kikoeru-express-${triple}${ext}`;
  //     selected[tripleName] = tripleName;
  //   }
  // }
}

config.bundle = config.bundle || {};
config.bundle.resources = selected;
config.bundle.externalBin = externalBin;

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('已根据当前系统更新 tauri.conf.json 的 resources 和 externalBin 字段:', selected, externalBin);

// === 创建软链接 ===
// const archMap = {
//   arm64: 'aarch64',
//   x64: 'x86_64',
// };

// const platformTriple = {
//   mac: {
//     aarch64: 'aarch64-apple-darwin',
//     x86_64: 'x86_64-apple-darwin',
//   },
//   win: {
//     x86_64: 'x86_64-pc-windows-msvc',
//   },
//   linux: {
//     aarch64: 'aarch64-unknown-linux-gnu',
//     x86_64: 'x86_64-unknown-linux-gnu',
//   },
// };

// const osArch = process.arch;
// const arch = archMap[osArch];
// if (!arch) {
//   console.warn('未知架构:', osArch, '，跳过软链接创建');
// } else {
//   const triple = platformTriple[currentOS]?.[arch];
//   if (!triple) {
//     console.warn('未找到对应 target triple:', currentOS, arch, '，跳过软链接创建');
//   } else {
//     const resourceDir = path.resolve(__dirname, `../src-tauri/resources/${currentOS}`);
//     let ext = '';
//     if (currentOS === 'win') ext = '.exe';
//     const tripleName = `kikoeru-express-${triple}${ext}`;
//     const triplePath = path.join(resourceDir, tripleName);
//     const legacyName = `kikoeru-express${ext}`;
//     const legacyPath = path.join(resourceDir, legacyName);
//     // 保留原始文件，创建 target triple 命名的软链接
//     if (!fs.existsSync(legacyPath)) {
//       console.warn(`未找到原始可执行文件: ${legacyName}`);
//     } else {
//       if (!fs.existsSync(triplePath)) {
//         try {
//           fs.symlinkSync(legacyName, triplePath);
//           console.log(`已为 ${tripleName} 创建软链接，指向 ${legacyName}`);
//         } catch (e) {
//           console.error(`创建软链接失败: ${e}`);
//         }
//       } else {
//         // 如果 triplePath 存在且不是软链接，提示
//         const stat = fs.lstatSync(triplePath);
//         if (!stat.isSymbolicLink()) {
//           console.warn(`${tripleName} 已存在且不是软链接，请手动处理。`);
//         }
//       }
//     }
//   }
// }
