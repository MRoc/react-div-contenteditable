# React Div ContentEditable

The package provides a small functional React component for a content editable div limited to plain text (no formatting "bold", "italic", etc.).


# Installation

```
npm install @mroc/react-div-contenteditable
```


## Example

```
import DivContentEditable from "@mroc/react-div-contenteditable";

...
    <DivContentEditable
        value={text0}
        placeholder="Type here..."
        autofocus={true}
        lastCaretRect={undefined}
        onClick={hndleClick}
        onInput={handleInput}
        onFocus={handleFocus}
        onFocusLost={handleFocusLost}
        onKeyDown={handleKeyDown}
        onKeyDown={handleKeyUp}
        onCopy={handleCopy}
        onCut={handleCut}
        onPaste={handlePaste}
    />
```