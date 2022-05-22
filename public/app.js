class ChatBot extends HTMLElement {
  constructor () {
    super();
    this.defaultData = {
      chatString: 'Human: Hello, I would like to return order 2012\nAI: Okay, can I ask the reason for the return?\nHuman: Yes, the jeans are a little bit to small.\nAI: I understand, would you like a replacement or store credit?',
      chatData: [],
    }

    this.data = (JSON.parse(localStorage.getItem('chatData')) || this.defaultData)

    this.selectors = {
      chatbotResponse: this.querySelector('.chatbot__response'),
      chatbox: this.querySelector('.chatbox'),
      form: this.querySelector('.chatbot__form'),
      formElements: {
        continue: document.querySelector('[data-form-continue]'),
        prompt: document.querySelector('[data-form-prompt]'),
        submit: document.querySelector('[data-submit-btn]'),
      }
    }

    this.selectors.form.addEventListener('submit', this.handlePromptSubmit);
    window.addEventListener('DOMContentLoaded', this.handleLoad);
  }

  handleLoad = (evt) => {
    if(!localStorage.hasOwnProperty('chatData')) {
      // new session
      this.selectors.formElements.prompt.classList.remove('hide');
      this.selectors.formElements.submit.classList.remove('hide');      
    } else {
      // returning session
      this.selectors.formElements.continue.classList.remove('hide');
      this.selectors.formElements.submit.classList.remove('hide');

      this.data.chatData.map((chat) => {
        this.selectors.chatbox.append(this.renderChatItem(chat));
      })
    }
  };

  handlePromptSubmit = (evt) => {
    evt.preventDefault();

    const formData = new FormData(this.selectors.form);
    const filteredFormData = [...formData].filter(data => data[1].trim().length > 0);

    if(!filteredFormData.length > 0) return;

    const continueChat = filteredFormData.every(data => {
      return data[0] === 'continue';
    });

    if(continueChat) {
      const response = filteredFormData[0][1].trim().toLowerCase();
      if(response === 'y' || response === 'n' || response === 'yes' || response === 'no') {
        if(response === 'n' || response === 'no') {
          this.selectors.chatbox.innerHTML = '';
          this.data =  {
            ...this.defaultData
          }
          localStorage.removeItem('chatData');
        }

        this.selectors.formElements.continue.classList.add('hide');
        this.selectors.formElements.prompt.classList.remove('hide');
        this.selectors.formElements.continue.querySelector('input').value = '';
        this.selectors.formElements.prompt.querySelector('input').focus();
      } else {
        // they didn't enter y/n
        this.selectors.formElements.continue.querySelector('input').value = '';
        this.selectors.formElements.continue.querySelector('input').focus();
      }
      return;
    };

    const [prompt] = filteredFormData.filter(data => {
      return data[0] === 'prompt';
    });

    const params = {
      prompt: this.data.chatString + '\nHuman: ' + prompt[1],
      temperature: 0.9,
      max_tokens: 80,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      'stop': '\nHuman'
    };

    // const engine = 'ada';
    const engine = 'curie';
    
    fetch(`https://api.openai.com/v1/engines/${engine}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/JSON',
        'Authorization': `Bearer ${secret_api_key}`
      },
      body: JSON.stringify(params)
    })
    .then(res => res.json())
    .then(data => {
      const newChatData = this.parseGPTResponse(prompt[1], data);
      const newChatItem = this.renderChatItem(newChatData);

      this.selectors.chatbox.prepend(newChatItem);
      this.selectors.chatbotResponse.textContent = `Norma says ${newChatData.response}`;

      this.data = {
        ...this.data,
        chatData: [newChatData, ...this.data.chatData],
        chatString: this.data.chatString + '\nHuman: ' + newChatData.prompt + '\nAI: ' + newChatData.response
      }

      this.selectors.formElements.prompt.querySelector('input').value = '';
      this.selectors.formElements.prompt.querySelector('input').focus();

      localStorage.setItem('chatData', JSON.stringify(this.data));
    })
    .catch(error => console.log(error));
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
    const chat = document.createElement('li');
    chat.className = 'chatbox__chat';
    chat.dataset.id = id;
    chat.innerHTML = `
      <div class='chatbox__chat-prompt'><span class='chatbox__prompt-author'>You</span> ${prompt}</div>
      <div class='chatbox__response'>
      <span class='chatbox__response-author'>Norma</span>
      <span>${response}</span>
      </div>
    `;
    return chat;
  }
}

customElements.define('chat-bot', ChatBot);