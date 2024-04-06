from fit import *

def compute_variation_modes(subjects, canal, fiducials=None, mode=0, corrected=False, save_pickle=False):
    if fiducials is None:
        results_dict, fiducials_dict, best_angles, best_improvs, kept_dict = load_fiducials_dicts(visible=True, corrected=corrected)
        fiducials = get_landmarks_from_key(fiducials_dict[canal][mode])
    kept = get_subjects_having_landmarks(subjects, fiducials)
    vertices, t = get_canal_mesh(kept[0], canal)
    sample_cov = np.zeros((len(vertices)*3, len(vertices)*3))
    mean_vertices = np.zeros(len(vertices)*3)
    for subject in kept:
        vertices, t = get_canal_mesh(subject, canal)
        rotation = get_rotation_matrix(subject, fiducials)
        vertices = rotate_vertices(vertices-np.mean(vertices, axis=0), rotation)
        mean_vertices += vertices.reshape(vertices.shape[0] * 3)
    mean_vertices /= len(kept)
    for subject in kept:
        vertices, t = get_canal_mesh(subject, canal)
        rotation = get_rotation_matrix(subject, fiducials)
        vertices = rotate_vertices(vertices-np.mean(vertices, axis=0), rotation)
        vertices = vertices.reshape(vertices.shape[0] * 3)
        sample_cov += np.outer(vertices - mean_vertices, vertices - mean_vertices)
    sample_cov /= len(kept) - 1
    evals, evecs = np.linalg.eigh(sample_cov)

    if save_pickle:
        with open('../pickles/variation_modes_{}.pickle'.format(canal), 'wb') as handle:
            pickle.dump((evals[-20:], evecs[:, -20:]), handle, protocol=pickle.HIGHEST_PROTOCOL)
    return evals[-20:], evecs[:, -20:]

def load_variation_modes(canal):
    path = '../pickles/variation_modes_{}.pickle'.format(canal)
    with open(path, 'rb') as handle:
        evals, evecs = pickle.load(handle)
    return evals, evecs

def get_correlation_from_covariance(covariance):
    N = len(covariance)
    var_mat = np.tile(np.sqrt(np.diag(covariance)), (N, 1))
    return covariance / (var_mat * var_mat.T)