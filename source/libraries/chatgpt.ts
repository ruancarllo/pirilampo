import Axios from 'axios';

class ChatGPT {
  private endpoint = 'https://api.openai.com/v1/chat/completions';
  
  apiToken: string;
  
  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async answer(question: string): Promise<string> {
    const data = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: question
        }
      ]
    };

    const response = await Axios.post(this.endpoint, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`
      }
    });

    return String(response.data.choices[0].message.content);
  }
}

export default ChatGPT;