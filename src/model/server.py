from .calculator import Calculator
from . import json2graph
import json
import sys


class GraphServer:
    """
    handle calculation requests
    """
    def __init__(self, path_to_json):
        """
        initialize server by the path to the json containing a graph
        """
        with open(path_to_json) as json_file:
            content = json_file.read()
            self._id_name_map, walk_graph, car_graph = \
                json2graph.Convert(content)
        self._calculator = Calculator(car_graph, walk_graph)

    def Run(self):
        """
        run server, stop when eof
        """
        while True:
            input_str = sys.stdin.readline()
            if not input_str or input_str[0] == '\n':
                return
            start, end, for_car = self._GetParamFromInput(input_str)
            result = self._calculator.Calculate(start, end, for_car)
            self._PrintCalculationResult(result)

    @classmethod
    def _GetParamFromInput(cls, input_str):
        """
        convert the input line to parameter for calculation
        :@param input_str: the line input by 'user'
        """
        param_list = input_str.split()
        for_car = bool(int(param_list[0]))
        start, end = int(param_list[1]), int(param_list[2])
        return start, end, for_car

    def _PrintCalculationResult(self, result):
        """
        dump the result of calculation to the json format to stdout
        :@param result: the three-tuple result from calculator
                        ((start, end), distance, path)
        """
        if result is None:
            output_json_obj = None
        else:
            output_json_obj = {}
            output_json_obj['distance'] = result[0]
            index_path = result[1]
            output_json_obj['path'] = list(
                map(self._id_name_map.__getitem__, index_path))
        json.dump(output_json_obj, sys.stdout, ensure_ascii=False)
        sys.stdout.write('\n')
        sys.stdout.flush()
