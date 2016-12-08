'use strict';
module.exports = {
  drawPath,
  clearMap,

}

const path = require('path');
const $ = window.jQuery = window.$;
const cytoscape = require(path.join(__dirname, './cytoscape.js'));
const bootstrap = require(path.join(__dirname, './bootstrap.js'));

let nodeMap = [];
let edgeMap = [];

var cy;

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
          'width' : 3,
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
          'transition-property': 'background-color, line-color, target-arrow-color',
          'transition-duration': '0.5s'
        })

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
function initMap(nodes, edges) {
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
        id: String(edge.destId) + '-' + String(edge.srcId),
        target: String(edge.destId),
        source: String(edge.srcId),
        weight: edge.distance
      }
    });
  }
  console.log(nodeMap, edgeMap);
  loadCy();
}

function loadCy() {
   global.cy = cytoscape({
     container: document.getElementById('cy-body'),
     style: cy_stylesheet,
     elements: {
       nodes: nodeMap,
       edges: edgeMap
     }
   });
}


function lockMap() {
  if (cy === undefined) return false;
}

function onLayoutReady() {}


global.initMap = initMap;

global.position = `[{"id":"0","position":{"x":100,"y":100}},{"id":"1","position":{"x":100,"y":100}},{"id":"2","position":{"x":100,"y":100}},{"id":"3","position":{"x":100,"y":100}},{"id":"4","position":{"x":100,"y":100}},{"id":"5","position":{"x":100,"y":100}},{"id":"6","position":{"x":100,"y":100}},{"id":"7","position":{"x":100,"y":100}},{"id":"8","position":{"x":100,"y":100}},{"id":"9","position":{"x":100,"y":100}},{"id":"10","position":{"x":100,"y":100}},{"id":"11","position":{"x":100,"y":100}},{"id":"12","position":{"x":100,"y":100}},{"id":"13","position":{"x":100,"y":100}},{"id":"14","position":{"x":100,"y":100}},{"id":"15","position":{"x":100,"y":100}},{"id":"16","position":{"x":100,"y":100}},{"id":"17","position":{"x":100,"y":100}},{"id":"18","position":{"x":100,"y":100}}]`;