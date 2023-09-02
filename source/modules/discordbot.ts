import ChatGPT from './chatgpt';
import Vestractor from './vestractor';
import Bibliothecary from './bibliothecary';

import * as Discord from 'discord.js';

type Dependencies = {
  chatGPT: ChatGPT
  vestractor: Vestractor,
  bibliothecary: Bibliothecary
}

class DiscordBOT {
  private static MAX_ANSWER_LENGTH = 2000;
  private static TYPING_TIME_LIMIT = 10000;

  private static PSEUDO_COMMAND_PREFIX = '!';

  client: Discord.Client;
  apiToken: string;
  trustedChannelIds: Array<string>

  dependencies: Dependencies;

  constructor(apiToken: string, trustedChannelIds: string | undefined) {
    this.client = new Discord.Client({
      intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
      ]
    });

    this.apiToken = apiToken;

    if (trustedChannelIds === undefined) {
      this.trustedChannelIds = [];
    } else {
      this.trustedChannelIds = trustedChannelIds.split(',');
    }
  }

  setDependencies(dependencies: Dependencies) {
    this.dependencies = dependencies;
  }

  async registerCommands(): Promise<void> {
    try {
      let commands: Array<Discord.SlashCommandBuilder> = [];
  
      this.dependencies.vestractor.entranceExams.forEach((entranceExam) => {
        let command = new Discord.SlashCommandBuilder();
    
        command.setName(entranceExam.compressedAcronym);
        command.setDescription(`Exibe uma questtão aleatória resolvida para ${entranceExam.fullAcronym}`);
    
        commands.push(command);
      });
    
      let parsedCommands: Array<Discord.RESTPostAPIChatInputApplicationCommandsJSONBody> = commands.map((command) => command.toJSON());
    
      await this.client.login(this.apiToken);
    
      const clientRest = new Discord.REST();
      clientRest.setToken(this.apiToken);
    
      const applicationCommandsRoute = Discord.Routes.applicationCommands(this.client.application.id);
      const requestOptions = {body: parsedCommands};
    
      await clientRest.put(applicationCommandsRoute, requestOptions);
      await this.client.destroy();
    } catch (exception) {
      console.error("DiscordBOT: The commands could not be registered");
      console.error(exception);
    }
  }

  async initializeClient(): Promise<void> {
    try {
      const {ClientReady, MessageCreate, InteractionCreate} = Discord.Events;
  
      this.client.once(ClientReady, (client) => this.handleReadyState(client));
      this.client.on(MessageCreate, (message) => this.handleMessage(message));
      this.client.on(InteractionCreate, (interaction) => this.handleInteraction(interaction));
    
      await this.client.login(this.apiToken);
    } catch (exception) {
      console.error("DiscordBOT: The client could not be initialized");
      console.error(exception);
    }
  }

  private handleReadyState(client: Discord.Client): void {
    console.log(`DiscordBOT: Client is ready and logged as ${client.user.tag}`);
  }

  private async handleMessage(message: Discord.Message): Promise<void> {
    try {
      if (message.author.bot) return;
      if (message.content.startsWith(DiscordBOT.PSEUDO_COMMAND_PREFIX)) return this.handlePseudoInteraction(message);
      if (!this.isChannelTrusted(message.channel.id)) return;

      await message.channel.sendTyping();
      const typingRefresher = setInterval(async () => await message.channel.sendTyping(), DiscordBOT.TYPING_TIME_LIMIT);

      const recievedQuestion = message.content;
      const answerPromise = this.dependencies.chatGPT.answer(recievedQuestion);

      answerPromise.then((answer) => {
        clearInterval(typingRefresher);
        
        if (typeof answer === 'string') {
          const splittedAnswer = Utils.splitPhraseInParts(answer, DiscordBOT.MAX_ANSWER_LENGTH);
          splittedAnswer.forEach(async (answerPart) => await message.reply(answerPart));
        }
      });

      answerPromise.catch(async () => {
        clearInterval(typingRefresher);

        await message.reply('Serviço de inteligência artificial indisponível no momento!');
      });

    } catch (exception) {
      console.error("DiscordBOT: Some message coult not be handled");
      console.error(exception);
    }
  }

  private async handleInteraction(interaction: Discord.Interaction): Promise<void> {
    try {
      if (!interaction.isChatInputCommand()) return;
      if (!this.isChannelTrusted(interaction.channel.id)) return;

      try {
        const randomQuestion = await this.dependencies.vestractor.getRandomQuestion(interaction.commandName);
        await interaction.reply({files: [randomQuestion.imageUrl]});
      } catch {
        await interaction.reply('Serviço de randomização de questões indisponível no momento!');
      }
    } catch (exception) {
      console.error("DiscordBOT: Some interaction could not be handled");
      console.error(exception);
    }
  }

  private async handlePseudoInteraction(message: Discord.Message): Promise<void> {
    try {
      if (!this.isChannelTrusted(message.channel.id)) return;

      const pseudoCommandName = message.content.slice(1);
      if (pseudoCommandName === 'bookshelf') {
        const embeds = this.dependencies.bibliothecary.createEmbeds();

        for (let i = 0; i < embeds.length; i++) {
          if (i === 0) {
            await message.channel.send({
              content: 'Acesse nossas apostilas mais facilmente!',
              embeds: [embeds[i]]
            });
          } else {
            await message.channel.send({
              embeds: [embeds[i]]
            });
          }
        }
      }
    } catch (exception) {
      console.error("DiscordBOT: Some pseudo-interaction could not be handled");
      console.error(exception);
    }
  }

  private isChannelTrusted(channelId: string): boolean {
    const istrusted = this.trustedChannelIds.includes(channelId);
    return istrusted;
  }
}

namespace Utils {
  export function splitPhraseInParts(inputString: string, partMaxLength: number): Array<string> {
    const wordSeparator = ' ';
  
    const words = inputString.split(wordSeparator);
    const parts = [''];
  
    for (let i = 0; i < words.length; i++) {
      const canCompletePart = parts[parts.length - 1].length + wordSeparator.length + words[i].length <= partMaxLength;
      canCompletePart ? parts[parts.length - 1] += words[i] + wordSeparator : parts.push('');
    }
  
    return parts.map((part) => part.trim());
  }
}

export default DiscordBOT;