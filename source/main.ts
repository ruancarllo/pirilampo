import * as path from 'path';
import * as dotenv from 'dotenv';

import DiscordBOT from './modules/discordbot';
import ChatGPT from './modules/chatgpt';
import Vestractor from './modules/vestractor';
import Bibliothecary from './modules/bibliothecary';

async function main(): Promise<void> {
  let discordBOT: DiscordBOT, chatGPT: ChatGPT, vestractor: Vestractor, bibliothecary: Bibliothecary;

  try {
    discordBOT = new DiscordBOT(process.env.DISCORD_TOKEN, process.env.DISCORD_TRUSTED_CHANNEL_IDS);
  } catch (exception) {
    console.error("Main: DiscordBOT bot could not be instantiated");
    console.error(exception);
  }

  try {
    chatGPT = new ChatGPT(process.env.OPENAI_TOKEN);
  } catch (exception) {
    console.error("Main: ChatGPT bot could not be instantiated");
    console.error(exception);
  }

  try {
    vestractor = await Vestractor.create();
  } catch (exception) {
    console.error("Main: Vestractor bot could not be instantiated");
    console.error(exception);
  }

  try {
    bibliothecary = new Bibliothecary(path.join(__dirname, './assets/plurall-bookshelf.yaml'));
  } catch (exception) {
    console.error("Main: Bibliothecary bot could not be instantiated");
    console.error(exception);
  }

  discordBOT.setDependencies({chatGPT, vestractor, bibliothecary});

  try {
    if (process.argv.includes('--register-commands')) await discordBOT.registerCommands();
    if (process.argv.includes('--initialize-client')) await discordBOT.initializeClient();
  } catch (exception) {
    console.error("Main: Command-line instructions could not be executed");
    console.error(exception);
  }
}

dotenv.config();
main();