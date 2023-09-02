import * as fs from 'fs';
import * as yaml from 'js-yaml';

type Bookshelf = {
  embedInfo: {
    mainTitle: string,
    platformHref: string,
    faviconUrl: string,
    accentColor: number
  },

  sections: Array<Section>;
}

interface Section {
  [sectionName: string]: Array<Area>
}

interface Area {
  [areaName: string]: Array<Subject>
}

interface Subject {
  [subjectName: string]: {
    PDF: string,
    HTML: string,
    spaceLine: boolean,
  }
}

type DiscordEmbed = {
  author: {
    name: string,
    url: string,
    icon_url: string,
  },
  color: number,
  title: string,
  fields: Array<DiscordEmbedField>
}

type DiscordEmbedField = {
  name: string,
  value: string
}

class Bibliothecary {
  parsedBookshelf: Bookshelf;

  constructor(bookshelfFilePath: string) {
    try {
      const bookshelfFileData = fs.readFileSync(bookshelfFilePath, 'utf-8');
      this.parsedBookshelf = yaml.load(bookshelfFileData) as Bookshelf;
    } catch (exception) {
      console.error("Bibliothecary: Could not be created");
      console.error(exception);
    }
  }
  
  public createEmbeds(): Array<DiscordEmbed> {
    let embeds: Array<DiscordEmbed> = [];

    this.parsedBookshelf.sections.forEach((section) => {
      let embed: DiscordEmbed;

      const sectionNames = Object.keys(section);
      sectionNames.forEach((sectionName) => {
        const areas = section[sectionName];

        embed = {
          author: {
            name: this.parsedBookshelf.embedInfo.mainTitle,
            url: this.parsedBookshelf.embedInfo.platformHref,
            icon_url: this.parsedBookshelf.embedInfo.faviconUrl,
          },
          color: this.parsedBookshelf.embedInfo.accentColor,
          title: sectionName,
          fields: [this.createEmptyField()]
        }

        areas.forEach((area) => {
          const areaNames = Object.keys(area);
          areaNames.forEach((areaName, areaIndex) => {
            const subjects = area[areaName];

            if (areaIndex === 0) {
              embed.fields[embed.fields.length - 1] = this.createEmptyField();
            }

            subjects.forEach((subject) => {
              const subjectNames = Object.keys(subject);
              subjectNames.forEach((subjectName) => {
                const subjectProperties = subject[subjectName];

                const subjectMarkdownLine = this.makeSubjectMarkdownLine(subjectName, subjectProperties.PDF, subjectProperties.HTML);
                embed.fields[embed.fields.length - 1].value += `\n${subjectMarkdownLine}`;

                if (subjectProperties.spaceLine) {
                  embed.fields.push(this.createEmptyField());
                  embed.fields.push(this.createEmptyField());
                }
              });
            });
          });
        });
      });

      embed.fields.forEach((field) => field.value = field.value.trim());
      embeds.push(embed);
    });

    return embeds;
  }

  private makeSubjectMarkdownLine(subjectName: string, PDF?: string, HTML?: string): string {
    let subjectAssets = [];

    if (PDF) subjectAssets.push(`[PDF](${PDF})`);
    if (PDF && HTML) subjectAssets.push('|');
    if (HTML) subjectAssets.push(`[Digital](${HTML})`);

    return `${subjectName} [${subjectAssets.join(' ')}]`;
  }

  private createEmptyField(): DiscordEmbedField {
    return {
      name: '',
      value: ''
    }
  }
}

export default Bibliothecary;