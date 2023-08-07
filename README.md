# About

This is a Brazilian 🇧🇷 educational bot for the [Discord](https://discord.com) network, capable of answering several questions from students through [ChatGPT](https://chat.openai.com), providing random and commented resolutions from the main entrance exams in the country coming from the [Curso Objetivo](https://www.curso-objetivo.br), and organize the handouts of the study platform [Plurall](https://plurall.net).

<p align="center">
  <img src="./theme/pirilampo-icon.jpg" alt="Pirilampo bot image" width="250" style="border-radius: 25px">
</p>

# Setup

Here you will find a detailed walkthrough on how to sync this project with [Discord](https://discord.com) and [OpenAI](https://openai.com) credentials from scratch.

## Discord application

To configure this application, go to the [Dicord Developer Portal Applications](https://discord.com/developers/applications), click the **New Application** button, type the name "Pirilampo", accept the terms and click **Create**.

In the **General Information** section, you define the **App Icon** as the image available in [theme/priilampo-icon.jpg](./theme/pirilampo-icon.jpg), the **Tags** as "Education" and "ChatBOT" , and the **Description** with the following words:

```txt
🧬 Inteligência artificial do Grupo Paradoxo
🚀 Responde a perguntas em instantes
🏆 Explica as principais matérias

Ilustração por "Liam Moore" de "Ouch!"
```

Click the **Save Changes** button and go to the **Bot** section, found in the side menu. In this section, disable the **Public Bot** option and enable the **Presence Intent**, **Server Members Intent**, and **Message Content Intent** options. Get the application token from the **Reset Token** button, and place it in the [source/tokens.json](./source/tokens.json) file as `DISCORD_TOKEN`.

Click once more on **Save Changes** and go to **OAuth2** in the **URL Generator** subsection. In this subsection, enable the **bot** option in the **Scopes** field, and the **Read Messages/View Channels**, **Send Messages**, **Embed Links** and **Attach Files**, **Read Message History** options in the **Bot field Permissions**.

Below, in the **Generated URL** field, there is a **Copy** button, which will copy the application's URL to your clipboard, so that it can be added to any existing servers on the social network.

This is possible as long as the bot has, in the desired channels, the following advanced permissions: **View Channels**, **Send Messages**, **Embed Links**, **Attach Files**, and **Read Message History**. You can enable this by right-clicking on the desired channel, going to **Edit Channel** and **Permissions**, where you will find the **Add members or roles** button for "Pirilampo" to the channel.

It is advisable to leave the name of the bot in green. To do so, enter the server's initial menu, click on its name and go to **Server Settings** and **Roles**. You can also reset the bot's job title to something like "Robô". Don't forget to click **Save Changes** after that.

## OpenAI ChatGPT

Access the [OpenAI API Keys Center](https://platform.openai.com/account/api-keys) and click the **Create new secret key** button to create the token that you must put in [source/tokens.json](./source/tokens.json) as `OPENAI_TOKEN`.

## Plurall bookshelf

Save the [Plurall](https://plurall.net) platform handout information in the [source/assets/plurall-bookshelf.yaml](./source/assets/plurall-bookshelf.yaml) file in a format similar to This one:

```yaml
embedInfo:
  mainTitle: Biblioteca virtual do Plurall
  platformHref: https://maestro.plurall.net/bookshelf
  faviconUrl: <PLATFORM FAVICON URL>
  accentColor: 7611610 # Purple color in decimal

sections:
  - <SECTION NAME>:
    - <AREA NAME>:
      - <SUBJECT NAME>:
          PDF: <PDF BOOK URL>
          HTML: <HTML BOOK URL>
          spaceLine: false
  # Other sections, areas and subjects...
```

# Run

To install this project's dependencies, you need to have [NodeJS v20.5](https://nodejs.org) and [NPM v9.8](https://www.npmjs.com) installed on your computer and their binaries available in the `$PATH` from your computer.

Therefore, open a terminal in the folder of a clone of this source code, and run the following command:

``` shell
npm install --package-lock=false
```

To register the global slash commands (/) for this application, run:

``` shell
npm run register-commands
```

Finally, to turn on the bot, let the following command run:

``` shell
npm run initialize-client
```

# Credits

Made with ❤️ by R.