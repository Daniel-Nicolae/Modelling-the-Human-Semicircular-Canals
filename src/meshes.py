import open3d as o3d
import numpy as np
import os

def get_ply_path(subject, landmarks=True):
    subject = str(subject)
    if len(subject) == 1: subject = "0" + str(subject)
    path = "../cochlea_data/Subject_00" + subject
    path += "/" +  os.listdir(path)[0]
    files = os.listdir(path)
    ply = ""
    for file in files:
        if not landmarks and file[-5:] == "e.ply":
            ply = path + "/" + file
        if landmarks and file[-5:] == "s.ply":
            ply = path + "/" + file
    return ply

def center_mesh_vertices(mesh):
    vertices = np.array(mesh.vertices)
    vertices -= np.mean(vertices, axis=0)
    return vertices

def flip_left(mesh):
    vertices = np.array(mesh.vertices)
    vertices[:, 0] = -vertices[:, 0]
    return vertices