import * as fs from 'fs';
import * as path from 'path';

import DiscordBOT from './libraries/discordbot';
import ChatGPT from './libraries/chatgpt';
import Vestractor from './libraries/vestractor';
import Bibliothecary from './libraries/bibliothecary';

async function main(): Promise<void> {
  const {OPENAI_TOKEN, DISCORD_TOKEN} = JSON.parse(fs.readFileSync(path.join(__dirname, './tokens.json'), 'utf-8'));

  const discordBOT = new DiscordBOT(DISCORD_TOKEN);
  
  discordBOT.setDependencies({
    chatGPT: new ChatGPT(OPENAI_TOKEN),
    vestractor: await Vestractor.create(),
    bibliothecary: new Bibliothecary(path.join(__dirname, './assets/plurall-bookshelf.yaml'))
  })

  if (process.argv.includes('--register-commands')) await discordBOT.registerCommands();
  if (process.argv.includes('--initialize-client')) await discordBOT.initializeClient();
}

main();