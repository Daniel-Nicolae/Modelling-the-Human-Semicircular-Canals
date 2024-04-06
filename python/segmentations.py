import pickle
from meshes import *


left = [13, 52, 70]
invalid = [59, 64]
right = [i for i in range(1, 74) if i not in left + invalid]

def compute_segments_dict(save_pickle=False):
    path = "../cochlea_data/canonical_coloured.ply"
    mesh = o3d.io.read_triangle_mesh(path)

    segments_dict = {"vertices": {}, "triangles": {}}
    col_dict = {"cochlea": [1, 0, 0], "vestibule": [1, 0.85098039, 0], "anterior": [0, 1.0, 0.01960784],
                "posterior": [0, 0.23529412, 1], "anterior-posterior": [0, 1, 0.85882353], "lateral": [0.49019608, 0.51764706, 1]}
    all_keys = list(col_dict.keys()) + ["anterior-full", "posterior-full"]
    for key in all_keys:
        segments_dict["vertices"][key] = []
        segments_dict["triangles"][key] = []

    vertex_colours = np.array(mesh.vertex_colors)
    # From the original indices to the new indices in the sub-mesh
    vertex_dict = {}
    for key in all_keys:
        vertex_dict[key] = {}

    # Vertices extraction
    for i, colour in enumerate(vertex_colours):
        for key in col_dict.keys():
            if np.linalg.norm(colour - np.array(col_dict[key])) < 1e-5:
                segments_dict["vertices"][key].append(i)
                vertex_dict[key][i] = len(segments_dict["vertices"][key]) - 1
        for key in ["anterior-full", "posterior-full"]:
            if (np.linalg.norm(colour - np.array(col_dict[key[:-5]])) < 1e-5 or 
            np.linalg.norm(colour - np.array(col_dict["anterior-posterior"])) < 1e-5):
                segments_dict["vertices"][key].append(i)
                vertex_dict[key][i] = len(segments_dict["vertices"][key]) - 1

    # Triangles extraction
    all_triangles = np.array(mesh.triangles)
    for triangle in all_triangles:
        for key in all_keys:
            if triangle[0] in vertex_dict[key] and triangle[1] in vertex_dict[key] and triangle[2] in vertex_dict[key]:
                new_triangle = [vertex_dict[key][triangle[0]], vertex_dict[key][triangle[1]], vertex_dict[key][triangle[2]]]
                segments_dict["triangles"][key].append(new_triangle)
        

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

def get_canal_mesh(subject, canal, full=False, center=False):
    path = get_ply_path(subject)
    mesh = o3d.io.read_triangle_mesh(path)
    if subject in left: mesh.vertices = o3d.utility.Vector3dVector(flip_left(mesh))
    segments_dict = load_segments_dict()

    if full and canal in ["anterior", "posterior"]: canal += "-full"

    vertices = np.array(mesh.vertices)[segments_dict["vertices"][canal]]
    triangles = segments_dict["triangles"][canal]
    if center: vertices -= np.mean(vertices, axis=0)
    
    return vertices, triangles