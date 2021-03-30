import {
  getContainingDiv,
  getText,
  getFirstChildOrElement,
  getPaddedSize,
  getLineHeight,
  getLineCount,
  getCaretRect,
  getCaretRectByIndex,
  getCaretRects,
  calculateDistance,
  findNearestCaretStart,
  getCaretLine,
  getDomSelection,
  setDomSelection,
  insertTextAtSelection
} from "./dom.js";

function createElementWithMockedSelection(
  type = "Caret",
  elementProperties = {},
  selectionProperties = {},
  rangeProperties = {},
  caretProperties = { left: 2, top: 3, width: 4, height: 5 }
) {
  const element = {
    ...elementProperties,
    innerText: "ABC",
    firstChild: "child"
  };

  const selection = {
    ...selectionProperties,
    type: type,
    start: 0,
    anchorNode: element
  };

  const range = {
    ...rangeProperties,
    getBoundingClientRect: () => {
      return {
        ...caretProperties,
        left: caretProperties.left * selection.start
      };
    }
  };

  selection.collapse = (_, start) => (selection.start = start);
  selection.getRangeAt = () => range;
  window.getSelection = () => selection;
  window.scrollX = 0;
  window.scrollY = 0;

  return element;
}

describe("getContainingDiv", () => {
  test("With element returns element", () => {
    const element = { nodeType: Node.ELEMENT_NODE };
    const result = getContainingDiv(element);
    expect(result).toBe(element);
  });
  test("text node returns parent element", () => {
    const element = { nodeType: Node.ELEMENT_NODE };
    const node = { nodeType: Node.TEXT_NODE, parentElement: element };
    const result = getContainingDiv(node);
    expect(result).toBe(element);
  });
});

describe("getText", () => {
  test("With node having textContent returns textContent", () => {
    const node = { textContent: "Text" };
    const result = getText(node);
    expect(result).toBe("Text");
  });
  test("With node NOT having textContent returns innerText", () => {
    const node = { innerText: "Text" };
    const result = getText(node);
    expect(result).toBe("Text");
  });
});

describe("getFirstChildOrElement", () => {
  test("With element having child returns child", () => {
    const element = { firstChild: { a: "b" } };
    const result = getFirstChildOrElement(element);
    expect(result).toBe(element.firstChild);
  });
  test("With element having no children returns element", () => {
    const element = {};
    const result = getFirstChildOrElement(element);
    expect(result).toBe(element);
  });
});

describe("getPaddedSize", () => {
  test("With node returns size minus padding", () => {
    const computedStyle = {
      paddingLeft: "1",
      paddingRight: "2",
      paddingTop: "3",
      paddingBottom: "4"
    };
    window.getComputedStyle = jest.fn(() => computedStyle);
    const element = { clientWidth: 10, clientHeight: 20 };
    const result = getPaddedSize(element);
    expect(result).toStrictEqual({ width: 7, height: 13 });
  });
});

describe("getLineHeight", () => {
  test("With element having numeric lineHeight returns lineHeight", () => {
    const element = { style: { lineHeight: "3" } };
    const result = getLineHeight(element);
    expect(result).toBe(3);
  });
  test("With element having NO numeric lineHeight returns lineHeight by shadow rendering", () => {
    document.body.innerHTML = '<div id="test"/>';
    document.body.firstChild.cloneNode = jest.fn(() => {
      const element = document.createElement("div");
      Object.defineProperty(element, "offsetHeight", {
        get: () => {
          return (element.innerHTML.length / "<br>".length) * 10;
        }
      });
      return element;
    });
    const result = getLineHeight(document.body.firstChild);
    expect(result).toBe(10);
  });
});

describe("getLineCount", () => {
  test("With element returns height divided by line height", () => {
    window.getComputedStyle = () => {
      return {
        paddingLeft: "5",
        paddingRight: "5",
        paddingTop: "5",
        paddingBottom: "5"
      };
    };
    window.scrollX = 10;
    window.scrollY = 20;

    const element = {
      clientWidth: 300,
      clientHeight: 60
    };
    const result = getLineCount(element, 10);
    expect(result).toBe(5);
  });
});

describe("getCaretRect", () => {
  test("With window having selection returns based on selection", () => {
    const element = createElementWithMockedSelection();
    const caretRect = getCaretRect(element);
    expect(caretRect).toStrictEqual({ x: 0, y: 3, w: 4, h: 5 });
  });
  test("With selection in empty div returns element offset instead of zero", () => {
    window.getSelection = () => {
      return {
        getRangeAt: () => {
          return {
            getBoundingClientRect: () => {
              return { left: 0, top: 0, width: 0, height: 0 };
            }
          };
        }
      };
    };
    const caretRect = getCaretRect({ offsetLeft: 6, offsetTop: 7 });
    expect(caretRect).toStrictEqual({ x: 6, y: 7, w: 0, h: 0 });
  });
  test("With window having NO selection returns undefined", () => {
    window.getSelection = () => {
      return { type: "None" };
    };
    const caretRect = getCaretRect({});
    expect(caretRect).toBe(undefined);
  });
  test("With window being scrolled returns in document coordinates", () => {
    const element = createElementWithMockedSelection();
    window.scrollX = 10;
    window.scrollY = 20;
    const caretRect = getCaretRect(element);
    expect(caretRect).toStrictEqual({ x: 10, y: 23, w: 4, h: 5 });
  });
});

describe("getCaretRectByIndex", () => {
  test("With element and text-index returns rectangle of caret", () => {
    const collapse = jest.fn();
    window.getSelection = () => {
      return {
        collapse: collapse,
        getRangeAt: () => {
          return {
            getBoundingClientRect: () => {
              return { left: 1, top: 2, width: 3, height: 4 };
            }
          };
        }
      };
    };
    window.scrollX = 0;
    window.scrollY = 0;

    const element = { firstChild: "child" };
    const result = getCaretRectByIndex(element, 10);
    expect(result).toStrictEqual({
      x: 1,
      y: 2,
      w: 3,
      h: 4,
      start: 10,
      length: 0
    });
    expect(collapse.mock.calls).toEqual([["child", 10]]);
  });
});

describe("getCaretRects", () => {
  test("With element returns rectangles of each selection", () => {
    const element = createElementWithMockedSelection();
    const result = getCaretRects(element);
    expect(result).toEqual([
      { x: 0, y: 3, w: 4, h: 5, start: 0, length: 0 },
      { x: 2, y: 3, w: 4, h: 5, start: 1, length: 0 },
      { x: 4, y: 3, w: 4, h: 5, start: 2, length: 0 },
      { x: 6, y: 3, w: 4, h: 5, start: 3, length: 0 }
    ]);
  });
});

describe("calculateDistance", () => {
  test("With two points returns eullidean distance", () => {
    const result = calculateDistance(1, 1, 2, 2);
    expect(result).toBe(Math.sqrt(2));
  });
});

describe("calculateDistance", () => {
  test("With two points returns eullidean distance", () => {
    const result = calculateDistance(1, 1, 2, 2);
    expect(result).toBe(Math.sqrt(2));
  });
});

describe("findNearestCaretStart", () => {
  test("With element returns caret index nearest to given position", () => {
    const element = createElementWithMockedSelection();
    const result = findNearestCaretStart(element, { x: 2, y: 10 });
    expect(result).toStrictEqual(1);
  });
});

describe("getCaretLine", () => {
  test("With element returns line of caret", () => {
    const element = createElementWithMockedSelection(
      "Caret",
      {
        offsetTop: 0,
        getClientRects: () => {
          return [{ height: 100 }];
        }
      },
      {},
      {},
      {
        top: 30,
        height: 10
      }
    );
    const result = getCaretLine(element, 10);
    expect(result).toBe(3);
  });
});

describe("getDomSelection", () => {
  test("With element returns index if caret", () => {
    const element = { nodeType: Node.ELEMENT_NODE };
    window.getSelection = () => {
      return {
        type: "Caret",
        anchorNode: element,
        getRangeAt: () => {
          return {
            startOffset: 2,
            endOffset: 2
          };
        }
      };
    };
    const domSelection = getDomSelection(element);
    expect(domSelection).toStrictEqual({ start: 2, end: 2 });
  });
  test("With wrong element returns undefined", () => {
    const element = { nodeType: Node.ELEMENT_NODE };
    window.getSelection = () => {
      return {
        type: "Caret",
        anchorNode: {},
        getRangeAt: () => {
          return {};
        }
      };
    };
    const domSelection = getDomSelection(element);
    expect(domSelection).toBe(undefined);
  });
  test("With no selection returns undefined", () => {
    const element = { nodeType: Node.ELEMENT_NODE };
    window.getSelection = () => {
      return {
        type: "None",
        anchorNode: element,
        getRangeAt: () => {
          return {};
        }
      };
    };
    const domSelection = getDomSelection(element);
    expect(domSelection).toBe(undefined);
  });
});

describe("setDomSelection", () => {
  test("With element and selection sets selection", () => {
    const element = {};
    const selection = { collapse: jest.fn() };
    window.getSelection = () => selection;

    setDomSelection(element, { start: 3, end: 3 });

    expect(selection.collapse.mock.calls).toEqual([[element, 3]]);
  });
  test("With element.firstChild and selection sets selection", () => {
    const firstChild = { a: "b" };
    const selection = { collapse: jest.fn() };
    window.getSelection = () => selection;

    setDomSelection({ firstChild }, { start: 3, end: 3 });

    expect(selection.collapse.mock.calls).toEqual([[firstChild, 3]]);
  });
  test("With element.firstChild and range sets range", () => {
    const firstChild = { a: "b" };

    const selection = { removeAllRanges: jest.fn(), addRange: jest.fn() };
    window.getSelection = () => selection;

    const range = {
      setStart: jest.fn(),
      setEnd: jest.fn()
    };
    document.createRange = () => range;

    setDomSelection({ firstChild }, { start: 3, end: 2 });

    expect(selection.removeAllRanges.mock.calls.length).toBe(1);
    expect(selection.addRange.mock.calls).toEqual([[range]]);
  });
  test("With no selection removes selection", () => {
    const selection = { removeAllRanges: jest.fn() };
    window.getSelection = () => selection;

    setDomSelection({}, undefined);

    expect(selection.removeAllRanges.mock.calls).toEqual([[]]);
  });
});

describe("insertTextAtSelection", () => {
  test("With text inserts text node in document", () => {
    const range = { collapse: jest.fn(), insertNode: jest.fn() };
    const element = {
      nodeType: Node.ELEMENT_NODE,
      normalize: jest.fn()
    };
    createElementWithMockedSelection("Caret", element, {}, range, {});
    insertTextAtSelection("ABC");

    expect(range.insertNode.mock.calls.length).toBe(1);
    expect(range.collapse.mock.calls.length).toBe(1);
    expect(element.normalize.mock.calls.length).toBe(1);
  });
});
