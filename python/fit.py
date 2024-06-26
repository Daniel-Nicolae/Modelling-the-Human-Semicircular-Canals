from segmentations import *
from landmarks import *
import numpy as np
import copy

canals = ["anterior", "posterior", "lateral"]

def get_rotation_matrix(subject, landmarks, error=0):
    if len(landmarks) != 3: raise ValueError("Must pass 3 landmarks")
    landmarks_dict = get_landmarks_from_ply(subject)
    for i in range(3):
        if landmarks[i] not in landmarks_dict.keys():
            raise ValueError(landmarks[i] + " is not a valid landmark!")
        
    
    A = np.array(landmarks_dict[landmarks[0]])*100 + np.random.normal(0, error*10)
    B = np.array(landmarks_dict[landmarks[1]])*100 + np.random.normal(0, error*10)
    C = np.array(landmarks_dict[landmarks[2]])*100 + np.random.normal(0, error*10)

    x = (B-A)/np.linalg.norm(B-A)
    y = (C-A) - (C-A).dot(x) * x
    y /= np.linalg.norm(y)
    z = np.cross(x, y)

    return np.array([x, y, z])

def rotate_vertices(vertices, matrix):
    return np.tensordot(matrix, vertices.T, axes=1).T

def rotate_vector(vector, matrix):
    return matrix.dot(vector)


def rotate_mesh(mesh, matrix):
    mesh_transformed = copy.deepcopy(mesh)
    vertices = np.array(mesh_transformed.vertices)
    mesh_transformed.vertices = o3d.utility.Vector3dVector(rotate_vertices(vertices, matrix))
    return mesh_transformed


def get_canal_plane(subject, canal, landmarks=None, error=0):
    vertices, triangles = get_canal_mesh(subject, canal)
    vertices -= np.mean(vertices, axis=0)

    covariance_matrix = np.zeros((3, 3))
    for vertex in vertices:
        covariance_matrix += np.outer(vertex, vertex)
    covariance_matrix /= (len(vertices)-1)
    vals, vecs = np.linalg.eigh(covariance_matrix)

    # flip standardisation
    if canal == "posterior":
        if vecs[0, 0] < 0: vecs[:, 0] *= -1
        if vecs[0, 1] < 0: vecs[:, 1] *= -1
    if canal == "anterior":
        if vecs[0, 0] < 0: vecs[:, 0] *= -1
        if vecs[2, 1] < 0: vecs[:, 1] *= -1
    if canal == "lateral":
        if vecs[2, 0] < 0: vecs[:, 0] *= -1
        if vecs[0, 1] > 0: vecs[:, 0] *= -1
    vecs[:, 2] = np.cross(vecs[:, 0], vecs[:, 1])

    if landmarks is not None:
        rotation_matrix = get_rotation_matrix(subject, landmarks, error=error)
        for i in range(3):
            vecs[:, i] = rotate_vector(vecs[:, i], rotation_matrix)

    return vals, vecs

def get_subjects_having_landmarks(subjects, landmarks):
    kept = []
    if landmarks is None or len(landmarks) == 0: return subjects
    for subject in subjects:
        keep = True
        landmarks_dict = get_landmarks_from_ply(subject)
        for landmark in landmarks:
            if landmark not in landmarks_dict.keys(): keep = False
        if keep: kept.append(subject)
    return kept

def compute_normals(subjects, canal, landmarks=None, error=0):
    normals = []
    for subject in subjects:
        vals, vecs = get_canal_plane(subject, canal, landmarks, error=error)

        # rotation_matrix = get_rotation_matrix(subject, landmarks, error=error)
        # for i in range(3):
        #     vecs[:, i] = rotate_vector(vecs[:, i], rotation_matrix)

        normals.append(vecs[:, 0])
    return np.array(normals)

def compute_average_coord_system(subjects, canal, landmarks=None):
    coord_systems = np.zeros((len(subjects), 3, 3))
    for s, subject in enumerate(subjects):
        vals, vecs = get_canal_plane(subject, "posterior", landmarks)
        coord_systems[s, :, :] = vecs[:, :].T
    return np.mean(coord_systems, axis=0)

def get_best_coord_system(subjects, canal, visible=True, corrected=False):
    results_dict, best_fids_dict, min_angs_dict, max_improvs_dict, kept_dict = load_fiducials_dicts(visible, corrected)
    best_landmarks = get_landmarks_from_key(best_fids_dict[canal][0])
    kept = get_subjects_having_landmarks(subjects, best_landmarks)
    return compute_average_coord_system(kept, canal, best_landmarks)

def compute_normals_stats(subjects, canal, landmarks=None, verbose=False, filter=False, error=0):
    if filter: subjects = get_subjects_having_landmarks(subjects, landmarks)
    normals = compute_normals(subjects, canal, landmarks, error=error)
    sample_cov = np.zeros((3, 3))
    mean_normal = np.mean(normals, axis = 0)
    angles = []
    for normal in normals:
        sample_cov += np.outer(normal-mean_normal, normal-mean_normal)
        angles.append(np.arccos(np.dot(mean_normal, normal))*180/np.pi)
    if verbose: print("Canal {}. Landmarks {}. Used {} subjects: {}".format(canal, landmarks, len(subjects), subjects))
    return mean_normal, sample_cov / (len(subjects) - 1), np.mean(angles), np.max(angles)

def compute_fiducials_dicts(visible=True, restrict_ear=True, save_pickle=False, verbose=False):
    landmarks = ["right soft anterior", "right soft posterior", "left soft anterior", "left soft posterior", "occiput",
                  "septum", "nasion", "left top orbit", "left bottom orbit", "right top orbit", "right bottom orbit"]

    if visible:
        filename = "../pickles/fiducials_dicts_visible.pickle"
    else:
        filename = "../piclkes/fiducials_dicts_full.pickle"
        landmarks += ["right bony anterior", "right bony posterior"]
    N = len(landmarks)
    min_angs_dict = {"anterior": 100, "lateral": 100, "posterior": 100, "all": 100}
    max_improvs_dict = {"anterior": 0, "lateral": 0, "posterior": 0, "all": 0}
    best_fids_dict = {"anterior": ["name", "name"], "lateral": ["name", "name"], "posterior": ["name", "name"], "all": ["name", "name"]}
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
                    if restrict_ear and "left soft anterior" in triplet and "left soft posterior" in triplet: break

                    key = triplet[0] + ", " + triplet[1] + ", " + triplet[2]
                    results_dict[key] = {}
                    results_sum = [0, 0]

                    # Filter out subjects without desired fiducials
                    subjects_kept = get_subjects_having_landmarks(right, triplet)
                    kept_dict[key] = len(subjects_kept)
                    for canal in canals:
                        mean, cov, ang_mean, ang_max = compute_normals_stats(subjects_kept, canal, triplet, verbose=verbose)
                        mean, cov, ang_mean_before, ang_max = compute_normals_stats(subjects_kept, canal, verbose=False)
                        improvement = (ang_mean_before-ang_mean)/ang_mean_before
                        results_dict[key][canal] = [ang_mean, improvement]

                    # Find angle optimum and improvement optimum
                        if ang_mean < min_angs_dict[canal]: 
                            best_fids_dict[canal][0] = key
                            min_angs_dict[canal] = ang_mean
                        results_sum[0] += ang_mean
                        if improvement > max_improvs_dict[canal]: 
                            best_fids_dict[canal][1] = key
                            max_improvs_dict[canal] = improvement
                        results_sum[1] += improvement
                    if results_sum[0]/3 < min_angs_dict["all"]: 
                        best_fids_dict["all"][0] = key
                        min_angs_dict["all"] = results_sum[0]/3
                    if results_sum[1]/3 > max_improvs_dict["all"]: 
                        best_fids_dict["all"][1] = key
                        max_improvs_dict["all"] = results_sum[1]/3
    if save_pickle:
        with open(filename, 'wb') as handle:
            pickle.dump((results_dict, best_fids_dict, min_angs_dict, max_improvs_dict, kept_dict), handle, protocol=pickle.HIGHEST_PROTOCOL)
    return results_dict, best_fids_dict, min_angs_dict, max_improvs_dict, kept_dict

def correct_fiducials_dicts(visible=True, save_pickle=False):
    results_dict, best_fids_dict, min_angs_dict, max_improvs_dict, kept_dict = load_fiducials_dicts(visible)

    min_angs_dict = {"anterior": 100, "lateral": 100, "posterior": 100, "all": 100}
    max_improvs_dict = {"anterior": 0, "lateral": 0, "posterior": 0, "all": 0}
    best_fids_dict = {"anterior": ["name", "name"], "lateral": ["name", "name"], "posterior": ["name", "name"], "all": ["name", "name"]}

    for key in results_dict:
        if kept_dict[key] >= 25 and "occiput" not in key: 
            for canal in ["anterior", "posterior", "lateral"]:
                if results_dict[key][canal][0] < min_angs_dict[canal]:
                    min_angs_dict[canal] = results_dict[key][canal][0]
                    best_fids_dict[canal][0] = key
                if results_dict[key][canal][1] > max_improvs_dict[canal]:
                    max_improvs_dict[canal] = results_dict[key][canal][1]
                    best_fids_dict[canal][1] = key

    if save_pickle:
        if visible: filename = "../pickles/fiducials_dicts_visible_c.pickle"
        else: filename = "../piclkes/fiducials_dicts_full_c.pickle"
        with open(filename, 'wb') as handle:
            pickle.dump((results_dict, best_fids_dict, min_angs_dict, max_improvs_dict, kept_dict), handle, protocol=pickle.HIGHEST_PROTOCOL)
    return results_dict, best_fids_dict, min_angs_dict, max_improvs_dict, kept_dict

def load_fiducials_dicts(visible=True, corrected=False):
    if visible: filename = "../pickles/fiducials_dicts_visible"
    else: filename = "../pickles/fiducials_dicts_full"
    if corrected: filename += "_c"
    filename += ".pickle"
    with open(filename, 'rb') as handle:
        dict_tuple = pickle.load(handle)
    return dict_tuple

def get_landmarks_from_key(key):
    return key.split(", ")

def get_canal_mean_mesh(subjects, canal, landmarks, full=True, save=False):

    kept = get_subjects_having_landmarks(subjects, landmarks)
    mean_vertices = np.zeros(get_canal_mesh(1, canal, full=full)[0].shape)
    for subject in kept:
        vertices = get_canal_mesh(subject, canal, full, True)[0] 
        rotation_matrix = get_rotation_matrix(subject, landmarks)
        vertices = rotate_vertices(vertices, rotation_matrix)
        mean_vertices += vertices
    mean_vertices /= len(kept)

    mean_mesh = o3d.geometry.TriangleMesh()
    mean_mesh.vertices = o3d.utility.Vector3dVector(mean_vertices)

    segments_dict = load_segments_dict()
    if canal in ["anterior", "posterior"] and full: canal += "-full"
    triangles = segments_dict["triangles"][canal]
    mean_mesh.triangles = o3d.utility.Vector3iVector(triangles)
    mean_mesh.compute_vertex_normals()

    if save:
        if full and canal[0] in ["a", "p"]: canal = canal[:-5]
        path = "../meshes/{}_mesh.ply".format(canal)
        o3d.io.write_triangle_mesh(path, mean_mesh)

    return mean_mesh

def get_best_canal_mean_mesh(subjects, canal, full=True, corrected=False, save=False):
    results_dict, best_fids_dict, min_angs_dict, max_improvs_dict, kept_dict = load_fiducials_dicts(corrected=corrected)
    best_landmarks = get_landmarks_from_key(best_fids_dict[canal][0])
    print(best_landmarks)
    return get_canal_mean_mesh(subjects, canal, best_landmarks, full, save)