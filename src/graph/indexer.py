class Indexer:
    """
    indexer, convert the string name to continuous index used
    by the vertex of graph
    """
    def __init__(self):
        self._next_index = 0
        self._index_dict = {}
        self._name_dict = {}

    def __contains__(self, name):
        """
        whether the a name already register
        """
        return name in self._index_dict

    def __len__(self):
        """
        names registered in the indexer
        """
        return self._next_index

    def __getitem__(self, name):
        """
        get the index of specific name, if name doesn't exist before
        register it with next index
        """
        if name not in self._index_dict:
            self._index_dict[name] = self._next_index
            self._name_dict[self._next_index] = name
            self._next_index += 1
        return self._index_dict[name]

    def NameOf(self, index):
        """
        get the name of a index, None if the index doesn't exist
        """
        return self._index_dict.get(index, None)

    def Names(self):
        """
        getter for all names registered in the indexer
        """
        return self._index_dict.keys()
