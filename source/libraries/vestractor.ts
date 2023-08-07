import Axios from 'axios';
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

  static async create() {
    const vestractor = new Vestractor();
    await vestractor.setEntranceExams();

    return vestractor;
  }

  private async setEntranceExams() {
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
  }

  private async setEntranceExamResolutions(entranceExam: EntranceExam) {
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
  }

  private async setResolutionQuestions(resolution: Resolution) {
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
  }

  async getRandomQuestion(entranceExamCompressedAcronym?: string, resolutionPhaseName?: string): Promise<Question> {
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
  }
}

namespace Utils {
  export async function getDOM(url: string) {
    let plainHtml = (await Axios.get(url)).data;
    let webPage = new JsDOM.JSDOM(plainHtml);
    let document = webPage.window.document;

    return document;
  }

  export function getRandomElement<ArrayType>(inputArray: ArrayType[]): ArrayType {
    const randomIndex = Math.floor(Math.random() * inputArray.length);
    return inputArray[randomIndex];
  }

  export function amendPlatformUrl(originUrl: string, href: string) {
    const originUrlFolders = originUrl.split('/');
    const hrefFolders = href.split('/');

    const amendedFolders = [...originUrlFolders.slice(0, -1), ...hrefFolders];
    const amendedUrl = amendedFolders.join('/');

    return amendedUrl;
  }

  export function normalizeEntranceExamCompressedAcronym(inputName: string) {
    const outputName = inputName.toLowerCase().replaceAll(' ', '');
    return outputName;
  }

  export function normalizeEntranceExamFullAcronym(inputName: string) {
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