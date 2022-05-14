console.log('gpt3');

class ChatBot extends HTMLElement {
  constructor () {
    super();
    this.form = this.querySelector('.chatbot__form');
    this.prompt = this.querySelector('.chatbot__input');
    this.chatbox = this.querySelector('.chatbox');

    this.form.addEventListener('submit', this.handlePromptSubmit);
  }

  handlePromptSubmit = (evt) => {
    evt.preventDefault();
    console.log(this);
    const formData = new FormData(this.querySelector('.chatbot__form'));


    let prompt = [...formData][0][1];

    const apiKey = secret_api_key;
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
  
  
    fetch('https://api.openai.com/v1/engines/ada/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/JSON',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(params)
    })
    .then(res => res.json())
    .then(data => {
      console.log(prompt)
      console.log(data);

      const chat = document.createElement('li');
      chat.className = 'chatbox__chat';
      chat.dataset.created = data.created;
      chat.innerHTML = `
        <div>Prompt: ${prompt}</div>
        <div>Response: ${data.choices[0].text}</div>
      `;
      this.chatbox.appendChild(chat);
    })
    .catch(error => console.log(error));
  } 
}

customElements.define('chat-bot', ChatBot);