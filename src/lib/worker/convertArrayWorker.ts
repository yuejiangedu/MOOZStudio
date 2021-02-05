const ctx: Worker = self as any;
ctx.addEventListener("message", (e) => {
  const { arr, width, isText } = e.data;
  const newArr = [];
  let innerArr = [];
  for (let index = 0; index < arr.length; index += 4) {
    let pixel = 0;
    if (isText) {
      pixel = (arr[index + 3] ? 0 : 255);
    } else {
      pixel = arr[index];
    }
    innerArr.push(pixel);
    if (innerArr.length >= width) {
      newArr.push(innerArr);
      innerArr = [];
    }
  }
  ctx.postMessage(newArr);
});
