export function getContainingDiv(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return node.parentElement;
  } else {
    return node;
  }
}

export function getText(node) {
  return node.textContent ? node.textContent : node.innerText;
}

export function getFirstChildOrElement(element) {
  return element.firstChild || element;
}

export const getPaddedSize = (node) => {
  const computedStyle = window.getComputedStyle(node);
  return {
    width:
      node.clientWidth -
      parseFloat(computedStyle.paddingLeft) -
      parseFloat(computedStyle.paddingRight),
    height:
      node.clientHeight -
      parseFloat(computedStyle.paddingTop) -
      parseFloat(computedStyle.paddingBottom)
  };
};

export function getLineHeight(element) {
  let lineHeight = parseInt(element.style.lineHeight);

  if (isNaN(lineHeight)) {
    const clone = document.createElement(element.nodeName);
    clone.style.fontSize = window.getComputedStyle(element)["font-size"];
    clone.style.padding = "0px";
    clone.style.border = "0px";
    clone.innerHTML = "&nbsp;";
    element.appendChild(clone);
    lineHeight = clone.offsetHeight;
    element.removeChild(clone);
  }

  return lineHeight;
}

export function getLineCount(element, lineHeight) {
  const { height } = getPaddedSize(element);
  return Math.round(height / lineHeight);
}

export function hasSelection() {
  return window.getSelection().type !== "None";
}

export function getCaretRect(element) {
  if (hasSelection()) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const clientRect = range.getBoundingClientRect();
    if (clientRect.height > 0) {
      return {
        x: window.scrollX + clientRect.left,
        y: window.scrollY + clientRect.top,
        w: clientRect.width,
        h: clientRect.height
      };
    } else {
      return { x: element.offsetLeft, y: element.offsetTop, w: 0, h: 0 };
    }
  }
}

export function isEqualCaretRect(a, b) {
  return (
    (a && b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h) ||
    (!a && !b)
  );
}

export function clip(value, min, max) {
  return value > max ? max : value < min ? min : value;
}

export function calculateDistance(x0, y0, x1, y1) {
  return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
}

export function getCaretRectByIndex(element, start) {
  const selection = window.getSelection();
  const nodeToSelect = getFirstChildOrElement(element);
  selection.collapse(nodeToSelect, start);

  return {
    ...getCaretRect(element),
    start,
    length: 0
  };
}

export function getCaretRects(element) {
  const result = [];
  for (let i = 0; i < element.innerText.length + 1; ++i) {
    result.push(getCaretRectByIndex(element, i));
  }
  return result;
}

export function findNearestCaretStart(element, position) {
  let minDistance;
  let next;
  const rects = getCaretRects(element);
  for (const rect of rects) {
    const distance = calculateDistance(rect.x, rect.y, position.x, position.y);
    if (!next || distance < minDistance) {
      next = rect;
      minDistance = distance;
    }
  }
  return next ? next.start : 0;
}

export function getCaretLine(element, lineHeight) {
  const caretRectY = getCaretRect(element).y - element.offsetTop;
  return Math.round(caretRectY / lineHeight);
}

export function getDomSelection(element) {
  const selection = window.getSelection();
  if (
    selection.type !== "None" &&
    (!element || getContainingDiv(selection.anchorNode) === element)
  ) {
    const range = selection.getRangeAt(0);
    return {
      start: range.startOffset,
      end: range.endOffset
    };
  }
}

export function setDomSelection(element, selection) {
  const windowSelection = window.getSelection();
  if (selection) {
    const nodeToSelect = getFirstChildOrElement(element);
    const textLength = getText(element).length;
    const start = clip(selection.start, 0, textLength);
    const end = clip(selection.end, 0, textLength);
    if (end === undefined || start === end) {
      windowSelection.collapse(nodeToSelect, start);
    } else {
      const range = document.createRange();
      range.setStart(nodeToSelect, start);
      range.setEnd(nodeToSelect, end);
      windowSelection.removeAllRanges();
      windowSelection.addRange(range);
    }
  } else {
    windowSelection.removeAllRanges();
  }
}

export function insertTextAtSelection(text) {
  const selection = window.getSelection();

  const range = selection.getRangeAt(0);
  const element = getContainingDiv(selection.anchorNode);

  range.deleteContents();
  range.insertNode(document.createTextNode(text));

  const selectionAfterInsert = getDomSelection(element);

  element.normalize();
  setDomSelection(element, {
    start: selectionAfterInsert.start + text.length
  });
}
