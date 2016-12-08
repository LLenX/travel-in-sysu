from collections import deque


def Spfa(graph, start):
    if start >= graph.VertexNum():
        return None

    distance_to = [-1] * graph.VertexNum()
    vertex_to = [-1] * graph.VertexNum()

    distance_to[start] = 0
    vertex_to[start] = start

    bfs_q = deque()
    bfs_q.append(start)

    while bfs_q:
        cur_vertex = bfs_q.popleft()
        for vertex, weight in graph.AdjacentTo(cur_vertex):
            if distance_to[
                    vertex] == -1 or distance_to[vertex] > distance_to[
                            cur_vertex] + weight:
                distance_to[vertex] = weight + distance_to[cur_vertex]
                vertex_to[vertex] = cur_vertex
                if vertex not in bfs_q:
                    bfs_q.append(vertex)

    return _GetSpfaResult(start, distance_to, vertex_to)


def _GetSpfaResult(start, distance_to, vertex_to):
    result = []
    for vertex, dist in enumerate(distance_to):
        if dist == -1:
            result.append(((start, vertex), -1, []))
            continue
        dest = vertex
        path = []
        while vertex != vertex_to[vertex]:
            path.append(vertex)
            vertex = vertex_to[vertex]
        path.append(start)
        path.reverse()
        result.append(((start, dest), dist, path))
    return result
