window.onload = function() {
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
  workspace.registerToolboxCategoryCallback('METHODS', methodsCallback);
  window.workspace = workspace;

  util.loadExtension('primitives', () => {
    util.loadExtension('strings', () => {
      Blockly.Xml.domToWorkspace(document.getElementById('workspace'), workspace);
      workspace.scrollCenter();
    });
  });

  let css = window.Blockly.Css.styleSheet_.cssRules;
  for (i = 0; i < css.length; i++) {
    if (css[i].selectorText === '.blocklyDragging > .blocklyPath, .blocklyDragging > .blocklyPathLight') {
      css[i].style.fillOpacity = '';
    }
  }

  document.getElementById('save').onclick = function() {
    var name = document.getElementById('name').value;
    if (!name || name === '') {
      name = 'Untitled';
    }
    var project = {};
    project.name = name;
    var xml = window.Blockly.Xml.workspaceToDom(window.workspace);
    project.blocks = window.xml_js.xml2js(window.Blockly.Xml.domToText(xml), {
      compact: false
    });
    var json = JSON.stringify(project, null, 4);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI(json);
    hiddenElement.target = '_blank';
    hiddenElement.download = name + '.json';
    hiddenElement.click();
  };

  document.getElementById('load').onclick = function() {
    var input = document.createElement('INPUT');
    input.type = 'file';
    input.onchange = function() {
      if (input.files[0]) {
        var reader = new FileReader();
        reader.onload = function() {
          try {
            var text = reader.result;
            workspace.clear();
            var project = JSON.parse(text);
            document.getElementById('name').value = project.name;
            var xml = window.Blockly.Xml.textToDom(window.xml_js.js2xml(project.blocks, {
              compact: false,
              spaces: 2
            }));
            window.Blockly.Xml.domToWorkspace(xml, workspace);
          } catch (e) {
            document.getElementById('name').value = "Untitled";
            workspace.clear();
            window.Blockly.Xml.domToWorkspace(document.getElementById('workspace'), window.workspace);
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
  
  document.getElementById('add_extension').onclick = function () {
    document.getElementById('extensionBox').style.display = 'initial';
    buildExtensions();
  };
  
  function buildExtension() {
    let extensions = document.getElementById('extensions');
    let extensionBox = document.getElementById('extensionBox');
    extensionBox.innerHTML = '';
  }

  document.getElementById('closeAbout').onclick = function () {
    document.getElementById('aboutBox').style.display = 'none';
  };
};
