class ChatBot extends HTMLElement {
  constructor () {
    super();
    this.defaultData = {
      chatString: 'Human: Hello, I would like to return order 2012\nAI: Okay, can I ask the reason for the return?\nHuman: Yes, the jeans are a little bit to small.\nAI: I understand, would you like a replacement or store credit?',
      chatData: [],
    }

    this.data = (JSON.parse(localStorage.getItem('chatData')) || this.defaultData)

    this.form = this.querySelector('.chatbot__form');
    this.prompt = this.querySelector('.chatbot__input');
    this.chatbox = this.querySelector('.chatbox');

    this.selectors = {
      chatbox: this.querySelector('.chatbox'),
      formElements: {
        prompt: document.querySelector('[data-form-prompt]'),
        continue: document.querySelector('[data-form-continue]'),
        submit: document.querySelector('[data-submit-btn]'),
      }
    }

    this.form.addEventListener('submit', this.handlePromptSubmit);
    window.addEventListener('DOMContentLoaded', this.handleLoad);

    console.log('this.data on load: ', this.data);
  }

  handleLoad = (evt) => {
    console.log('on load!')
    if(!localStorage.hasOwnProperty('chatData')) {
      // new session
      this.selectors.formElements.prompt.classList.remove('hide');
      this.selectors.formElements.submit.classList.remove('hide');

      
    } else {
      // returning session
      console.log('we already have data: ', this.data);
      this.selectors.formElements.continue.classList.remove('hide');
      this.selectors.formElements.submit.classList.remove('hide');


      this.data.chatData.map((chat) => {
        console.log(chat)
        this.chatbox.append(this.renderChatItem(chat));
      })
    }
  };

  handlePromptSubmit = (evt) => {
    evt.preventDefault();
    console.log(this);

    const formData = new FormData(this.form);
    console.log('formData: ');

    [...formData].map(data => console.log(data));

    const filteredFormData = [...formData].filter(data => data[1].trim().length > 0);

    if(!filteredFormData.length > 0) return;

    const continueChat = filteredFormData.every(data => {
      return data[0] === 'continue';
    });

    if(continueChat) {
      console.log('handle continue chat');
      const response = filteredFormData[0][1].trim().toLowerCase();
      if(response === 'y' || response === 'n' || response === 'yes' || response === 'no') {
        console.log('valid response');
        // valid response
        if(response === 'y' || response === 'yes') {
          console.log('continue with last chat');
        } else {
          this.data =  {
            ...this.defaultData
          }
          localStorage.removeItem('chatData');
          this.selectors.chatbox.innerHTML = '';
        }
        this.selectors.formElements.continue.classList.add('hide');
        this.selectors.formElements.prompt.classList.remove('hide');
        this.selectors.formElements.continue.querySelector('input').value = '';
        this.selectors.formElements.prompt.querySelector('input').focus();
      } else {
        console.log('invalid response');
        this.selectors.formElements.continue.querySelector('input').value = '';
        this.selectors.formElements.continue.querySelector('input').focus();
      }
      return;
    }

    const [prompt] = filteredFormData.filter(data => {
      return data[0] === 'prompt';
    })

    console.log('the prompt: ', prompt[1]);

    console.log(this.data.chatString + '\nHuman: ' + prompt[1]);

    const params = {
      prompt: this.data.chatString + '\nHuman: ' + prompt[1],
      temperature: 0.9,
      max_tokens: 140,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      'stop': '\nHuman'
    };

    const engine = 'ada';
    // const engine = 'curie';
    
    // fetch(`https://api.openai.com/v1/engines/${engine}/completions`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/JSON',
    //     'Authorization': `Bearer ${secret_api_key}`
    //   },
    //   body: JSON.stringify(params)
    // })
    // .then(res => res.json())
    // .then(data => {
    //   const newChatData = this.parseGPTResponse(prompt[1], data);
    //   const newChatItem = this.renderChatItem(newChatData);

    //   this.chatbox.prepend(newChatItem);

    //   this.data = {
    //     ...this.data,
    //     chatData: [newChatData, ...this.data.chatData],
    //     chatString: this.data.chatString + '\nHuman: ' + newChatData.prompt + '\nAI: ' + newChatData.response
    //   }

    //   console.log(this.data.chatString);

    //   this.prompt.value = '';
    //   this.prompt.focus();
    //   localStorage.setItem('chatData', JSON.stringify(this.data));
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

    const newChatData = this.parseGPTResponse(prompt[1], data);
    const newChatItem = this.renderChatItem(newChatData);

    this.chatbox.prepend(newChatItem);

    this.data = {
      ...this.data,
      chatData: [newChatData, ...this.data.chatData],
      chatString: this.data.chatString + '\nHuman: ' + newChatData.prompt + '\nAI: ' + newChatData.response
    }

    console.log(this.data.chatString);

    this.prompt.value = '';
    this.prompt.focus();
    localStorage.setItem('chatData', JSON.stringify(this.data));
  }

  parseGPTResponse = (prompt, responseData) => {
    const parsedResponse = responseData.choices[0].text.split('AI: ').pop();

    return {
      prompt: prompt,
      response: parsedResponse,
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