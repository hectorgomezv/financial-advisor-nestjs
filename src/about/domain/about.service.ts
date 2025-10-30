import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { About } from './entities/about.entity.js';

@Injectable()
export class AboutService {
  getAbout(): About {
    const packageJson = JSON.parse(
      readFileSync('package.json', { encoding: 'utf8' }),
    );

    return {
      name: packageJson.name,
      version: packageJson.version,
      buildNumber: process.env.GITHUB_RUN_NUMBER || '',
    };
  }
}
