from landmarks import copy_landmarks
from segmentations import compute_segments_dict


for i in range(1, 25):
    copy_landmarks(i)

compute_segments_dict(save_pickle=True)