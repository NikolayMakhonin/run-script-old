export function createHtmlElementMatches({
  tagNames,
  classNames,
  selector
}) {
  return element => {
    if (tagNames) {
      if (typeof tagNames === 'string') {
        if (element.nodeName === tagNames) {
          return true;
        }
      } else if (tagNames.indexOf(element.nodeName) >= 0) {
        return true;
      }
    }

    if (classNames) {
      if (typeof classNames === 'string') {
        if (element.classList.contains(classNames)) {
          return true;
        }
      } else if (classNames.some(className => element.classList.contains(className))) {
        return true;
      }
    }

    if (selector && element.matches(selector)) {
      return true;
    }

    return false;
  };
}
export function getPatentElement(element, matchesFunc) {
  while (element && !matchesFunc(element)) {
    element = element.parentElement;
  }

  return element;
}