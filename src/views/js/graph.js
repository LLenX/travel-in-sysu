'use strict';
module.exports = function(options) {
  const {
    onClickCallback
  } = options;
  return {
    loadGraph,
    clearMap,
    drawPath,
    highlightNode,
    selectNode,
    normalizeNode
  };
};

const path = require('path');
const $ = window.jQuery = window.$;
const cytoscape = require(path.join(__dirname, './cytoscape.js'));
const bootstrap = require(path.join(__dirname, './bootstrap.js'));

let nodeMap = [];
let edgeMap = [];

let cy;

const cy_stylesheet = 
    cytoscape.stylesheet()
      .selector('node')
        .css({
          'content': 'data(name)',
          'title': 'data(description)',
          'height': '20px',
          'width': '20px'
        })
      .selector('edge')
        .css({
          'label': 'data(weight)',
          'width': 3,
          'line-color': '#ddd',
          'target-arrow-color': '#ddd',
          'source-arrow-color': '#ddd',
          'curve-style': 'unbundled-bezier'
        })
      .selector('.selected')
        .css({
          'border-color': '#feff00',
          'border-width': '2px',
          'border-style': 'solid',
          'background-color': 'red'
        })
      .selector('.highlighted')
        .css({
          'background-color': '#61bffc',
          'line-color': '#61bffc',
          'target-arrow-color': '#61bffc',
          'source-arrow-color': '#61bffc',
          'transition-property': 'background-color, line-color, target-arrow-color, source-arrow-color',
          'transition-duration': '0.5s'
        })
      .selector('.positive')
        .css({
          'target-arrow-shape': 'triangle',
          'source-arrow-shape': 'none'
        })
      .selector('.inverse')
        .css({
          'target-arrow-shape': 'none',
          'source-arrow-shape': 'triangle'
        });

// 保存地图节点信息， 包括：
// 
//   nodes: [
//     {
//       name: 节点名称
//       id : 节点Id,
//       position : {
//         x: x坐标,
//         y: y坐标
//       },
//       description: 节点描述,
//     }
//   ]
//
//   edges: [
//     {
//       srcId: 路径起点，
//       destId: 路径终点,
//       distance: 路径权重
//     }
//   ]
//
function initMap() {
  nodeMap = [];
  edgeMap = [];
  if (cy) {
    cy = undefined
  }
}

function loadCy(nodes, edges) {
  initMap();
  for (let i = 0; i < nodes.length; ++i) {
    let node = nodes[i];
    nodeMap.push({
      data: {
        id: String(node.id),
        name: node.name,
        position: node.position,
        description: node.description
      }
    });
  }
  for (let i = 0; i < edges.length; ++i) {
    let edge = edges[i];
    edgeMap.push({
      data: {
        id: 'edge' + edge.srcId + edge.destId,
        target: String(edge.destId),
        source: String(edge.srcId),
        weight: edge.distance
      }
    });
  }
  cy = global.cy = cytoscape({
     container: document.getElementById('cy-body'),
     style: cy_stylesheet,
     elements: {
       nodes: nodeMap,
       edges: edgeMap
     }
   });
   lockMap();
   cy.nodes().on('click', nodeClickHandler);
}


function lockMap() {
  if (cy === undefined) return;
  // 设置全局元素不可拖拽
  cy.elements().lock();
  // 设置不可移动
  cy.panningEnabled(false);
  // 设置不可缩放
  cy.zoomingEnabled(false);
}

// function onLayoutReady() {}

function clearMap() {
  if (cy) {
    cy.elements().classes("");
  }
}

// path [node's Id]
function drawPath(path) {
  if (!(path instanceof Array) || path.length <= 1) throw 'haha';
  for (let i = 1; i < path.length; ++i) {
    cy.$('#' + path[i]).addClass('.highlighted');
    if (!drawEdge(path[i - 1], path[i])) {
      clearMap();
      return false;
    }
  }
  return true;
}

function drawEdge(sourceId, targetId) {
  var edge = cy.$('#' + sourceId).edgesTo('#' + targetId);
  if (edge.length) {
    edge[0].classes('positive highlighted');
  } else {
    edge = cy.$('#' + targetId).edgesTo('#' + sourceId);
    if (edge.length) {
      edge[0].classes('negative highlighted');
    } else {
      return false;
    }
  }
  return true;
}



function nodeClickHandler(event) {
  if (event && event.originalEvent && event.originalEvent.offsetX && event.originalEvent.offsetY) {
    $('#for-tip').css('top', event.originalEvent.offsetY - 5 + 'px').css('left', event.originalEvent.offsetX - 5 + 'px'); 
    $('.cy-node-tooltip').tooltip({
      title: this.data('description')
    });
  }
  onClickCallback(this.data('id'));
}


function toggleNode(nodeId, bool, className) {
  if (bool !== undefined) {
    return cy.$('#' + nodeId).hasClass(className);
  } else {
    if (bool) cy.$('#' + nodeId).addClass(className);
    else cy.$('#' + nodeId).removeClass(className);
  }
}
function highlightNode(nodeId, bool) {
  return toggleNode(nodeId, bool, 'highlighted')
}

function selectNode(nodeId, bool) {
  return toggleNode(nodeId, bool, 'selected');
}

function normalizeNode(nodeId) {
  cy.$('#' + nodeId).classes('')
}

// global.initMap = loadCy;

global.position = `[{"id":"0","position":{"x":100,"y":100}},{"id":"1","position":{"x":100,"y":100}},{"id":"2","position":{"x":100,"y":100}},{"id":"3","position":{"x":100,"y":100}},{"id":"4","position":{"x":100,"y":100}},{"id":"5","position":{"x":100,"y":100}},{"id":"6","position":{"x":100,"y":100}},{"id":"7","position":{"x":100,"y":100}},{"id":"8","position":{"x":100,"y":100}},{"id":"9","position":{"x":100,"y":100}},{"id":"10","position":{"x":100,"y":100}},{"id":"11","position":{"x":100,"y":100}},{"id":"12","position":{"x":100,"y":100}},{"id":"13","position":{"x":100,"y":100}},{"id":"14","position":{"x":100,"y":100}},{"id":"15","position":{"x":100,"y":100}},{"id":"16","position":{"x":100,"y":100}},{"id":"17","position":{"x":100,"y":100}},{"id":"18","position":{"x":100,"y":100}}]`;