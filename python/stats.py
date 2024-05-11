import scipy.stats as stats
import numpy as np

from fit import compute_normals, correct_fiducials_dicts, get_landmarks_from_key, get_subjects_having_landmarks, load_fiducials_dicts
from segmentations import right

def get_angles(canal, landmarks, subjects=right):
    subjects = get_subjects_having_landmarks(subjects, landmarks)
    normals = compute_normals(subjects, canal, landmarks)
    mean_normal = np.mean(normals, axis = 0)
    angles = []

    for normal in normals:
        angles.append(np.arccos(np.dot(mean_normal, normal))*180/np.pi)
    return angles


def wilcoxon_canal(canal):
    results_dict, best_fids_dict1, min_angs_dict, max_improvs_dict, kept_dict = load_fiducials_dicts()
    results_dict, best_fids_dict2, min_angs_dict, max_improvs_dict, kept_dict = correct_fiducials_dicts()

    fids1 = get_landmarks_from_key(best_fids_dict1[canal][0])
    fids2 = get_landmarks_from_key(best_fids_dict2[canal][0])

    angles1 = get_angles(canal, fids1)
    angles2 = get_angles(canal, fids2)

    return stats.mannwhitneyu(angles1, angles2)


def t_test_canal(canal):
    results_dict, best_fids_dict1, min_angs_dict, max_improvs_dict, kept_dict = load_fiducials_dicts()
    results_dict, best_fids_dict2, min_angs_dict, max_improvs_dict, kept_dict = correct_fiducials_dicts()

    fids1 = get_landmarks_from_key(best_fids_dict1[canal][0])
    fids2 = get_landmarks_from_key(best_fids_dict2[canal][0])

    angles1 = get_angles(canal, fids1)
    angles2 = get_angles(canal, fids2)

    print(len(angles1) + len(angles2))

    return stats.ttest_ind(angles1, angles2)
    