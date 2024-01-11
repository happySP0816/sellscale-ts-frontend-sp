export function convertToTitleCase(str: string): string {
  // Split the string into an array of words
  let words = str.split(' ');

  // Capitalize the first letter of each word
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
  }

  // Join the words back into a sentence
  return words.join(' ');
}