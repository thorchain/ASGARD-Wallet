export const rainbowStop = h => {
  const f = (n, k = (n + h * 12) % 12) =>
    0.5 - 0.5 * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  const rgb2hex = (r, g, b) =>
    '#' +
    [r, g, b]
      .map(x =>
        Math.round(x * 255)
          .toString(16)
          .padStart(2, 0),
      )
      .join('');

  return rgb2hex(f(0), f(8), f(4));
};

export const getIntFromName = str => {
  const inputStr = String(str).toUpperCase();

  const div = 22;

  const firstInt = (inputStr.charCodeAt(0) - 'A'.charCodeAt(0)) / div;
  const secondInt =
    inputStr.length > 1
      ? (inputStr.charCodeAt(1) - 'A'.charCodeAt(0)) / div
      : 0;

  return [firstInt.toFixed(2), secondInt.toFixed(2)];
};
