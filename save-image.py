import PIL.Image as Image
import numpy as np

def read(path):
    with open(path, "rb") as f:
        bs = []
        while (byte := f.read(1)):
            bs.append(int.from_bytes(byte, 'little'))
        return bs

bs = read("./data/depthmap.bin")
bs = np.asarray(bs).astype(np.uint8).repeat(3).reshape(1024, 8192, 3)
image = Image.fromarray(bs)
image.save("./data/depthmap.png", "png")
