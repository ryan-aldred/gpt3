console.log('gpt3');

class ChatBot extends HTMLElement {
  constructor () {
    super();
    this.form = this.querySelector('.chatbot__form');
    this.prompt = this.querySelector('.chatbot__input');
    this.chatbox = this.querySelector('.chatbox');
    this.chatData = [];

    this.form.addEventListener('submit', this.handlePromptSubmit);
  }

  handlePromptSubmit = (evt) => {
    evt.preventDefault();
    console.log(this);

    const formData = new FormData(this.form);
    let prompt = [...formData][0][1];
    console.log(prompt);

    // [...formData].map(data => {
    //   console.log(data[0], ': ', data[1]);
    // })
    // return;

    const chatLog = 'Human: Hello, who are you?\nAI: I am doing great. How can I help you today?\n';
    const question = 'Could you tell me what your favorite German thrash metal album is?';

    const params = {
      prompt: `${chatLog}Human: ${prompt}`,
      temperature: 0.9,
      max_tokens: 140,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      'stop': '\nHuman'
    };
    
  //   fetch('https://api.openai.com/v1/engines/ada/completions', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/JSON',
  //       'Authorization': `Bearer ${secret_api_key}`
  //     },
  //     body: JSON.stringify(params)
  //   })
  //   .then(res => res.json())
  //   .then(data => {
  //     console.log(prompt)
  //     console.log(data);

  //     const chatData = this.parseGptResponse(prompt, data);
  //     this.renderChatItem(chatData);
  //   })
  //   .catch(error => console.log(error));


    // cut down on api requests made during prototyping
    const data = {
      created: Date.now(),
      choices: [
        {
          text: 'this is dummy data'
        }
      ]
    }

    // parse the chat data for what we need
    const newChatData = this.parseGptResponse(prompt, data);
    // take chatdata, add it to the chat history array,
    this.chatData.push(newChatData);
    // re-sort the array, optimizing for moving the last time directly to the front
    // render the new chat data item in front of the existing chat data
    const newChatItem = this.renderChatItem(newChatData);
    this.chatbox.prepend(newChatItem);



    console.log(this.chatData);
  }

  parseGptResponse = (prompt, responseData) => {
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
      <div>Prompt: ${prompt}</div>
      <div>Response: ${response}</div>
      <div>Id: ${id}</div>
    `;
    return chat;
  }
}

customElements.define('chat-bot', ChatBot);