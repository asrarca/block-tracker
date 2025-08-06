import fs from 'fs';
import path from 'path';
import { TokenMetaData } from '../types/TokenMetaData';


export class TokenDataService {

  private tokens: TokenMetaData[];

  constructor() {
    this.tokens = [];
  }

  async getAllTokens(): Promise<Map<string, TokenMetaData>> {

    const cacheDir = path.join(process.cwd(), 'app/data/token-cache');
    const files = await fs.promises.readdir(cacheDir);

    const allTokens: Map<string, TokenMetaData> = new Map();

    for (const file of files) {
      const filePath = path.join(cacheDir, file);
      if (path.extname(file) === '.json') {
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.tokens && Array.isArray(parsed.tokens)) {
          const t = parsed.tokens as TokenMetaData[];
          t.forEach(token => {
            allTokens.set(token.address, token);
          });
        }
      }
    }

    return allTokens;
  }

};
