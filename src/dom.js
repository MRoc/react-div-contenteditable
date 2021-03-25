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
    const clone = element.cloneNode();
    clone.innerHTML = "<br>";
    element.appendChild(clone);
    const singleLineHeight = clone.offsetHeight;
    clone.innerHTML = "<br><br>";
    const doubleLineHeight = clone.offsetHeight;
    element.removeChild(clone);
    lineHeight = doubleLineHeight - singleLineHeight;
  }

  return lineHeight;
}

export function getLineCount(element) {
  const lineHeight = getLineHeight(element);
  const { height } = getPaddedSize(element);
  return Math.round(height / lineHeight);
}

export function getCaretRect(element) {
  const selection = window.getSelection();
  if (selection.type !== "None") {
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
  return Array.prototype.map.call(element.innerText, (_, i) =>
    getCaretRectByIndex(element, i)
  );
}

export function calculateDistance(x0, y0, x1, y1) {
  return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
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

export function getCaretLine(element) {
  const caretRectY = getCaretRect(element).y - element.offsetTop;
  const lineHeight = getLineHeight(element);
  return Math.round(caretRectY / lineHeight);
}

export function getDomSelection(element) {
  const selection = window.getSelection();
  if (
    selection.type !== "None" &&
    getContainingDiv(selection.anchorNode) === element
  ) {
    const range = selection.getRangeAt(0);
    return {
      start: range.startOffset,
      end: range.endOffset
    };
  }
}

export function setDomSelection(element, selection) {
  if (selection) {
    const nodeToSelect = getFirstChildOrElement(element);
    window.getSelection().collapse(nodeToSelect, selection.start);
  } else {
    window.getSelection().removeAllRanges();
  }
}

export function insertTextAtSelection(text) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const element = getContainingDiv(selection.anchorNode);
  const textNode = document.createTextNode(text);

  range.insertNode(textNode);
  range.collapse();
  element.normalize();
}
