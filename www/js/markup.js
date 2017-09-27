
/////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Markup
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Markup = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);
   var _viewer = viewer;
 
  var _this = this;
 
  _this.load = function () {
 
    createToolbar();
 
    console.log('Autodesk.ADN.Viewing.Extension.Markup loaded');
 
    return true;
  };
 
  _this.unload = function () {
 
    deleteToolbar();
 
    console.log('Autodesk.ADN.Viewing.Extension.Markup unloaded');
 
    return true;
  };
 
  function createToolbar() {
 
    var toolbar = new Autodesk.Viewing.UI.ToolBar('Markup--ADN');
 
    var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
      'Autodesk.ADN.Viewing.Extension.Markup.ControlGroup'
    );
 
    ctrlGroup.addClass('toolbar-vertical-group');
 
    // Names, icons and tooltips for our toolbar buttons
 
    var names = ['CGB1', 'CGB2', 'CGB3'];
    var icons = ['dashboard', 'fire', 'flash'];
    var tips = ['Dashboard', 'Temperature', 'Power'];
 
    // Operations for when the buttons are clicked
 
    var clicks =
    [
      function () { console.log('Dashboard clicked'); },
      function () { console.log('Temperature clicked'); },
      function () { console.log('Power clicked'); }
    ]
 
    // Operations for when buttons are unclicked (i.e. toggled off)
    // If false, then the button won't have any 'state'
 
    var unclicks =
    [
      function () { console.log('Dashboard clicked'); },
      function () { console.log('Temperature clicked'); }
    ]
 
    // The loop to create our buttons
 
    var button;
 
    for (var i = 0; i < names.length; i++) {
 
      // Start by creating the button
 
      button = new Autodesk.Viewing.UI.Button(
        'Autodesk.ADN.Viewing.Extension.Markup.' + names[i]
      );
 
      // Assign an icon
 
      if (icons[i] && icons[i] !== '') {
        button.icon.classList.add('myicon');
        button.icon.classList.add('glyphicon');
        button.icon.classList.add('glyphicon-' + icons[i]);
      }
 
      // Set the tooltip
 
      button.setToolTip(tips[i]);
 
      // Only create a toggler for our button if it has an unclick operation
 
      if (unclicks[i]) {
        button.onClick = createToggler(button, clicks[i], unclicks[i]);
      }
      else {
        button.onClick = clicks[i];
      }
 
      ctrlGroup.addControl(button);
    }
 
    toolbar.addControl(ctrlGroup);
 
    var toolbarDivHtml = '<div id="divToolbar"> </div>';
 
    $(_viewer.container).append(toolbarDivHtml);
 
    // We want our toolbar to be centered vertically on the page
 
    toolbar.centerToolBar = function () {
      $('#divToolbar').css({
        'top': 'calc(50% + ' + toolbar.getDimensions().height / 2 + 'px)'
      });
    };
 
    toolbar.addEventListener(
      Autodesk.Viewing.UI.ToolBar.Event.SIZE_CHANGED,
      toolbar.centerToolBar
    );
 
    // Start by placing our toolbar off-screen (top: 0%)
 
    $('#divToolbar').css({
      'top': '0%',
      'left': '0%',
      'z-index': '100',
      'position': 'absolute'
    });
 
    $('#divToolbar')[0].appendChild(toolbar.container);
 
    // After a delay we'll center it on screen
 
    setTimeout(function () { toolbar.centerToolBar(); }, 100);
  }
 
  function deleteToolbar() {
    $('#divToolbar').remove();
  }
 
  function createToggler(button, click, unclick) {
    return function () {
      var state = button.getState();
      if (state === Autodesk.Viewing.UI.Button.State.INACTIVE) {
        button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);
        click();
      } else if (state === Autodesk.Viewing.UI.Button.State.ACTIVE) {
        button.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
        unclick();
      }
    };
  }
 
  function setVisibility(panel, flag) {
    if (panel)
      panel.setVisible(flag);
  }
 
  var css = [
 
    '.myicon {',
      'font-size: 20px;',
      'padding-top: 1px !important;',
    '}',
 
    '.toolbar-vertical-group > .adsk-button > .adsk-control-tooltip {',
      'left: 120%;',
      'bottom: 25%;',
    '}'
  ].join('\n');
 
  $('<style type="text/css">' + css + '</style>').appendTo('head');
};

Autodesk.ADN.Viewing.Extension.Markup.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Markup.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.Markup;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.Markup',
  Autodesk.ADN.Viewing.Extension.Markup);
