import * as SuperAgent from 'superagent';

class ChatGPT {
  private endpoint = 'https://api.openai.com/v1/chat/completions';
  
  apiToken: string;
  
  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async answer(question: string): Promise<string> {
    const request = SuperAgent.post(this.endpoint);

    request.set('Content-Type', 'application/json');
    request.set('Authorization', `Bearer ${this.apiToken}`);
    request.send({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: question
        }
      ]
    });

    const response = await request;

    return String(response.body.choices[0].message.content);
  }
}

export default ChatGPT;