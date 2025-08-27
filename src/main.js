import { Command } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';
import { message } from '@tauri-apps/plugin-dialog';

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

  openNewWindowButton.onclick = () => {
    if (localhostWebsite) {
      invoke('open_new_window', { label: `main-${id++}`, url: localhostWebsite });
    }
  };
  restartServiceButton.onclick = async () => {
    (await cmd).kill();
    cmd = runKikoeruServe();
    localhostWebsite = '';
    openNewWindowButton.disabled = true;
    outputElement.innerHTML = '';
  };

  let command = '';

  if (platform.includes('mac')) {
    command = 'ke-mac';
  } else if (platform.includes('win')) {
    command = 'ke-win.exe';
  } else if (platform.includes('linux')) {
    command = 'ke-linux';
  }

  let id = 0;
  let localhostWebsite = '';

  let cmd = runKikoeruServe();

  function runKikoeruServe() {
    try {
      const cmd = Command.create(command, [], {
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

      cmd.on('close', () => {
        message('kikoeru-express exited:\n' + output);
      });
      cmd.on('error', () => {
        message('kikoeru-express error:\n' + output);
      });

      return cmd.spawn();
    } catch (error) {
      console.error(error);
      message(error.toString());
    }
  }
} catch (e) {
  message(e.toString());
}
