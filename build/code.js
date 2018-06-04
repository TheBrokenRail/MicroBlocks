window.onload = function () {
  let workspace = window.Blockly.inject('blocks', {
    media: '/editor/media/',
    toolbox: document.getElementById('toolbox'),
    zoom: {
      controls: true,
      wheel: true,
      startScale: 0.75
    },
    colours: {
      fieldShadow: 'rgba(255, 255, 255, 0.3)',
      dragShadowOpacity: 0.6
    }
  });
  window.workspace = workspace;

  let extensionsList = ['primitives'];
  util.loadExtensions(extensionsList, () => {
    workspace.registerToolboxCategoryCallback('METHODS', util.methodsCallback);
    Blockly.Xml.domToWorkspace(document.getElementById('workspace'), workspace);
    workspace.scrollCenter();
  });

  let css = window.Blockly.Css.styleSheet_.cssRules;
  for (i = 0; i < css.length; i++) {
    if (css[i].selectorText === '.blocklyDragging > .blocklyPath, .blocklyDragging > .blocklyPathLight') {
      css[i].style.fillOpacity = '';
    }
  }

  document.getElementById('save').onclick = function () {
    let name = document.getElementById('name').value;
    if (!name || name === '') {
      name = 'Untitled';
    }
    let project = {};
    project.extensions = extensionsList;
    project.name = name;
    let xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(window.workspace));
    project.blocks = JSON.parse(window.xml2json.toJson(xml));
    let json = JSON.stringify(project, null, 4);
    let hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI(json);
    hiddenElement.target = '_blank';
    hiddenElement.download = name + '.json';
    hiddenElement.click();
  };

  document.getElementById('load').onclick = function() {
    let input = document.createElement('INPUT');
    input.type = 'file';
    input.onchange = function () {
      if (input.files[0]) {
        let reader = new FileReader();
        reader.onload = function() {
          try {
            let text = reader.result;
            workspace.clear();
            let project = JSON.parse(text);
            extensionsList = project.extensions;
            util.loadExtensions(extensionsList, () => {
              document.getElementById('name').value = project.name;
              let xml = Blockly.Xml.textToDom(window.xml2json.toXml(JSON.stringify(project.blocks)));
              console.log(xml);
              Blockly.Xml.domToWorkspace(xml, workspace);
            });
          } catch (e) {
            document.getElementById('name').value = "Untitled";
            workspace.clear();
            Blockly.Xml.domToWorkspace(document.getElementById('workspace'), workspace);
            alert("Error: Invalid or Corrupt File");
            throw "Invalid or Corrupt File";
          }
        };
        reader.readAsText(input.files[0]);
      }
    };
    input.click();
  };

  document.getElementById('export').onclick = function () {
    console.log(util.generate(workspace));
  };

  document.getElementById('about').onclick = function () {
    document.getElementById('aboutBox').style.display = 'initial';
  };
  
  window.buildExtensions_ = () => {
    let extensions = document.getElementById('extensions');
    let extensionBox = document.getElementById('extensionBoxContent');
    extensionBox.innerHTML = '';
    for (let i = 0; i < extensions.childNodes.length; i++) {
      if (extensions.childNodes[i].nodeName === 'EXTENSION') {
        if (extensionsList.indexOf(extensions.childNodes[i].getAttribute('name')) === -1) {
          let div = document.createElement('DIV');
          div.setAttribute('class', 'extension');
          let title = document.createElement('P');
          title.appendChild(document.createTextNode(extensions.childNodes[i].getAttribute('display')));
          div.appendChild(title);
          let description = document.createElement('P');
          description.appendChild(document.createTextNode(extensions.childNodes[i].getAttribute('description')));
          description.style.color = 'grey';
          div.appendChild(description);
          div.onclick = () => {
            extensionsList.push(extensions.childNodes[i].getAttribute('name'));
            document.getElementById('extensionBox').style.display = 'none';
            util.loadExtension(extensions.childNodes[i].getAttribute('name'), true);
          };
          extensionBox.appendChild(div);
        }
      }
    }
  };
  
  document.getElementById('addExtension').onclick = function () {
    document.getElementById('extensionBox').style.display = 'initial';
    window.buildExtensions_();
  };
  
  document.getElementById('closeExtensions').onclick = function () {
    document.getElementById('extensionBox').style.display = 'none';
  };

  document.getElementById('closeAbout').onclick = function () {
    document.getElementById('aboutBox').style.display = 'none';
  };
};
