const { Command } = window.__TAURI__.shell;
const { invoke } = window.__TAURI__.tauri;

let platform = '';
if (navigator.userAgentData && navigator.userAgentData.platform) {
  platform = navigator.userAgentData.platform.toLowerCase();
} else {
  platform = navigator.userAgent.toLowerCase();
}

const outputElement = document.querySelector('#output');

let command = '';

if (platform.includes('mac')) {
  command = 'ke-mac';
} else if (platform.includes('win')) {
  command = 'ke-win.exe';
} else if (platform.includes('linux')) {
  command = 'ke-linux';
}

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
cmd.on('error', () => {});

cmd.spawn();
