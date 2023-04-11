import {materializeState} from '../state';

const submit = (data) =>
  fetch('/.netlify/functions/catch', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {'Content-Type': 'application/json'},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
  })
    .then((x) => x.json())
    .catch((e) => {
      console.log(e);
    });

function script() {
  document.querySelector('#submit').addEventListener('click', () => {
    console.log('clicked submit');
    materializeState().then((data) => {
      console.log(data);
      submit(data);
    });
  });
}

const content =
  /* html */
  `
<div>
    <button id="submit">SUBMIT</button>
</div>
`;

export default {content, script};
