import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { DivContentEditable } from "./index.js";

import * as dom from "./dom.js";
jest.mock("./dom.js");

describe("DivContentEditable", () => {
  test("Renders text", () => {
    const { getByText } = render(<DivContentEditable value="Hello" />);
    expect(getByText(/Hello/i)).toBeInTheDocument();
  });
  test("Click fires onClick", async () => {
    const handleClick = jest.fn();
    const { container } = render(<DivContentEditable onClick={handleClick} />);
    container.firstChild.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  test("Focus fires onFocus", async () => {
    const handleFocus = jest.fn();
    const { container } = render(<DivContentEditable onFocus={handleFocus} />);
    container.firstChild.focus();
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });
  test("AutoFocus fires onFocus", async () => {
    const handleFocus = jest.fn();
    render(<DivContentEditable autoFocus onFocus={handleFocus} />);
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });
  test("Blur fires onFocusLost", async () => {
    const handleFocusLost = jest.fn();
    const { container } = render(
      <DivContentEditable onFocusLost={handleFocusLost} />
    );
    fireEvent.focusOut(container.firstChild);
    expect(handleFocusLost).toHaveBeenCalledTimes(1);
  });
  test("Key down fires onKeyDown", async () => {
    const handleKeyDown = jest.fn();
    const { container } = render(
      <DivContentEditable onKeyDown={handleKeyDown} />
    );
    fireEvent.keyDown(container.firstChild, { key: "Enter", code: "Enter" });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });
  test("Key down fires on arrow up/down with event being enriched", async () => {
    const rect = { x: 1, y: 2, w: 3, h: 4 };
    dom.hasSelection.mockReturnValueOnce(true);
    dom.getLineCount.mockReturnValueOnce(1);
    dom.getCaretLine.mockReturnValueOnce(0);
    dom.getCaretRect.mockReturnValueOnce(rect);

    const handleKeyDown = jest.fn();
    const { container } = render(
      <DivContentEditable onKeyDown={handleKeyDown} />
    );
    fireEvent.keyDown(container.firstChild, {
      key: "ArrowDown"
    });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
    expect(dom.hasSelection).toHaveBeenCalledTimes(1);
    expect(handleKeyDown.mock.calls[0][0].lineCount).toBe(1);
    expect(handleKeyDown.mock.calls[0][0].caretLine).toBe(0);
    expect(handleKeyDown.mock.calls[0][0].caretRect).toStrictEqual(rect);
  });
  test("Key up fires onKeyUp", async () => {
    const handleKeyUp = jest.fn();
    const { container } = render(<DivContentEditable onKeyUp={handleKeyUp} />);
    fireEvent.keyUp(container.firstChild, { key: "Enter", code: "Enter" });
    expect(handleKeyUp).toHaveBeenCalledTimes(1);
  });
  test("Copy fires onCopy", async () => {
    const handleCopy = jest.fn();
    const { container } = render(<DivContentEditable onCopy={handleCopy} />);
    fireEvent.copy(container.firstChild);
    expect(handleCopy).toHaveBeenCalledTimes(1);
  });
  test("Cut fires onCut", async () => {
    const handleCut = jest.fn();
    const { container } = render(<DivContentEditable onCut={handleCut} />);
    fireEvent.cut(container.firstChild);
    expect(handleCut).toHaveBeenCalledTimes(1);
  });
  test("Paste fires onPaste and onInput", async () => {
    const handlePaste = jest.fn();
    const handleInput = jest.fn();
    const { container } = render(
      <DivContentEditable onPaste={handlePaste} onInput={handleInput} />
    );

    const selection = {
      start: 0,
      anchorNode: container.firstChild,
      getRangeAt: () => {
        return { collapse: jest.fn(), insertNode: jest.fn() };
      }
    };
    window.getSelection = () => selection;

    fireEvent.paste(container.firstChild, {
      clipboardData: { getData: () => "Text" }
    });
    expect(handlePaste).toHaveBeenCalledTimes(1);
    expect(handleInput).toHaveBeenCalledTimes(1);
  });
});
