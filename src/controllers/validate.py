#!/usr/bin/python

def validate():
  try:
    base = int(input(''))
  except:
    base = 10
  while True:
    try:
      oneIn = input('')
      print(int(oneIn, base), int(oneIn[::-1], base))
    except:
      break

if __name__ == "__main__":
  validate()
