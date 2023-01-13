export function trimStart(character: string, string: string) {
  let startIndex = 0;

  while (string[startIndex] === character) {
    startIndex += 1;
  }

  return string.substr(startIndex);
}

function reverse(string: string) {
  return string?.split("").reverse().join("") || "";
}

export function trimEnd(character: string, string: string) {
  return reverse(trimStart(character, reverse(string)));
}
