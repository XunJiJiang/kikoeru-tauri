import { Command } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';
import { resourceDir, join } from '@tauri-apps/api/path';
import { copyFile } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';

// 启动服务
let platform = '';
if (navigator.userAgentData && navigator.userAgentData.platform) {
  platform = navigator.userAgentData.platform.toLowerCase();
} else {
  platform = navigator.userAgent.toLowerCase();
}

const openNewWindowButton = document.querySelector('#open-new-window');

const restartServiceButton = document.querySelector('#restart-service');

const outputElement = document.querySelector('#output');

openNewWindowButton.disabled = true;

let id = 0;
let localhostWebsite = '';
let cmd;

openNewWindowButton.onclick = () => {
  if (localhostWebsite) {
    invoke('open_new_window', { label: `main-${id++}`, url: localhostWebsite });
  }
};

async function restartService() {
  try {
    if (cmd && (await cmd).kill) {
      (await cmd).kill();
    }
    cmd = runKikoeruService();
    localhostWebsite = '';
    openNewWindowButton.disabled = true;
    outputElement.innerHTML = '';
  } catch (e) {
    console.error(`Service process failed to start: ${e}`);
  }
}

restartServiceButton.onclick = restartService;

cmd = runKikoeruService();

cmd.catch(e => {
  console.error(`Service process failed to start: ${e}`);
});

async function runKikoeruService() {
  const _resourceDir = await resourceDir();
  try {
    const execPath = await join(
      _resourceDir,
      'resources',
      platform.includes('win') ? 'win' : platform.includes('mac') ? 'mac' : 'linux',
      `kikoeru-express${platform.includes('win') ? '.exe' : ''}`
    );
    const cmd = Command.create('exec-sh', ['-c', execPath], {
      // cwd: await join(
      //   _resourceDir,
      //   'resources',
      //   platform.includes('win') ? 'win' : platform.includes('mac') ? 'mac' : 'linux'
      // ),
      env: {
        LANG: 'zh_CN.UTF-8',
        LC_ALL: 'zh_CN.UTF-8',
      },
      encoding: 'raw',
    });

    let output = '';

    cmd.stdout.on('data', _chunk => {
      const chunk = new Uint8Array(_chunk);
      const str = new TextDecoder('utf-8').decode(chunk);

      output += str;
      const match = str.match(/(https?:\/\/[^\s]+)/);
      if (match && match[1]) {
        const url = match[1];
        outputElement.innerHTML += str.replace(/(https?:\/\/[^\s]+)/, `<a href="${url}" target="_blank">${url}</a>`);

        if (url.includes('localhost')) {
          localhostWebsite = url;
          openNewWindowButton.disabled = false;
        }
      } else {
        outputElement.innerHTML += str;
      }
    });

    cmd.stderr.on('data', _chunk => {
      const chunk = new Uint8Array(_chunk);
      const str = new TextDecoder('utf-8').decode(chunk);

      outputElement.textContent += str;
      output += str;
    });

    cmd.on('close', () => {});
    cmd.on('error', err => {
      console.error(`Service process error: ${err}`);
    });

    const child = cmd.spawn();

    child.catch(e => {
      console.error(`Service process failed to start: ${e}`);
    });

    return child;
  } catch (err) {
    console.error(err);
  }
}

// 配置和数据库导入导出
const importConfigButton = document.querySelector('#import-config');
const exportConfigButton = document.querySelector('#export-config');

importConfigButton.onclick = async () => {
  try {
    const _resourceDir = await resourceDir();
    const dataPath = await join(
      _resourceDir,
      'resources',
      platform.includes('win') ? 'win' : platform.includes('mac') ? 'mac' : 'linux'
    );
    const result = await open({
      title: 'Choose Import Files',
      filters: [
        {
          name: 'Config Files',
          extensions: ['json'],
        },
        {
          name: 'Database Files',
          extensions: ['sqlite3'],
        },
      ],
      multiple: true,
    });
    let firstConfigFile = '';
    let firstDatabaseFile = '';
    for (const filePath of result ?? []) {
      if (filePath.endsWith('.json') && firstConfigFile === '') {
        firstConfigFile = filePath;
      } else if (filePath.endsWith('.sqlite3') && firstDatabaseFile === '') {
        firstDatabaseFile = filePath;
      } else if (firstConfigFile !== '' && firstDatabaseFile !== '') {
        break;
      }
    }
    if (firstConfigFile) {
      await copyFile(firstConfigFile, await join(dataPath, 'config', 'config.json'));
    }
    if (firstDatabaseFile) {
      await copyFile(firstDatabaseFile, await join(dataPath, 'sqlite', 'db.sqlite3'));
    }
    if (firstConfigFile || firstDatabaseFile) {
      await restartService();
    }
  } catch (e) {
    console.error(`Failed to import config: ${e}`);
  }
};

exportConfigButton.onclick = async () => {
  try {
    const _resourceDir = await resourceDir();
    const dataPath = await join(
      _resourceDir,
      'resources',
      platform.includes('win') ? 'win' : platform.includes('mac') ? 'mac' : 'linux'
    );
    const result = await open({
      title: 'Choose Export Location',
      directory: true,
      multiple: false,
    });
    if (result) {
      await copyFile(await join(dataPath, 'config', 'config.json'), await join(result, 'config.json'));
      await copyFile(await join(dataPath, 'sqlite', 'db.sqlite3'), await join(result, 'db.sqlite3'));
    }
  } catch (e) {
    console.error(`Failed to export config: ${e}`);
  }
};
