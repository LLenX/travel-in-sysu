from .graph.spfa import Spfa


class Calculator:
    """
    calculator that calculate the shortest path between two vertex
    """

    def __init__(self, car_graph, walk_graph):
        self._graph_map = {True: car_graph, False: walk_graph}
        self._cache_map = {True: {}, False: {}}

    def Calculate(self, start, end, for_car):
        """
        calculate the shortest path between two vertex
        :@param: for_car whether find a path that's for car
        :@return: a three-tuple, ((start, destination), length, path)
        """
        while True:
            # try to get result from cache first
            result = self._GetResultFromCache(start, end, for_car)
            if result:
                break
            # calculate
            result_list = Spfa(self._graph_map[for_car], start)
            if result_list is None:
                return None
            # cache
            self._CacheResult(result_list, for_car)

        return result

    def _GetResultFromCache(self, start, end, for_car):
        result = self._cache_map[for_car].get((start, end))
        if not result:
            result = self._cache_map[for_car].get((end, start))
        return result

    def _CacheResult(self, result_list, for_car):
        for result in result_list:
            start, end = result[0]
            if (start, end) in self._cache_map[for_car] or (
                    end, start) in self._cache_map[for_car]:
                continue
            self._cache_map[for_car][(start, end)] = result
