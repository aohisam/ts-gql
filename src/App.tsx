import React, { useEffect, useState } from 'react';
import { API } from 'aws-amplify';
import './App.css';
import { listNotes } from './graphql/queries';
import { createNote } from './graphql/mutations';
import { onCreateNote } from './graphql/subscriptions';


function App() {
  type NoteType = {
    id: string,
    text: string,
    name: string,
  }
  const [notes, setNotes] = useState<NoteType[]>([]);
  useEffect(() => {
    const fetchNote = async () => {
      const apiData = await API.graphql({ query: listNotes });
      if ("data" in apiData) {
        console.log(apiData.data.listNotes.items);
        setNotes(apiData.data.listNotes.items);
      }
    }
    fetchNote();
  }, [])

  type inputTextType = {
    text: string,
    name: string,
  }
  const initialText = { text: "", name: "" };
  const [inputText, setInputText] = useState<inputTextType>(initialText);
  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "text") {
      setInputText({ ...inputText, 'text': e.target.value });
    };
    if (e.target.name === "name") {
      setInputText({ ...inputText, 'name': e.target.value });
    }
  }

  const gqlSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!inputText.name) {
      return;
    }
    await API.graphql({ query: createNote, variables: { input: inputText } });
    setInputText(initialText);
  }

  useEffect(() => {
    const fetch = async () => {

      const subscription = await API.graphql({ query: onCreateNote });
      if ("subscribe" in subscription) {
        subscription.subscribe({
          next: ({ value: { data } }: any) => {
            if (data.onCreateNote) {
              setNotes([...notes, data.onCreateNote]);
            }
          }
        })
      }
    }
    fetch();
  }, [])


  return (
    <div className="App">
      <div className="query-section">
        {notes.map(({ id, name, text }) => (
          <li key={id}>
            {name}
            {text}
          </li>
        ))}
      </div>
      <div className="mutation-section">

        <input value={inputText.text} type="text" name="text" onChange={(e) => handleText(e)} />

        <input value={inputText.name} type="text" name="name" onChange={(e) => handleText(e)} />

        <button onClick={(e) => gqlSubmit(e)} >登録</button>
      </div>
    </div>
  );
}

export default App;