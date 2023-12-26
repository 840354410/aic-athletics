/**
 * unocss defineConfig
 * @link unocss: https://github.com/unocss/unocss
 * @link unocss-preset-weapp: https://github.com/MellowCo/unocss-preset-weapp
 * */

import { defineConfig, presetUno, UserShortcuts } from 'unocss';
import presetWeapp from 'unocss-preset-weapp';
import { transformerClass } from 'unocss-preset-weapp/transformer';

let unoConfig;
const UNI_PLATFORM = process.env.UNI_PLATFORM;
const shortcuts: UserShortcuts = [
  {
    'fixed-full': 'fixed z-10 left-0 right-0 top-0 bottom-0',
    'fixed-x': 'fixed z-10 left-0 right-0',
    'fixed-y': 'fixed z-10 top-0 bottom-0',
    'fixed-top': 'fixed z-10 left-0 right-0 top-0',
    'fixed-bottom': 'fixed z-10 left-0 right-0 bottom-0',
    'absolute-full': 'absolute left-0 right-0 top-0 bottom-0',
    'absolute-x': 'absolute left-0 right-0',
    'absolute-y': 'absolute top-0 bottom-0',
    'absolute-top': 'absolute left-0 right-0 top-0',
    'absolute-bottom': 'absolute left-0 right-0 bottom-0',

    'flex-xy-center': 'flex items-center justify-center',
    'flex-x-center': 'flex justify-center',
    'flex-y-center': 'flex items-center'
  },
  // dynamic shortcuts
  [
    /^icon-(\d*)$/,
    ([, c]) => {
      return `w-${c}rpx h-${c}rpx`;
    }
  ],
  [
    /^h-lh-(\d*)rpx$/,
    ([, c]) => {
      return `h-${c}rpx lh-${c}rpx`;
    }
  ]
];
if (UNI_PLATFORM == 'h5') {
  unoConfig = defineConfig({
    presets: [presetUno()],
    shortcuts: shortcuts,
    theme: {}
  });
} else {
  const transformRules = {
    '.': '-d111-',
    '/': '-s111-',
    ':': '-c111-',
    '%': '-p111-',
    '!': '-e111-',
    '#': '-w111-',
    '(': '-b111l-',
    ')': '-b111r-',
    '[': '-f111l-',
    ']': '-f111r-',
    $: '-r111-',
    ',': '-r222-'
  };
  const prefix = '';
  unoConfig = defineConfig({
    presets: [
      presetWeapp({
        nonValuedAttribute: true,
        prefix: prefix,
        whRpx: false,
        transform: true,
        platform: 'uniapp',
        transformRules
      })
    ],
    shortcuts: shortcuts,
    theme: {},
    transformers: [
      transformerClass({
        transformRules
      })
    ]
  });
}

export default unoConfig;
