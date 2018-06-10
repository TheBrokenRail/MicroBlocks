const downloadFile = (data, name) => {
  let element = document.createElement('A');
  let file = new Blob([data], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = name;
  element.click();
};
const uploadFile = callback => {
  let input = document.createElement('INPUT');
  input.type = 'file';
  input.addEventListener('change', () => {
    if (input.files[0]) {
      let reader = new FileReader();
      reader.onload = function () {
        callback(reader.result);
      };
      reader.readAsText(input.files[0]);
    }
  });
  input.click();
};
export { downloadFile, uploadFile };
