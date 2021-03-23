import React, { useState } from "react";

import DivContentEditable from "@mroc/react-div-contenteditable";
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
      <DivContentEditable style={style} placeholder="Type here..." />
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