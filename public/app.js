console.log('gpt3');


!(() => {
  const apiKey = secret_api_key;
  const params = {
    prompt: 'hello world',
    temperature: 0.7,
    max_tokens: 60
  };


  fetch('https://api.openai.com/v1/engines/davinci/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(params)
  })
  .then(res => res.json())
  .then(data => {
    console.log(data.choices[0].text);
  })
  .catch(error => console.log(error));
})();