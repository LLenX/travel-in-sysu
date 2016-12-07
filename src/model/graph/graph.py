class Graph:
    """
    undirected weighted graph
    """

    def __init__(self, vertex_num=0):
        """
        initialize the graph with several vertex
        :@param vertex_size: number of the initial vertex
        """
        self._adj_lists = [{} for i in range(vertex_num)]
        self._edge_num = 0

    def VertexNum(self):
        """
        number of vertices in the graph
        """
        return len(self._adj_lists)

    def EdgeNum(self):
        """
        number of edges in the graph
        """
        return self._edge_num

    def AddEdge(self, vertex1, vertex2, weight):
        """
        add a edge between vertex1 and vertex2 with weight
        :@return: True if success, False if vertex1 or vertex2 is out of range
        """
        if vertex1 >= self.VertexNum() or vertex2 >= self.VertexNum():
            return False

        self._adj_lists[vertex1][vertex2] = weight
        self._adj_lists[vertex2][vertex1] = weight
        self._edge_num += 1
        return True

    def AddVertex(self):
        """
        add an vertex of the next index
        :@return: the index of the vertex added
        """
        self._adj_lists.append(list())
        return len(self._adj_lists) - 1

    def AdjacentTo(self, vertex):
        """
        getter for all vertices adjacent to the vertex and its weight
        :@param vertex: the index of the vertex
        :@return: a list of two-tuple, whose first element is the index of the
                  vertex, second is the weight of the edge between. None if
                  the index of the vertex is out of range
        """
        if vertex >= self.VertexNum():
            return None

        return list(self._adj_lists[vertex].items())
