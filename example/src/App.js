import React, { useState } from "react";

import { DivContentEditable } from "@mroc/react-div-contenteditable";
import "@mroc/react-div-contenteditable/dist/index.css";

const App = () => {
  const [text, setText] = useState(
    "We're all editable divs that resizes nicely! Click me and start typing..."
  );
  const handleInput = (e) => {
    setText(e.target.innerText);
  };
  const style = {
    margin: "10px",
    padding: "10px",
    maxWidth: "200px",
    background: "#FAFAFA"
  };

  return (
    <div>
      <DivContentEditable
        style={style}
        placeholder="Type here..."
        onClick={(e) => console.log(`onClick '${e.target.innerText}'`)}
        onFocus={(e) => console.log(`onFocus '${e.target.innerText}'`)}
        onFocusLost={(e) => console.log(`onFocusLost '${e.target.innerText}'`)}
        onKeyDown={(e) =>
          console.log(
            `onKeyDown '${e.target.innerText}' lineCount=${
              e.lineCount
            } caretLine=${e.caretLine} caretRect=${JSON.stringify(e.caretRect)}`
          )
        }
        onKeyUp={(e) => console.log(`onKeyUp '${e.target.innerText}'`)}
        onInput={(e) => console.log(`onInput '${e.target.innerText}'`)}
        onPaste={(e) => console.log(`onPaste '${e.target.innerText}'`)}
        onCopy={(e) => console.log(`onCopy '${e.target.innerText}'`)}
        onCut={(e) => console.log(`onCut '${e.target.innerText}'`)}
      />
      <DivContentEditable
        style={style}
        value={text}
        onInput={handleInput}
        placeholder="Type here..."
      />
      <DivContentEditable style={style} placeholder="Type here..." />
    </div>
  );
};

export default App;
