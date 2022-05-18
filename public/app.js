console.log('gpt3');

class ChatBot extends HTMLElement {
  constructor () {
    super();
    this.data = (JSON.parse(localStorage.getItem('chatData')) || {
      chatString: 'Human: Hello, who are you?\nAI: I am doing great. How can I help you today?',
      chatData: []
    })
    this.form = this.querySelector('.chatbot__form');
    this.prompt = this.querySelector('.chatbot__input');
    this.chatbox = this.querySelector('.chatbox');

    this.form.addEventListener('submit', this.handlePromptSubmit);
    window.addEventListener('DOMContentLoaded', this.handleLoad);

    console.log('this.data on load: ', this.data);
  }

  handleLoad = (evt) => {
    console.log('on load!')
    // if(localStorage.hasOwnPropterty('chatData')) {
    if(localStorage.hasOwnProperty('chatData')) {
      console.log('we already have data: ', this.data);

      this.data.chatData.map((chat) => {
        // return this.renderChatItem(chat);
        console.log(chat)
        this.chatbox.append(this.renderChatItem(chat));
      })
    }
  };

  handlePromptSubmit = (evt) => {
    evt.preventDefault();
    console.log(this);

    const formData = new FormData(this.form);
    let prompt = [...formData][0][1];

    // do nothing if the prompt is empty
    if(prompt.trim().length === 0) {
      this.prompt.focus();
      return;
    };

    console.log(this.data.chatString + '\nHuman: ' + prompt);

    const params = {
      prompt: this.data.chatString + '\nHuman: ' + prompt,
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

    // will need to update code below!!


    //   // take chatdata, add it to the chat history array,
    //   // re-sort the array, optimizing for moving the last time directly to the front
    //   // render the new chat data item in front of the existing chat data
    //   const newChatData = this.parseGPTResponse(prompt, data);
    //   console.log('chat data before updating: ', this.chatData);
    //   this.chatData = [newChatData, ...this.chatData];
    //   console.log('updated chat data: ', this.chatData);
    //   const newChatItem = this.renderChatItem(newChatData);
    //   this.chatbox.prepend(newChatItem);
    // this.data.chatString = this.data.chatString + '\nHuman: ' + newChatData.prompt + '\nAI: ' + newChatData.response;

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
    console.log('chat data before updating: ', this.data);

    this.data = {
      ...this.data,
      chatData: [newChatData, ...this.data.chatData]
    }

    console.log('updated chat data: ', this.data);
    const newChatItem = this.renderChatItem(newChatData);
    this.chatbox.prepend(newChatItem);

    this.data = {
      ...this.data,
      chatString: this.data.chatString + '\nHuman: ' + newChatData.prompt + '\nAI: ' + newChatData.response
    }

    console.log(this.data.chatString);
    this.prompt.value = '';
    this.prompt.focus();

    localStorage.setItem('chatData', JSON.stringify(this.data));
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