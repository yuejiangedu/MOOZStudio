/* eslint prefer-arrow-callback: 0 */
const promisify = (
  fn: any,
  options?: {
    thisArg: any;
    errorFirst: boolean;
  }
) =>
  function (...args: any[]) {
    const { errorFirst = true, thisArg } = { ...options };

    return new Promise((resolve, reject) => {
      args.push(function (...results: any[]) {
        if (errorFirst) {
          const err = results.shift();
          if (err) {
            reject(err);
            return;
          }
        }

        if (results.length > 1) {
          resolve(results);
        } else if (results.length === 1) {
          resolve(results[0]);
        } else {
          resolve(null);
        }
      });

      if (typeof fn !== "function") {
        reject(new TypeError("The first parameter must be a function"));
        return;
      }

      fn.apply(thisArg, args);
    });
  };

export default promisify;
