import os
from meshes import get_ply_path


def get_landmarks_from_sw(path):
    landmarks = {}
    with open(path, "rb") as input_file:
        lines = input_file.readlines()
        for line_index in range(100, len(lines)):
            line = str(lines[line_index])[2: -3]
            if line.find("LANDMARK") != -1 and line.find("SURF") == -1:
                data = line.split(" ")[1:]
                numbers = [float(coord) for coord in data[:3]]
                label = ""
                for word in data[3:]:
                    label += word + " "
                landmarks[label[:-1]] = numbers
    return landmarks


def copy_landmarks(subject):
    subject = str(subject)
    if len(subject) == 1: subject = "0" + str(subject)

    path = "../cochlea_data/Subject_00" + subject
    path += "/" +  os.listdir(path)[0]
    files = os.listdir(path)
    for file in files:
        if file[-3:] == ".sw":
            sw = path + "/" + file
        if file[-5:] == "e.ply":
            ply = path + "/" + file
    new_path = ply[:-4] + " with landmarks.ply"
    print("Created " + new_path[new_path.rfind("/") + 1:] + " for Subject " + subject)

    landmarks = get_landmarks_from_sw(sw)

    with open(new_path, "wb") as new:
        with open(ply, "rb") as ply_file:
            new.write(next(ply_file))
            new.write(next(ply_file))

            for landmark in landmarks.keys():
                line = "comment LANDMARK EXTERNAL \"" + landmark + "\""
                for x in landmarks[landmark]:
                    line += " " + str(x)
                line += "\n"
                new.write(line.encode('utf-8'))

            new.write(ply_file.read())


def get_landmarks_from_ply(subject):
    path = get_ply_path(subject)
    head = ""
    with open(path, "rb") as input_file:
        for _ in range(20):
            head += str(next(input_file))
    substrings = head.split("\"")
    landmarks = {}
    for i in range(2, len(substrings), 2):
        end = substrings[i].find("\\")
        if substrings[i-2].find("EXTERNAL") != -1:
            numbers_str = substrings[i][:end].split(" ")[1:]
            numbers = []
            for n in numbers_str:
                numbers.append(float(n))
            landmarks[substrings[i-1]] = numbers
    return landmarks