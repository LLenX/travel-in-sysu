from .graph.graph import Graph
import json


def Convert(graph_json):
    json_obj = json.loads(graph_json)

    vertices = json_obj['spots']
    edges = json_obj['routes']

    car_graph = Graph(len(vertices))
    walk_graph = Graph(len(vertices))

    id_name_map = _GetNameIdMap(vertices)
    _AddEdge(edges, car_graph, walk_graph)
    return id_name_map, walk_graph, car_graph


def _GetNameIdMap(vertices):
    name_id_map = {}
    for vertice in vertices:
        name_id_map[vertice['id']] = vertice['name']
    return name_id_map


def _AddEdge(edges, car_graph, walk_graph):
    for edge in edges:
        v1, v2, weight = edge['srcId'], edge['destId'], edge['distance']
        if edge['forCar']:
            car_graph.AddEdge(v1, v2, weight)

        if edge['forWalk']:
            walk_graph.AddEdge(v1, v2, weight)
