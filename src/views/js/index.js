'use strict';
const isDebugging = (process.env.NODE_ENV === 'development');
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

// click on import
function importMapFile() {
  trigger(function *() {
    sendToBg('import-map-file');
  });
}

ipcRenderer.asyncOn('map-file-imported', function *(event, mapData) {
  if (!mapData) return;
  $('.main').data('mapData', mapData);
  mapDataInit(mapData);
  graph.loadGraph({
    "onClickCallback": onNodeClick,
    "onZoom": clearSrcDestToopTip
  }, mapData);
});

// click on request
function requestRoute() {
  const $self = $(this);
  const mapData = $('.main').data('mapData');
  if (!mapData) return;
  const forCar = Number($self.hasClass('query-car-route-btn')),
        selectedSrc = $('.query-route-panel').data('selectedSrc'),
        selectedDest = $('.query-route-panel').data('selectedDest');
  if (selectedSrc === null && selectedDest === null) {
    return;
  }
  const input = `${forCar} ${selectedSrc.id} ${selectedDest.id}\n`;
  $('.query-route-panel').data('query-car-route', Boolean(forCar));
  trigger(function *sendInput() {
    sendToBg('graph-request', input);
  });
}

ipcRenderer.asyncOn('graph-response', function *(event, msg) {
  if (!msg) return;
  const mapData = $('.main').data('mapData');
  if (!mapData) return;
  const how = $('.query-route-panel').data('query-car-route') ? '驾车': '步行',
        selectedSrc = $('.query-route-panel').data('selectedSrc'),
        selectedDest = $('.query-route-panel').data('selectedDest');
  let text = `从${selectedSrc.name}到${selectedDest.name}的${how}路径`;
  if (msg.path.length <= 1) {
    text = `未找到${text}`;
    if ($('.query-route-panel').data('selectedDest')) {
      graph.selectNode($('.query-route-panel').data('selectedDest').id, true);
    }
    if ($('.query-route-panel').data('selectedSrc')) {
      graph.selectNode($('.query-route-panel').data('selectedSrc').id, true);
    }
  } else {
    text += `：\n${msg.path.join(' -> ')}\n距离：${msg.distance}`;
  }
  $('.query-result').text(text);
  graph.clearMap();
  graph.drawPath(msg.path.map((oneName) => mapData.idOf[oneName]));
});


// utils

function init() {
  $ = window.$ = require(path.join(__dirname, './jquery.js'));
  graph = require(path.join(__dirname, './graph.js'));

  $('.import-map-btn').on('click', importMapFile);
  $('.query-route-btn').on('click', requestRoute);
  $('.exchange-btn').on('click', exchangeEnds);
  $('.query-route-wrapper .title').on('click', toggleSlideUpDown).click();
  $('.clear-btn').on('click', clear).click();

  $(window).on('beforeunload', function() {
    bgWindow.close();
    bgWindow = null;
  });

  if (isDebugging) {
    $('.input-text').on('change', function() {
      trigger(function *sendInput() {
        sendToBg('graph-request', $('.input-text').val());
      });
    });
  }
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

function exchangeEnds() {
  const selectedSrc = $('.query-route-panel').data('selectedSrc');
  const selectedDest = $('.query-route-panel').data('selectedDest');
  graph.clearMap();
  setSelectedNode(selectedDest, 'selectedSrc');
  setSelectedNode(selectedSrc, 'selectedDest');
  setSelectedNode(selectedDest, 'selectedSrc');
}

function onNodeClick(nodeId) {
  const mapData = $('.main').data('mapData');
  if (!mapData) return;
  const curSelectedNode = mapData.dataOf[nodeId];
  showSpotInfo(curSelectedNode);
  graph.clearMap();
  if ($('.query-route-panel').data('selectedDest')) {
    graph.selectNode($('.query-route-panel').data('selectedDest').id, true);
  }
  if ($('.query-route-panel').data('selectedSrc')) {
    graph.selectNode($('.query-route-panel').data('selectedSrc').id, true);
  }
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
    if ($('.query-route-panel').data('query-state') === 'READY') {
      $('.query-route-btn').prop('disabled', false);
    } else {
      $('.query-route-btn').prop('disabled', true);
    }
  } else {
    const prevSelectedNode = $('.query-route-panel').data('curSelectedNode');
    if (prevSelectedNode) {
      graph.selectNode(prevSelectedNode.id, false);
    }
    graph.selectNode(curSelectedNode.id, true);
    $('.query-route-panel').data('curSelectedNode', curSelectedNode);
    return true;
  }
}

function clearSrcDestToopTip() {
  graph.setSrcTooltip(0, false);
  graph.setDestTooltip(0, false);
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

function toggleSlideUpDown() {
  $('.query-route-panel').toggleClass('slidedUp');
  $('.toggled-icon').toggleClass('slided-up');
  clear();
  if ($('.query-route-panel').hasClass('slidedUp')) {
    $('.query-route-panel').data('isDoingQuery', false);
  } else {
    $('.query-route-panel').data('isDoingQuery', true);
  }
}

function clear() {
  if ($('.query-route-panel').data('curSelectedNode')) {
    graph.selectNode($('.query-route-panel').data('curSelectedNode').id, false);
  }
  $('.query-route-panel').data('curSelectedNode', null);
  setSelectedNode(null, 'selectedSrc', 'NONE_SELECTED');
  setSelectedNode(null, 'selectedDest', 'NONE_SELECTED');
  $('.query-route-btn').prop('disabled', true);
  graph.clearMap();
  clearSrcDestToopTip();
}

function setSelectedNode(node, identity, nextState) {
  let prevSelectedNode = $('.query-route-panel').data(identity);
  if (prevSelectedNode) {
    unsetSelectedNode(prevSelectedNode, identity);
  }
  $('.query-route-panel').data(identity, node);
  if (nextState) {
    $('.query-route-panel').data('query-state', nextState);
  }
  if (node !== null) {
    graph.selectNode(node.id, true);
  }
  if (identity === 'selectedSrc') {
    $('.route-src .end').text((node && node.name) || '未指定');
    if (node !== null) {
      graph.setSrcTooltip(node.id, true);
    }
  } else if (identity === 'selectedDest') {
    $('.route-dest .end').text((node && node.name) || '未指定');
    if (node !== null) {
      graph.setDestTooltip(node.id, true);
    }
  }
}
function unsetSelectedNode(node, identity, nextState) {
  const toUnselect = $('.query-route-panel').data(identity).id === node.id;
  if (!toUnselect) return false;
  if (nextState) {
    $('.query-route-panel').data('query-state', nextState);
    if (node && nextState !== 'READY') {
      if (identity === 'selectedSrc') graph.setSrcTooltip(node.id, false);
      if (identity === 'selectedDest') graph.setDestTooltip(node.id, false);
    }
  }
  $('.query-route-panel').data(identity, null);
  graph.selectNode(node.id, false);
  if (identity === 'selectedSrc') {
    $('.route-src .end').text('未指定');
  } else if (identity === 'selectedDest') {
    $('.route-dest .end').text('未指定');
  }
  return true;
}

function mapDataInit(mapData) {
  mapData['idOf'] = {};
  mapData['nameOf'] = {};
  mapData['dataOf'] = {};
  for (let oneSpot of mapData.spots) {
    oneSpot.id = String(oneSpot.id);
    mapData['idOf'][oneSpot.name] = oneSpot.id;
    mapData['nameOf'][oneSpot.id] = oneSpot.name;
    mapData['dataOf'][oneSpot.id] = oneSpot;
  }
}
