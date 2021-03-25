import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import styles from "./styles.module.css";
import {
  findNearestCaretStart,
  getCaretLine,
  getCaretRect,
  getDomSelection,
  getLineCount,
  getText,
  insertTextAtSelection,
  setDomSelection
} from "./dom.js";

function isAllowedKeyDown(e) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case "B":
      case "b":
        return false;
      case "I":
      case "i":
        return false;
      case "U":
      case "u":
        return false;
      default:
        break;
    }
  }

  return true;
}

function DivContentEditable(props) {
  const divRef = useRef(null);
  const [selection, setSelection] = useState();

  useEffect(() => {
    const element = divRef.current;

    // Firefox only: When deleting last char, a text note with '\n' is left over.
    // The placeholder will not re-appear until the text-node is gone.
    if (element.firstChild && getText(element.firstChild) === "\n") {
      element.removeChild(element.firstChild);
    }

    if (props.autoFocus) {
      // Set selection to nearest location from last caret rect
      if (props.lastCaretRect) {
        setDomSelection(element, {
          start: findNearestCaretStart(element, props.lastCaretRect)
        });
      }

      element.focus();
    }

    // Restore selection from state after React update cycle if still having the focus
    if (selection && element === document.activeElement) {
      setDomSelection(element, selection);
    }
  });

  const handleClick = (e) => {
    if (props.onClick) {
      props.onClick(e);
    }
  };

  const handleFocus = (e) => {
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleFocusLost = (e) => {
    setSelection(undefined);
    if (props.onFocusLost) {
      props.onFocusLost(e);
    }
  };

  const handleKeyDown = (e) => {
    // All commands that would add formatting (including Enter) are suppressed.
    if (!isAllowedKeyDown(e)) {
      e.preventDefault();
    }

    // If key is arrow keys, enrich event with information about cursor
    // position so that client application has possibility to move focus.
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.lineCount = getLineCount(divRef.current);
      e.caretLine = getCaretLine(divRef.current);
      e.caretRect = getCaretRect(divRef.current);
    }

    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  const handleKeyUp = (e) => {
    if (props.onKeyUp) {
      props.onKeyUp(e);
    }
  };

  const handleInput = (e) => {
    const selection = getDomSelection(divRef.current);

    // Store selection to be able to re-store after React update cycle.
    setSelection(selection);

    // Set selection to none so that there is no flickering during the update cycle.
    setDomSelection(divRef.current, null);

    if (props.onInput) {
      props.onInput(e);
    }
  };

  const handleCopy = (e) => {
    if (props.onCopy) {
      props.onCopy(e);
    }
  };

  const handleCut = (e) => {
    if (props.onCut) {
      props.onCut(e);
    }
  };

  const handlePaste = (e) => {
    // Give client the chance to handle the event.
    if (props.onPaste) {
      props.onPaste(e);
    }

    // All commands that would add formatting (including paste) are suppressed.
    // If client did not handle paste, force paste as text.
    if (!e.defaultPrevented && e.clipboardData) {
      e.stopPropagation();
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      if (text && text.length > 0) {
        insertTextAtSelection(text);
        if (props.onInput) {
          props.onInput(e);
        }
      }
    }
  };

  return (
    <div
      contentEditable="true"
      suppressContentEditableWarning="true"
      ref={divRef}
      className={styles.dce}
      style={props.style}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleFocusLost}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onInput={handleInput}
      onCopy={handleCopy}
      onCut={handleCut}
      onPaste={handlePaste}
      placeholder={props.placeholder}
    >
      {props.value}
    </div>
  );
}

DivContentEditable.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  lastCaretRect: PropTypes.object,
  style: PropTypes.object,
  onClick: PropTypes.func,
  onFocus: PropTypes.func,
  onFocusLost: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyUp: PropTypes.func,
  onInput: PropTypes.func,
  onPaste: PropTypes.func,
  onCopy: PropTypes.func,
  onCut: PropTypes.func
};

export default DivContentEditable;
