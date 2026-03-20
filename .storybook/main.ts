import path from 'node:path';
import type { StorybookConfig } from '@storybook/html-webpack5';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|js)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/html-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../src/assets'],
  webpackFinal: async (storybookConfig) => {
    storybookConfig.resolve ??= {};
    storybookConfig.resolve.extensions = Array.from(
      new Set([...(storybookConfig.resolve.extensions ?? []), '.ts', '.js', '.scss', '.pug']),
    );

    storybookConfig.module ??= { rules: [] };
    storybookConfig.module.rules = [
      ...(storybookConfig.module.rules ?? []),
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, '../tsconfig.storybook.json'),
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.pug$/,
        use: 'pug-loader',
      },
      {
        test: /\.(png|svg)$/i,
        type: 'asset/resource',
      },
    ];

    storybookConfig.resolve.alias = {
      ...(storybookConfig.resolve.alias ?? {}),
      '@': path.resolve(__dirname, '../src'),
    };

    return storybookConfig;
  },
};

export default config;
