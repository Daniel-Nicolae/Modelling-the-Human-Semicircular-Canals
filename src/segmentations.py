import pickle
from meshes import *


def compute_segments_dict(save_pickle=False):
    path = "../cochlea_data/canonical_coloured.ply"
    mesh = o3d.io.read_triangle_mesh(path)

    segments_dict = {"vertices": {}, "triangles": {}}
    col_dict = {"cochlea": [1, 0, 0], "vestibule": [1, 0.85098039, 0], "anterior": [0, 1.0, 0.01960784],
                "posterior": [0, 0.23529412, 1], "anterior-posterior": [0, 1, 0.85882353], "lateral": [0.49019608, 0.51764706, 1]}
    for key in col_dict.keys():
        segments_dict["vertices"][key] = []
        segments_dict["triangles"][key] = []

    vertex_colours = np.array(mesh.vertex_colors)

    # Vertices extraction
    for i, colour in enumerate(vertex_colours):
        for key in col_dict.keys():
            if np.linalg.norm(colour - np.array(col_dict[key])) < 1e-5:
                segments_dict["vertices"][key].append(i)

    # Triangles extraction
    all_triangles = np.array(mesh.triangles)
    triangles = []
    for i, triangle in enumerate(all_triangles):
        for key in col_dict.keys():
            if np.linalg.norm(vertex_colours[triangle[0]] - np.array(col_dict[key])) < 1e-5:
                segments_dict["triangles"][key].append(i)
    
    if save_pickle:
        with open('../pickles/segments_dict.pickle', 'wb') as handle:
            pickle.dump(segments_dict, handle, protocol=pickle.HIGHEST_PROTOCOL)
    return segments_dict

def load_segments_dict():
    with open('../pickles/segments_dict.pickle', 'rb') as handle:
        segments_dict = pickle.load(handle)
    return segments_dict

def compute_colour_list():
    path = "../cochlea_data/canonical_coloured.ply"
    mesh = o3d.io.read_triangle_mesh(path)
    return np.array(mesh.vertex_colors)

def colour_mesh(mesh):
    colours = compute_colour_list()
    mesh.vertex_colors = o3d.utility.Vector3dVector(colours)
    return mesh 

def get_canal_mesh(subject, canal):
    path = get_ply_path(subject)
    mesh = o3d.io.read_triangle_mesh(path)
    if subject == 13: mesh.vertices = o3d.utility.Vector3dVector(flip_left(mesh))
    segments_dict = load_segments_dict()
    if canal == "anterior":
        vertex_indices = segments_dict["vertices"]["anterior"] + segments_dict["vertices"]["anterior-posterior"]
        triangle_indices = segments_dict["triangles"]["anterior"] + segments_dict["triangles"]["anterior-posterior"]
    elif canal == "posterior":
        vertex_indices = segments_dict["vertices"]["posterior"] + segments_dict["vertices"]["anterior-posterior"]
        triangle_indices = segments_dict["triangles"]["posterior"] + segments_dict["triangles"]["anterior-posterior"]
    elif canal == "lateral":
        vertex_indices = segments_dict["vertices"]["lateral"]
        triangle_indices = segments_dict["triangles"]["lateral"]
    else:
        raise ValueError("The canal can be either anterior, posterior or lateral. Canal "+canal+" is not a valid canal!")
    
    return np.array(mesh.vertices)[vertex_indices], np.array(mesh.triangles)[vertex_indices]



