import { loadConfig } from 'src/utils/common';

export interface Config {
  version: string;
  mongoUrl: string;
}

export const config: Config = {
  version: loadConfig('version', '0.0.1'),
  mongoUrl: loadConfig(
    'mongodb.url',
    'mongodb://localmongo:localmongo@172.26.32.1:27017/cashbook?authSource=admin',
  ),
};
