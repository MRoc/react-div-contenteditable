import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import styles from "./styles.module.css";
import {
  findNearestCaretStart,
  hasSelection,
  getCaretLine,
  getCaretRect,
  isEqualCaretRect,
  getDomSelection,
  getLineHeight,
  getLineCount,
  getText,
  insertTextAtSelection,
  setDomSelection
} from "./dom.js";

export function DivContentEditable(props) {
  const divRef = useRef(null);
  const [selection, setSelection] = useState();
  const [selectionRequest, setSelectionRequest] = useState();

  useEffect(() => {
    const element = divRef.current;

    // Firefox only: When deleting last char, a text note with '\n' is left over.
    // The placeholder will not re-appear until the text-node is gone.
    if (element.firstChild && getText(element.firstChild) === "\n") {
      element.removeChild(element.firstChild);
    }

    // If there is a selection request with autofocus, set caret.
    // This request will only be executed once (transient).
    const setDomSelectionToSelectionRequest =
      props.autoFocus &&
      props.selection &&
      !isEqualCaretRect(props.selection, selectionRequest);

    if (setDomSelectionToSelectionRequest) {
      setSelectionRequest(props.selection);
      setDomSelection(
        element,
        selectionRequestToSelection(element, props.selection)
      );
    }

    if (props.autoFocus) {
      element.focus();
    }

    // Restore selection from state after React update cycle if still having the focus
    const setDomSelectionToLastSelection =
      selection &&
      element === document.activeElement &&
      !setDomSelectionToSelectionRequest;

    if (setDomSelectionToLastSelection) {
      setDomSelection(element, selection);
    }
  });

  const handleClick = (e) => {
    if (props.onClick) {
      e.selection = getDomSelection(divRef.current);
      props.onClick(e);
    }
  };

  const handleFocus = (e) => {
    setSelectionRequest(undefined);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleFocusLost = (e) => {
    setSelection(undefined);
    setSelectionRequest(undefined);
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
    if (hasSelection() && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      const lineHeight = getLineHeight(divRef.current);
      e.lineCount = getLineCount(divRef.current, lineHeight);
      e.caretLine = getCaretLine(divRef.current, lineHeight);
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
        handleInput(e);
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

function selectionRequestToSelection(element, selection) {
  switch (selection.type) {
    case "position": {
      const start = findNearestCaretStart(element, selection);
      return { start, end: start };
    }
    case "index": {
      return selection;
    }
    default:
      throw new Error(`Unknown selection type '${selection.type}'`);
  }
}

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

export function caretByPosition({ x, y }) {
  return { type: "position", x, y };
}

export function caretByIndex({ start, end }) {
  return { type: "index", start, end };
}

DivContentEditable.propTypes = {
  // text to display.
  value: PropTypes.string,

  // Placeholder text shown if value is empty.
  placeholder: PropTypes.string,

  // If set to true, focus is requested with each render.
  autoFocus: PropTypes.bool,

  // If autoFocus is true, the caret is set to match either by cartesian-nearest position or by index.
  //
  // This is a transient property which is only applied once until it changes.
  //
  // { type: "position", x: number, y: number }
  // { type: "index",  start: number, end: number }
  //
  selection: PropTypes.object,

  // Additional styles applied to the div.
  style: PropTypes.object,

  // Called if div is clicked.
  onClick: PropTypes.func,

  // Called if div receives the focus.
  onFocus: PropTypes.func,

  // Called if div looses the focus.
  onFocusLost: PropTypes.func,

  // Called on key-down. ArrowUp and ArrowDown events are enriched with
  // last caret position, number of lines and current caret line.
  onKeyDown: PropTypes.func,

  // Called on key-up.
  onKeyUp: PropTypes.func,

  // Called if the value has changed due to input or pasting text.
  onInput: PropTypes.func,

  // Called on paste.
  onPaste: PropTypes.func,

  // Called on copy.
  onCopy: PropTypes.func,

  // Called on cut.
  onCut: PropTypes.func
};
