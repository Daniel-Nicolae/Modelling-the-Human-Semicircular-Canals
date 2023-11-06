from landmarks import copy_landmarks
from segmentations import compute_segments_dict
from fit import compute_fiducials_dicts


for i in range(1, 25):
    copy_landmarks(i)

compute_segments_dict(save_pickle=True)
compute_fiducials_dicts(save_pickle=True)