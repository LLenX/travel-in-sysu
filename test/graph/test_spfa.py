import sys

sys.path.append('../../src/')

from model.graph.spfa import Spfa
from model.graph.graph import Graph
import unittest


class TestSpfa(unittest.TestCase):

    def setUp(self):
        self._graph = Graph(11)
        edges = [(8, 9, 4), (9, 5, 3), (5, 2, 2), (1, 2, 2), (2, 7, 1),
                 (7, 6, 5), (6, 0, 3), (0, 4, 1), (4, 3, 4), (3, 8, 2),
                 (3, 5, 7), (3, 1, 3), (1, 6, 1), (6, 7, 5), (0, 1, 2)]
        for edge in edges:
            self._graph.AddEdge(*edge)

    def test_unreachable(self):
        results = Spfa(self._graph, 10)
        self.assertEqual(len(results), 11)
        for result in results:
            with self.subTest(vertex=result[0]):
                if result[0] != 10:
                    self.assertEqual(result[1], -1)
                    self.assertEqual(len(result[2]), 0)
                else:
                    self.assertEqual(result[1], 0)
                    self.assertEqual(len(result[2]), 1)
                    self.assertEqual(result[2][0], 10)

    def test_start_from_4(self):
        results = Spfa(self._graph, 4)
        for result in results:
            print(result)

if __name__ == '__main__':
    unittest.main()
