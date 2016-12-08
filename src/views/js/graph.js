'use strict';
module.exports = {
  loadGraph,
  clearMap,
  drawPath,
  highlightNode,
  selectNode,
  normalizeNode,
  setSrcTooltip,
  setDestTooltip
};

const path = require('path');
const $ = window.jQuery = window.$;
const cytoscape = require(path.join(__dirname, './cytoscape.js'));
const bootstrap = require(path.join(__dirname, './bootstrap.js'));

let nodeMap = [];
let edgeMap = [];

let cy = null;
let onClickCallback = null;
let onZoom = null;

let positionSet = {};

const cy_stylesheet = 
    cytoscape.stylesheet()
      .selector('node, node:selected')
        .css({
          'content': 'data(name)',
          'title': 'data(description)',
          'overlay-padding': '4px',
          'height': '13px',
          'width': '13px',
          'font-size': '12px',
          'background-color': '#999'
        })
      .selector('edge')
        .css({
          'label': 'data(weight)',
          'width': '3px',
          'line-color': '#ddd',
          'target-arrow-color': '#ddd',
          'source-arrow-color': '#ddd',
          'curve-style': 'bezier',
          'overlay-padding': '3px',
          'text-opacity': 0,
          'font-size': '12px'
        })
      .selector('.selected')
        .css({
          'border-color': '#feff00',
          'border-width': '2px',
          'line-color': '#61bffc',
          'border-style': 'solid',
          'background-color': 'red'
        })
      .selector('.highlighted')
        .css({
          'background-color': '#61bffc',
          'line-color': '#61bffc',
          'target-arrow-color': '#61bffc',
          'source-arrow-color': '#61bffc',
          'transition-property': 'text-opacity, background-color, line-color, target-arrow-color, source-arrow-color',
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
        id: node.id,
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
        id: `${edge.srcId}egde${edge.destId}weight${edge.distance}`,
        target: edge.destId,
        source: edge.srcId,
        weight: edge.distance
      }
    });
  }
  console.log(edgeMap, nodeMap.length);
  cy = global.cy = cytoscape({
      container: document.getElementById('cy-body'),
      style: cy_stylesheet,
      elements: {
        nodes: nodeMap,
        edges: edgeMap
      }
    });
  cy.nodes().each(function() {
    this.position(this.data('position'))
  });
  lockMap();
  cy.nodes().on('mousedown', nodeMouseDownHandler);
  cy.nodes().on('mouseover', nodeMouseOverHandler);
  cy.nodes().on('mouseout', nodeMouseOutHandler);
  cy.edges().on('mouseover', edgeMouseOverHandler);
  cy.edges().on('mouseout', edgeMouseOutHandler);
  cy.on('zoom', zoomHandler);
}


function lockMap() {
  if (cy === undefined) return;
  // 设置全局元素不可拖拽
  cy.elements().lock();
  // 设置不可移动
  // cy.panningEnabled(false);
  // 设置不可缩放
  // cy.zoomingEnabled(false);
}

// function onLayoutReady() {}

function clearMap() {
  if (cy) {
    cy.elements().classes("");
  }
}

// path [node's Id]
let timer = 0;
function drawPath(path) {
  if (!(path instanceof Array) || path.length <= 1) throw 'haha';
  for (let i = 1; i < path.length; ++i) {
    cy.$(`#${path[i]}`).addClass('highlighted');
    if (!drawEdge(path[i - 1], path[i])) {
      clearMap();
      return false;
    }
  }
  return true;
}

function drawEdge(sourceId, targetId) {
  var edge = cy.$(`#${sourceId}`).edgesTo(`#${targetId}`);
  if (edge.length) {
    edge[0].classes('positive highlighted');
  } else {
    edge = cy.$(`#${targetId}`).edgesTo(`#${sourceId}`);
    if (edge.length) {
      edge[0].classes('inverse highlighted');
    } else {
      return false;
    }
  }
  return true;
}


let desc = null,
    node_name = null;
function nodeMouseDownHandler(event) {
  desc = this.data('description');
  node_name = this.data('name');
  if (event && event.originalEvent && event.originalEvent.offsetX && event.originalEvent.offsetY) {
    positionSet[this.data('id')] = {x: event.originalEvent.offsetX, y: event.originalEvent.offsetY};
    $('.cy-node-tooltip').css('top', `${event.originalEvent.offsetY + 15}px`)
      .css('left', `${event.originalEvent.offsetX + 10}px`); 
    $('.cy-node-tooltip').popover({
        trigger: 'manual',
        content: () => desc,
        title: () => node_name,
        placement: 'top'
      }).popover('show');
    setTimeout(() => $('.cy-node-tooltip').popover('hide'), 1000);
  }
  onClickCallback(this.data('id'));
}

function nodeMouseOverHandler() {
  this.edgesWith('*').css('text-opacity', 1).addClass('selected');
}

function nodeMouseOutHandler() {
  this.edgesWith('*').css('text-opacity', 0).removeClass('selected');
}

function edgeMouseOverHandler() {
  this.css('text-opacity', 1);
}

function edgeMouseOutHandler() {
  this.css('text-opacity', 0);
}

function zoomHandler() {
  onZoom();
}


function toggleNode(nodeId, bool, className) {
  if (bool === undefined) {
    return cy.$(`#${nodeId}`).hasClass(className);
  } else {
    if (bool) cy.$(`#${nodeId}`).addClass(className);
    else cy.$(`#${nodeId}`).removeClass(className);
  }
}
function highlightNode(nodeId, bool) {
  return toggleNode(nodeId, bool, 'highlighted')
}

function selectNode(nodeId, bool) {
  return toggleNode(nodeId, bool, 'selected');
}

function normalizeNode(nodeId) {
  cy.$(`#${nodeId}`).classes('')
}

function loadGraph(handlers, rawMapData) {
  loadCy(rawMapData.spots, rawMapData.routes);
  onClickCallback = handlers.onClickCallback;
  onZoom = handlers.onZoom;
}

function setTooltip(nodeId, show, selector) {
  console.log(selector)
  $(selector)
    .css('top', `${positionSet[nodeId] ? positionSet[nodeId].y + 15 : 0}px`)
      .css('left', `${positionSet[nodeId] ? positionSet[nodeId].x + 10 : 0}px`);
  if (show) $(selector).tooltip('show');
  else $(selector).tooltip('hide');
}

function setSrcTooltip(nodeId, show) {
  $('.cy-src-tooltip').tooltip({title: '始'});
  setTooltip(nodeId, show, '.cy-src-tooltip');
}

function setDestTooltip(nodeId, show) {
  $('.cy-dest-tooltip').tooltip({title: '终'});
  setTooltip(nodeId, show, '.cy-dest-tooltip');
}