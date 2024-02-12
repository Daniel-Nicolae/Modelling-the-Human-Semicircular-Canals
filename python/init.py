from landmarks import copy_landmarks
from segmentations import compute_segments_dict
from fit import compute_fiducials_dicts, correct_fiducials_dicts, get_best_canal_mean_mesh, left, right, canals
from variations import compute_variation_modes

for i in range(1, 54):
    copy_landmarks(i)

compute_segments_dict(save_pickle=True)
compute_fiducials_dicts(save_pickle=True)
correct_fiducials_dicts(save_pickle=True)

for canal in canals:
    compute_variation_modes(right, canal, save_pickle=True)
    get_best_canal_mean_mesh(right, canal, True, True)