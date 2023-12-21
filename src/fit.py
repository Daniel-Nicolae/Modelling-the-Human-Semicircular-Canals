from segmentations import *
from landmarks import *
import copy

left = [13, 52]
right = [i for i in range(1, 54) if i not in left + [46, 48]]

def get_rotation_matrix(subject, landmarks):
    if len(landmarks) != 3: raise ValueError("Must pass 3 landmarks")
    landmarks_dict = get_landmarks_from_ply(subject)
    for i in range(3):
        if landmarks[i] not in landmarks_dict.keys():
            raise ValueError(landmarks[i] + " is not a valid landmark!")
        
    A = np.array(landmarks_dict[landmarks[0]])*100
    B = np.array(landmarks_dict[landmarks[1]])*100
    C = np.array(landmarks_dict[landmarks[2]])*100

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

def get_subjects_having_landmarks(subjects, landmarks):
    kept = []
    if landmarks is None or len(landmarks) == 0: return subjects
    for subject in subjects:
        keep = 1
        landmarks_dict = get_landmarks_from_ply(subject)
        for landmark in landmarks:
            if landmark not in landmarks_dict.keys(): keep = 0
        if keep: kept.append(subject)
    return kept

def compute_normals(subjects, canal, landmarks=None):
    normals = []
    for subject in subjects:
        vals, vecs, vertices = get_canal_plane(subject, canal, landmarks)
        normals.append(vecs[:, 0])
    return np.array(normals)

def compute_normals_stats(subjects, canal, landmarks=None, verbose=False, filter=False):
    if filter: subjects = get_subjects_having_landmarks(subjects, landmarks)
    normals = compute_normals(subjects, canal, landmarks)
    sample_cov = np.zeros((3, 3))
    mean_normal = np.mean(normals, axis = 0)
    angles = []
    for normal in normals:
        sample_cov += np.outer(normal-mean_normal, normal-mean_normal)
        angles.append(np.arccos(np.dot(mean_normal, normal)))
    if verbose: print("Canal {}. Landmarks {}. Used {} subjects: {}".format(canal, landmarks, len(subjects), subjects))
    return mean_normal, sample_cov / (len(subjects) - 1), np.mean(angles), np.max(angles)

def compute_fiducials_dicts(visible=True, restrict_ear=True, save_pickle=False, verbose=False):
    landmarks = ["right soft anterior", "right soft posterior", "nasion", "right top orbit", "right bottom orbit",
                 "left soft anterior", "left soft posterior", "occiput", "septum", "left top orbit", "left bottom orbit"]

    if visible:
        filename = "../pickles/fiducials_dicts_visible.pickle"
    else:
        filename = "../piclkes/fiducials_dicts_full.pickle"
        landmarks += ["right bony anterior", "right bony posterior"]
    N = len(landmarks)
    min_angs_dict = {"anterior": [10, 10], "lateral": [10, 10], "posterior": [10, 10], "all": [30, 30]}
    min_fids_dict = {"anterior": ["name", "name"], "lateral": ["name", "name"], "posterior": ["name", "name"], "all": ["name", "name"]}
    results_dict = {}

    kept_dict = {}

    # Iterate through all fiducials
    for i in range(N):
        A = landmarks[i]
        for j in range(i + 1, N):
            B = landmarks[j]
            for k in range(j + 1, N):
                C = landmarks[k]

                # For every set of 3 there are three distinct coordinate systems possible
                for p, triplet in enumerate([[A, B, C], [B, C, A], [C, A, B]]):

                    # Filter out problematic triplets
                    if "occiput" in triplet and "septum" in triplet: break
                    if restrict_ear and "right soft anterior" in triplet and "right soft posterior" in triplet: break

                    key = A + ", " + B + ", " + C
                    results_dict[key] = {}
                    ang_sum = [0, 0]

                    # Filter out subjects without desired fiducials
                    if p == 0:
                        subjects_kept = get_subjects_having_landmarks(right, triplet)
                        kept_dict[key] = len(subjects_kept)
                    for canal in ["anterior", "posterior", "lateral"]:
                        mean, cov, ang_mean, ang_max = compute_normals_stats(subjects_kept, canal, triplet, verbose=verbose)
                        results_dict[key][canal] = [ang_mean, ang_max]

                    # Find l-2 and l-inf optima
                        for l, ang in zip([0, 1], [ang_mean, ang_max]):
                            if ang < min_angs_dict[canal][l]: 
                                min_fids_dict[canal][l] = key
                                min_angs_dict[canal][l] = ang
                            ang_sum[l] += ang
                    for l, sum in zip([0, 1], ang_sum):
                        if sum/len(subjects_kept) < min_angs_dict["all"][l]: 
                            min_fids_dict["all"][l] = key
                            min_angs_dict["all"][l] = sum/len(subjects_kept)
    if save_pickle:
        with open(filename, 'wb') as handle:
            pickle.dump((results_dict, min_fids_dict, min_angs_dict, kept_dict), handle, protocol=pickle.HIGHEST_PROTOCOL)
    return results_dict, min_fids_dict, min_angs_dict

def load_fiducials_dicts(visible):
    if visible: filename = "../pickles/fiducials_dicts_visible.pickle"
    else: filename = "../pickles/fiducials_dicts_full.pickle"
    with open(filename, 'rb') as handle:
        dict_tuple = pickle.load(handle)
    return dict_tuple

def get_landmarks_from_key(key):
    return key.split(", ")