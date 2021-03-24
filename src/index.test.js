import React from "react";
import { render, fireEvent } from "@testing-library/react";
import DivContentEditable from "./index.js";

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
  test("Autofocus fires onFocus", async () => {
    const handleFocus = jest.fn();
    render(<DivContentEditable autofocus onFocus={handleFocus} />);
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
  test("Paste fires onPaste", async () => {
    const handlePaste = jest.fn();
    const { container } = render(<DivContentEditable onPaste={handlePaste} />);
    fireEvent.paste(container.firstChild, "Text");
    expect(handlePaste).toHaveBeenCalledTimes(1);
  });
});
