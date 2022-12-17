import PIL.Image as Image
import numpy as np
import json

vertical_resolution = None
horizontal_resolution = None

with open("src/parameters.json") as f:
    parameters = json.load(f)

    vertical_resolution = parameters['vertical_resolution']
    horizontal_resolution = parameters['horizontal_resolution']

def read(path):
    with open(path, "rb") as f:
        bs = []
        while (byte := f.read(1)):
            bs.append(int.from_bytes(byte, 'little'))
        return bs

bs = read("./data/depthmap.bin")
bs = np.asarray(bs).astype(np.uint8).reshape(vertical_resolution, horizontal_resolution, 3)
image = Image.fromarray(bs)
image.save("./data/depthmap.png", "png")
