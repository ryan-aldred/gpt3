console.log('gpt3');

class ChatBot extends HTMLElement {
  constructor () {
    super();
    this.chatString = 'Human: Hello, who are you?\nAI: I am doing great. How can I help you today?';
    this.chatData = [];
    this.form = this.querySelector('.chatbot__form');
    this.prompt = this.querySelector('.chatbot__input');
    this.chatbox = this.querySelector('.chatbox');

    this.form.addEventListener('submit', this.handlePromptSubmit);
  }

  handlePromptSubmit = (evt) => {
    evt.preventDefault();
    console.log(this);

    const formData = new FormData(this.form);
    let prompt = [...formData][0][1];
    console.log(this.chatString + '\nHuman: ' + prompt);

    const params = {
      prompt: this.chatString + '\nHuman: ' + prompt,
      temperature: 0.9,
      max_tokens: 140,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      'stop': '\nHuman'
    };
    
    // fetch('https://api.openai.com/v1/engines/ada/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/JSON',
    //     'Authorization': `Bearer ${secret_api_key}`
    //   },
    //   body: JSON.stringify(params)
    // })
    // .then(res => res.json())
    // .then(data => {
    //   console.log(prompt)
    //   console.log(data);

    //   // parse the chat data for what we need
    //   // take chatdata, add it to the chat history array,
    //   // re-sort the array, optimizing for moving the last time directly to the front
    //   // render the new chat data item in front of the existing chat data
    //   const newChatData = this.parseGPTResponse(prompt, data);
    //   console.log('chat data before updating: ', this.chatData);
    //   this.chatData = [newChatData, ...this.chatData];
    //   console.log('updated chat data: ', this.chatData);
    //   const newChatItem = this.renderChatItem(newChatData);
    //   this.chatbox.prepend(newChatItem);
    // this.chatString = this.chatString + '\nHuman: ' + newChatData.prompt + '\nAI: ' + newChatData.response;

    // })
    // .catch(error => console.log(error));

    // cut down on api requests made during prototyping
    const data = {
      created: Date.now(),
      choices: [
        {
          text: 'this is dummy data'
        }
      ]
    }
    const newChatData = this.parseGPTResponse(prompt, data);
    console.log('chat data before updating: ', this.chatData);
    this.chatData = [newChatData, ...this.chatData];
    console.log('updated chat data: ', this.chatData);
    const newChatItem = this.renderChatItem(newChatData);
    this.chatbox.prepend(newChatItem);

    this.chatString = this.chatString + '\nHuman: ' + newChatData.prompt + '\nAI: ' + newChatData.response;

    console.log(this.chatString);
    this.prompt.value = '';
    this.prompt.focus();
  }

  parseGPTResponse = (prompt, responseData) => {
    return {
      prompt: prompt,
      response: responseData.choices[0].text,
      id: responseData.created,
    }
  }

  renderChatItem = ({prompt, response, id}) => {
    console.log('renderChatItem');

    const chat = document.createElement('li');
    chat.className = 'chatbox__chat';
    chat.dataset.id = id;
    chat.innerHTML = `
      <div class='chatbox__chat-prompt'><span class='chatbox__prompt-author'>You</span> ${prompt}</div>
      <div class='chatbox__response'>${response} <span class='chatbox__response-author'>Norma</span></div>
    `;
    return chat;
  }
}

customElements.define('chat-bot', ChatBot);