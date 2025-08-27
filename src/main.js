import { Command } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';
import { resourceDir, join } from '@tauri-apps/api/path';

try {
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
  restartServiceButton.onclick = async () => {
    if (cmd && (await cmd).kill) {
      (await cmd).kill();
    }
    cmd = runKikoeruServe();
    localhostWebsite = '';
    openNewWindowButton.disabled = true;
    outputElement.innerHTML = '';
  };

  cmd = runKikoeruServe();

  cmd.catch(e => {
    console.error(`Service process failed to start: ${e}`);
  });

  async function runKikoeruServe() {
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

      return cmd.spawn();
    } catch (err) {
      console.error(err);
    }
  }
} catch (e) {
  console.error(`App error: ${e}`);
}
