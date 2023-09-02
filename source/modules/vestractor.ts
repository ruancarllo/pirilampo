import * as SuperAgent from 'superagent';
import * as JsDOM from 'jsdom';

type EntranceExam = {
  fullAcronym: string,
  compressedAcronym: string,
  pageUrl: string,
  resolutions: Array<Resolution>
}

type Resolution = {
  phaseName: string,
  pageUrl: string,
  questions: Array<Question>
}

type Question = {
  area: string;
  id: string,
  answer: string | undefined,
  imageUrl: string
}

class Vestractor {
  private platformEntrypoint = "https://www.curso-objetivo.br/vestibular/resolucao_comentada.aspx";

  entranceExams: Array<EntranceExam> = [];

  static async create(): Promise<Vestractor> | undefined {
    try {
      const vestractor = new Vestractor();
      await vestractor.setEntranceExams();

      return vestractor;
    } catch (exception) {
      console.error("Vestractor: Could not be crated");
      console.error(exception);
    }
  }

  private async setEntranceExams(): Promise<void> {
    try {
      const homepageDocument = await Utils.getDOM(this.platformEntrypoint);
      const entranceExamAnchors = homepageDocument.querySelectorAll('a[title^="Resolução Comentada"]');

      for (let i = 0; i < entranceExamAnchors.length; i++) {
        const anchorTextContent = entranceExamAnchors[i].textContent;
        const anchorHref =  entranceExamAnchors[i].getAttribute('href');

        this.entranceExams.push({
          fullAcronym: Utils.normalizeEntranceExamFullAcronym(anchorTextContent),
          compressedAcronym: Utils.normalizeEntranceExamCompressedAcronym(anchorTextContent),
          pageUrl: Utils.amendPlatformUrl(this.platformEntrypoint, anchorHref),
          resolutions: []
        });
      }
    } catch (exception) {
      console.error("Vestractor: Entrance exams could not be set");
      console.error(exception);
    }
  }

  private async setEntranceExamResolutions(entranceExam: EntranceExam): Promise<void> {
    try {
      const entranceExamDocument = await Utils.getDOM(entranceExam.pageUrl);
      const resoltionAnchors = entranceExamDocument.querySelectorAll('a[title*="Resolução Comentada"]');

      for (let i = 0; i < resoltionAnchors.length; i++) {
        const anchorTextContent = resoltionAnchors[i].textContent;
        const anchorHref = resoltionAnchors[i].getAttribute('href');

        entranceExam.resolutions.push({
          phaseName: Utils.normalizeEntranceExamFullAcronym(anchorTextContent),
          pageUrl: Utils.amendPlatformUrl(entranceExam.pageUrl, anchorHref),
          questions: []
        });
      }
    } catch (exception) {
      console.error("Vestractor: Some entrance exam resolutions could not be set");
      console.error(exception);
    }
  }

  private async setResolutionQuestions(resolution: Resolution): Promise<void> {
    try {
      const resolutionDocument = await Utils.getDOM(resolution.pageUrl);
      const questionAnchorsAndParagraphs = resolutionDocument.querySelectorAll('.questao-gabarito, h2');

      let dynamicQuestionArea;

      for (let i = 0; i < questionAnchorsAndParagraphs.length; i++) {
        if (questionAnchorsAndParagraphs[i].localName === 'h2') {
          const paragraph = questionAnchorsAndParagraphs[i]
          dynamicQuestionArea = paragraph.textContent.trim();
        }

        if (questionAnchorsAndParagraphs[i].localName === 'a') {
          const anchor = questionAnchorsAndParagraphs[i];

          const anchorTextContent = anchor.textContent;
          const anchorDatasetUrl = anchor.getAttribute('data-url');
    
          resolution.questions.push({
            area: dynamicQuestionArea,
            id: anchorTextContent.split('-')[0].trim(),
            answer: anchorTextContent.split('-')[1]?.trim(),
            imageUrl: anchorDatasetUrl
          });
        }
      }
    } catch (exception) {
      console.error("Vestractor: Some resolution questions could not be set");
      console.error(exception);
    }
  }

  async getRandomQuestion(entranceExamCompressedAcronym?: string, resolutionPhaseName?: string): Promise<Question> | undefined {
    try {
      let entranceExam: EntranceExam;
        let resolution: Resolution;

        if (!this.entranceExams[0]) await this.setEntranceExams();

        if (!entranceExamCompressedAcronym) {
          entranceExam = Utils.getRandomElement(this.entranceExams);
        } else {
          entranceExam = this.entranceExams.find((item) => item.compressedAcronym === entranceExamCompressedAcronym);
        }

        if (!entranceExam.resolutions[0]) await this.setEntranceExamResolutions(entranceExam);

        if (!resolutionPhaseName) {
          resolution = Utils.getRandomElement(entranceExam.resolutions);
        } else {
          resolution = entranceExam.resolutions.find((item) => item.phaseName === resolutionPhaseName);
        }

        if (!resolution.questions[0]) await this.setResolutionQuestions(resolution);
        
        return Utils.getRandomElement(resolution.questions);
      } catch (exception) {
        console.error("Vestractor: The random question could not be get");
        console.error(exception);
      }
    }
}

namespace Utils {
  export async function getDOM(url: string): Promise<Document> | undefined {
    try {
      const request = SuperAgent.get(url);
      const response = await request;

      const plainHtml = response.text;
      const webPage = new JsDOM.JSDOM(plainHtml);
      const document = webPage.window.document;

      return document;
    } catch (exception) {
      console.error("Vestractor: Some DOM could not be get");
      console.error(exception);
    }
  }

  export function getRandomElement<ArrayType>(inputArray: ArrayType[]): ArrayType {
    const randomIndex = Math.floor(Math.random() * inputArray.length);
    return inputArray[randomIndex];
  }

  export function amendPlatformUrl(originUrl: string, href: string): string {
    const originUrlFolders = originUrl.split('/');
    const hrefFolders = href.split('/');

    const amendedFolders = [...originUrlFolders.slice(0, -1), ...hrefFolders];
    const amendedUrl = amendedFolders.join('/');

    return amendedUrl;
  }

  export function normalizeEntranceExamCompressedAcronym(inputName: string): string {
    const outputName = inputName.toLowerCase().replaceAll(' ', '');
    return outputName;
  }

  export function normalizeEntranceExamFullAcronym(inputName: string): string {
    let nameChars = [...inputName.toLowerCase()];

    for (let charIndex = 0; charIndex < nameChars.length; charIndex++) {
      if (charIndex === 0) {
        nameChars[charIndex] = nameChars[charIndex].toUpperCase();
      }

      if (nameChars[charIndex] === ' ') {
        nameChars[charIndex + 1] = nameChars[charIndex + 1].toUpperCase();
      }
      
      if (nameChars[charIndex] === '-') {
        nameChars[charIndex + 1] = nameChars[charIndex + 1].toUpperCase();
        nameChars[charIndex + 2] = nameChars[charIndex + 2].toUpperCase();
      }
    }

    return nameChars.join('');
  }
}

export default Vestractor;