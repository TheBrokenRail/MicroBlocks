const downloadFile = (data, name) => {
  let element = document.createElement('A');
  let file = new Blob([data], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = name;
  element.click();
};
export downloadFile;
