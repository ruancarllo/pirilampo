import * as fs from 'fs';
import * as path from 'path';

import * as dotenv from 'dotenv';

import DiscordBOT from './libraries/discordbot';
import ChatGPT from './libraries/chatgpt';
import Vestractor from './libraries/vestractor';
import Bibliothecary from './libraries/bibliothecary';

async function main(): Promise<void> {
  const discordBOT = new DiscordBOT(process.env.DISCORD_TOKEN);
  
  discordBOT.setDependencies({
    chatGPT: new ChatGPT(process.env.OPENAI_TOKEN),
    vestractor: await Vestractor.create(),
    bibliothecary: new Bibliothecary(path.join(__dirname, './assets/plurall-bookshelf.yaml'))
  })

  if (process.argv.includes('--register-commands')) await discordBOT.registerCommands();
  if (process.argv.includes('--initialize-client')) await discordBOT.initializeClient();
}

dotenv.config();
main();