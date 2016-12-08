'use strict';
const isDebugging = (process.env.NODE_ENV == 'development');
const path = require('path');
const url = require('url');
const {
  co
} = require('../../lib/utility.js');
const {
  ipcRenderer,
  remote
} = require('electron');

const {
  BrowserWindow
} = remote;

const {
  addAsyncOn
} = require('../../lib/utility.js');
addAsyncOn(ipcRenderer);

const bgUrl = url.format({
  pathname: path.join(__dirname, '../html/bg.html'),
  protocol: 'file:',
  slashes: true
});

let $ = null,
    bgWindow = null,
    graph = null;
if (isDebugging) {
  bgWindow = new BrowserWindow({
    "show": true,
    "width": 600,
    "height": 600
  });
  bgWindow.webContents.openDevTools();
} else {
  bgWindow = new BrowserWindow({
    "show": false,
    "width": 100,
    "height": 100
  });
}
bgWindow.loadURL(bgUrl);
bgWindow.webContents.on('did-finish-load', function() {
  return init();
});

function init() {
  $ = window.$ = require(path.join(__dirname, './jquery.js'));
  $('.import-map-btn').on('click', importMapFile);
  $('.query-route-btn').on('click', inputOnClick);
  $('.input-text').on('change', function() {
    trigger(function *sendInput() {
      sendToBg('graph-request', $('.input-text').val());
    });
  });
  $('.exchange-btn').on('click', exchangeEnds);
  $('.query-route-wrapper .title').on('click', toggleSlideUpDown).click();
  graph = require(path.join(__dirname, './graph.js'));
  $(window).on('beforeunload', function() {
    bgWindow.close();
    bgWindow = null;
  });
}

function trigger(gen) {
  return co(gen).catch((e) => {
    if (isDebugging && -1 != e.message.indexOf('Object has been destroyed')) {
      console.error('关掉bg窗口后，窗口实体已经被毁灭，就不要再点击这个按钮了啦。可以刷新');
    }
    console.error(e);
  });
}

function sendToBg(eventName) {
  bgWindow.webContents.send
    .apply(bgWindow.webContents, [ eventName,
                                   BrowserWindow.getFocusedWindow().id ]
                                    .concat(Array.prototype.slice.call(arguments, 1)));
}

// click on input
function inputOnClick() {
  const $self = $(this);
  const mapData = $('.main').data('mapData');
  if (!mapData) return;
  const forCar = Number($self.hasClass('query-car-route-btn')),
      fromName = mapData.idOf[$('.route-from .end').text()],
      toName = mapData.idOf[$('.route-to .end').text()];
  const input = `${forCar} ${fromName} ${toName}\n`;
  trigger(function *sendInput() {
    sendToBg('graph-request', input);
  });
}

ipcRenderer.asyncOn('graph-response', function *(event, msg) {
  if (!msg) return;
  $('.query-result').text(msg);
});

// click on import
function importMapFile() {
  trigger(function *() {
    sendToBg('import-map-file');
  });
}

ipcRenderer.asyncOn('map-file-imported', function *(event, mapData) {
  if (!mapData) return;
  $('.main').data('mapData', mapData);
  mapData['idOf'] = {};
  mapData['nameOf'] = {};
  mapData['dataOf'] = {};
  for (let oneSpot of mapData.spots) {
    oneSpot.id = String(oneSpot.id);
    mapData['idOf'][oneSpot.name] = oneSpot.id;
    mapData['nameOf'][oneSpot.id] = oneSpot.name;
    mapData['dataOf'][oneSpot.id] = oneSpot;
  }
  graph.loadGraph(onNodeClick, mapData);
});

// click on exchange
function exchangeEnds() {
  const tmp = $('.route-from .end').text()
  $('.route-from .end').text($('.route-to .end').text());
  $('.route-to .end').text(tmp);

  const selectedSrc = $('.query-route-panel').data('selectedSrc');
  const selectedDest = $('.query-route-panel').data('selectedDest');
  setSelectedNode(selectedDest, 'selectedSrc');
  setSelectedNode(selectedSrc, 'selectedDest');
}

function onNodeClick(nodeId) {
  const mapData = $('.main').data('mapData');
  if (!mapData) return;
  const curSelectedNode = mapData.dataOf[nodeId];
  showSpotInfo(curSelectedNode);
  if ($('.query-route-panel').data('isDoingQuery')) {
    $('.query-route-panel').data('curSelectedNode', null);
    switch ($('.query-route-panel').data('query-state')) {
      case 'NONE_SELECTED':
        setSelectedNode(curSelectedNode, 'selectedSrc', 'ONLY_SRC_SELECTED');
        break;
      case 'ONLY_SRC_SELECTED':
        if (unsetSelectedNode(curSelectedNode, 'selectedSrc', 'NONE_SELECTED')) {
          ;
        } else {
          setSelectedNode(curSelectedNode, 'selectedDest', 'READY');
        }
        break;
      case 'ONLY_DEST_SELECTED':
        if (unsetSelectedNode(curSelectedNode, 'selectedDest', 'NONE_SELECTED')) {
          ;
        } else {
          setSelectedNode(curSelectedNode, 'selectedSrc', 'READY');
        }
        break;
      case 'READY':
        if (unsetSelectedNode(curSelectedNode, 'selectedDest', 'ONLY_SRC_SELECTED')) {
          ;
        } else if (unsetSelectedNode(curSelectedNode, 'selectedSrc', 'ONLY_DEST_SELECTED')) {
          ;
        } else {
          setSelectedNode(curSelectedNode, 'selectedDest', 'READY');
        }
        break;
      default:
        break;
    }
  } else {
    const prevSelectedNode = $('.query-route-panel').data('curSelectedNode');
    if (prevSelectedNode) {
      graph.normalizeNode(prevSelectedNode.id);
    }
    graph.selectNode(curSelectedNode.id);
    $('.query-route-panel').data('curSelectedNode', curSelectedNode);
    return true;
  }
}

// demand 2: show information of selected spot
function showSpotInfo(spot) {
  $('.description-wrapper .title').text(spot.name);
  const description = 
`代号：sysu-spot-${spot.id}
简介：${spot.description}
`
  $('.description-wrapper .description').text(description);
}

// 
function toggleSlideUpDown() {
  $('.query-route-panel').toggleClass('slidedUp');
  $('.toggled-icon').toggle();
  $('.query-route-panel').data('curSelectedNode', null);
  $('.query-route-panel').data('selectedSrc', null);
  $('.query-route-panel').data('selectedDest', null);
  $('.query-route-panel').data('query-state', 'NONE_SELECTED')
  if ($('.query-route-panel').hasClass('slidedUp')) {
    $('.query-route-panel').data('isDoingQuery', false);
  } else {
    $('.query-route-panel').data('isDoingQuery', true);
  }
}

function setSelectedNode(node, identity, nextState) {
  $('.query-route-panel').data(identity, node);
  if (nextState) {
    $('.query-route-panel').data('query-state', nextState);
  }
  graph.selectNode(node.id);
}
function unsetSelectedNode(node, identity, nextState) {
  const toUnselect = $('.query-route-panel').data(identity).id === node.id;
  if (!toUnselect) return false;
  if (nextState) {
    $('.query-route-panel').data('query-state', nextState);
  }
  $('.query-route-panel').data(identity, null);
  graph.normalizeNode(node.id);
  return true;
}
