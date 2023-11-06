from segmentations import *
from landmarks import *
import copy

left = [13]
right = [3, 4, 6, 7, 8, 9, 10, 11, 14, 15, 17, 18, 20, 21, 22, 23, 24]

def get_rotation_matrix(subject, landmarks):
    if len(landmarks) != 3: raise ValueError("Must pass 3 landmarks")
    landmarks_dict = get_landmarks_from_ply(subject)
    for i in range(3):
        if landmarks[i] not in landmarks_dict.keys():
            raise ValueError(landmarks[i] + " is not a valid landmark!")
        
    A = np.array(landmarks_dict[landmarks[0]])
    B = np.array(landmarks_dict[landmarks[1]])
    C = np.array(landmarks_dict[landmarks[2]])

    x = (B-A)/np.linalg.norm(B-A)
    y = (C-A) - (C-A).dot(x) * x
    y /= np.linalg.norm(y)
    z = np.cross(x, y)

    return np.array([x, y, z])

def rotate_vertices(vertices, matrix):
    vertices_transformed = np.zeros(vertices.shape)
    for i, vertex in enumerate(vertices):
        vertices_transformed[i] = matrix.dot(vertex)
    return vertices_transformed

def rotate_vector(vector, matrix):
    return matrix.dot(vector)


def transform_mesh(mesh, matrix):
    mesh_transformed = copy.deepcopy(mesh)
    vertices = np.array(mesh_transformed.vertices)
    mesh_transformed.vertices = o3d.utility.Vector3dVector(rotate_vertices(vertices, matrix))
    return mesh_transformed


def get_canal_plane(subject, canal, landmarks=None):
    vertices = get_canal_vertices(subject, canal)
    vertices -= np.mean(vertices, axis=0)

    covariance_matrix = np.zeros((3, 3))
    for vertex in vertices:
        covariance_matrix += np.outer(vertex, vertex)
    covariance_matrix /= (len(vertices)-1)
    vals, vecs = np.linalg.eigh(covariance_matrix)

    # flip standardisation
    if canal == "lateral":
        if vecs[2, 0] < 0: vecs[:, 0] *= -1
    else:
        if vecs[0, 0] < 0: vecs[:, 0] *= -1

    if landmarks is not None:
        rotation_matrix = get_rotation_matrix(subject, landmarks)
        for i in range(3):
            vecs[:, i] = rotate_vector(vecs[:, i], rotation_matrix)

    return vals, vecs, vertices