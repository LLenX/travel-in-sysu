#! /usr/bin/python3

from model.server import GraphServer
import sys
import os

def PrintToTerminal(*args, file = sys.stdout):
    if os.isatty(sys.stdout.fileno()):
        print(*args, file=file)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        PrintToTerminal('usage:', sys.argv[0], '<path/to/json>', file=sys.stderr)
        sys.exit(1)
    server = GraphServer(sys.argv[1])
    server.Run()
