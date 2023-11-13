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


def rotate_mesh(mesh, matrix):
    mesh_transformed = copy.deepcopy(mesh)
    vertices = np.array(mesh_transformed.vertices)
    mesh_transformed.vertices = o3d.utility.Vector3dVector(rotate_vertices(vertices, matrix))
    return mesh_transformed


def get_canal_plane(subject, canal, landmarks=None):
    vertices, triangles = get_canal_mesh(subject, canal)
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
        vertices = rotate_vertices(vertices, rotation_matrix)

    return vals, vecs, vertices

def compute_normals(subjects, canal, landmarks=None):
    normals = []
    for subject in subjects:
        vals, vecs, vertices = get_canal_plane(subject, canal, landmarks)
        normals.append(vecs[:, 0])
    return np.array(normals)

def compute_normals_stats(subjects, canal, landmarks=None):
    normals = compute_normals(subjects, canal, landmarks)
    sample_cov = np.zeros((3, 3))
    mean_normal = np.mean(normals, axis = 0)
    for normal in normals:
        sample_cov += np.outer(normal-mean_normal, normal-mean_normal)
    return mean_normal, sample_cov / (len(subjects) - 1)

def compute_fiducials_dicts(visible=True, restrict_ear=False, save_pickle=False):
    landmarks = ["right soft anterior", "right soft posterior", "nasion", "right top orbit", "right bottom orbit"]
    if visible:
        filename = "fiducials_dicts_visible.pickle"
    else:
        filename = "fiducials_dicts_full.pickle"
        landmarks += ["right bony anterior", "right bony posterior"]
    N = len(landmarks)
    min_vars_dict = {"anterior": 1, "lateral": 1, "posterior": 1, "all": 3}
    min_fids_dict = {"anterior": "name", "lateral": "name", "posterior": "name", "all": "name"}
    results_dict = {}
    for i in range(N):
        A = landmarks[i]
        for j in range(i + 1, N):
            B = landmarks[j]
            for k in range(j + 1, N):
                C = landmarks[k]
                for pair in [[A, B, C], [B, C, A], [C, A, B]]:
                    if restrict_ear and "right soft anterior" in pair and "right soft posterior" in pair: break
                    key = A + ", " + B + ", " + C
                    results_dict[key] = {}
                    var_sum = 0
                    for canal in ["anterior", "posterior", "lateral"]:
                        mean, cov = compute_normals_stats(right, canal, pair)
                        var =  np.linalg.det(cov)
                        results_dict[key][canal] = var
                        if var < min_vars_dict[canal]: 
                            min_fids_dict[canal] = key
                            min_vars_dict[canal] = var
                        var_sum += var
                    if var_sum < min_vars_dict["all"]: 
                        min_fids_dict["all"] = key
                        min_vars_dict["all"] = var
    if save_pickle:
        with open(filename, 'wb') as handle:
            pickle.dump((results_dict, min_fids_dict, min_vars_dict), handle, protocol=pickle.HIGHEST_PROTOCOL)
    return results_dict, min_fids_dict, min_vars_dict

def load_fiducials_dicts(visible):
    if visible: filename = "../pickles/fiducials_dicts_visible.pickle"
    else: filename = "../pickles/fiducials_dicts_full.pickle"
    with open(filename, 'rb') as handle:
        dict_tuple = pickle.load(handle)
    return dict_tuple