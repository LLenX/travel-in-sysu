import sys
sys.path.append('../../src')

import unittest
from graph.graph import Graph


class GraphTest(unittest.TestCase):

    def setUp(self):
        self._graph1 = Graph(5)
        self._graph2 = Graph()

    def test_init(self):
        self.assertEqual(self._graph1.VertexNum(), 5)
        self.assertEqual(self._graph2.VertexNum(), 0)

    def test_AddVertex(self):
        for i in range(5):
            with self.subTest(new_vertex=i + 5):
                self.assertEqual(self._graph1.AddVertex(), i + 5)

        self.assertEqual(self._graph1.VertexNum(), 10)
        for i in range(5):
            with self.subTest(new_vertex=i + 1):
                self.assertEqual(self._graph2.AddVertex(), i)

        self.assertEqual(self._graph2.VertexNum(), 5)

    def test_AddEdge(self):
        self.assertFalse(self._graph2.AddEdge(vertex1=1, vertex2=2, weight=3))
        for i, j in [(i, j) for i in range(5) for j in range(5)]:
            if i == j:
                continue
            with self.subTest(i=i, j=j):
                self.assertTrue(
                    self._graph1.AddEdge(
                        vertex1=i, vertex2=j, weight=i + j))

        self.assertEqual(self._graph1.EdgeNum(), 20)

        for i in range(5):
            with self.subTest(vertex=i):
                self.assertEqual(len(self._graph1.AdjacentTo(i)), 4)

            for j in range(5):
                if i == j:
                    continue
                with self.subTest(vertex1=i, vertex2=j, weight=i+j):
                    self.assertIn((j, i+j), self._graph1.AdjacentTo(i))

if __name__ == '__main__':
    unittest.main()
