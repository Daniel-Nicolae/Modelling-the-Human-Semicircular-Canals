from segmentations import *
from fit import *


def visualise_meshes(meshes):
    o3d.visualization.draw_geometries(meshes, mesh_show_back_face=True)


def visualise_segmented_subjects(subjects):
    if type(subjects) == int: subjects = [subjects]
    meshes = []
    for i in subjects:
        path = get_ply_path(i)
        mesh = o3d.io.read_triangle_mesh(path)
        mesh_coloured = colour_mesh(mesh)
        mesh_coloured.compute_vertex_normals()
        if i == 13: mesh_coloured.vertices = o3d.utility.Vector3dVector(flip_left(mesh_coloured))
        mesh_coloured.vertices = o3d.utility.Vector3dVector(center_mesh_vertices(mesh_coloured))
        meshes.append(mesh_coloured)
    visualise_meshes(meshes)


def visualise_canal_planes(subjects, canal, landmarks=None):
    all_lines = []
    all_canal_meshes = []
    colour_step = 1.0/len(subjects)

    offset = np.zeros(3)
    for i, subject in enumerate(subjects):
        vals, vecs, vertices = get_canal_plane(subject, canal, landmarks)
        # if vecs[:, 0].dot(np.array([1, 1, 1])) >= 0: vecs[:, 0] *= -1
        offset += 20*vals[0]*vecs[:, 0]

        canal_mesh = o3d.geometry.PointCloud()
        canal_mesh.points = o3d.utility.Vector3dVector(vertices + offset)
        canal_mesh.paint_uniform_color([0, 1-colour_step*i, colour_step*i]) 

        lines = o3d.geometry.LineSet()
        a = vecs[:, 2]*np.sqrt(vals[2])*2 # "major semiaxis"
        b = vecs[:, 1]*np.sqrt(vals[1])*2 # "minor semiaxis"
        lines.points = o3d.utility.Vector3dVector([list(b+offset), list(b+a+offset), list(b-a+offset), 
                                                list(a+offset), list(-a+offset), list(-b+offset), 
                                                list(-b+a+offset), list(-b-a+offset)])
        lines.lines = o3d.utility.Vector2iVector([[1, 2], [3, 4], [6, 7],   # major
                                                    [0, 5], [1, 6], [2, 7]])  # minor
        lines.colors = o3d.utility.Vector3dVector([[1, colour_step*i, 0], [1, colour_step*i, 0], [1, colour_step*i, 0], 
                                                [colour_step*i, 0, 1], [colour_step*i, 0, 1], [colour_step*i, 0, 1]])

        all_canal_meshes.append(canal_mesh)
        all_lines.append(lines)

    o3d.visualization.draw_geometries([*all_canal_meshes, *all_lines])



def visualise_subject_planes(subject):
    all_lines = []
    for canal in ["anterior", "posterior", "lateral"]:

        vals, vecs, _ = get_canal_plane(subject, canal) 
        canal_centroid = np.mean(get_canal_vertices(subject, canal), axis=0)

        lines = o3d.geometry.LineSet()
        a = vecs[:, 2]*np.sqrt(vals[2])*2 # "major semiaxis"
        b = vecs[:, 1]*np.sqrt(vals[1])*2 # "minor semiaxis"
        lines.points = o3d.utility.Vector3dVector([list(b+canal_centroid), list(b+a+canal_centroid), list(b-a+canal_centroid), 
                                                   list(a+canal_centroid), list(-a+canal_centroid), list(-b+canal_centroid), list(-b+a+canal_centroid), list(-b-a+canal_centroid)])
        lines.lines = o3d.utility.Vector2iVector([[1, 2], [3, 4], [6, 7],   # major
                                                    [0, 5], [1, 6], [2, 7]])  # minor
        lines.colors = o3d.utility.Vector3dVector([[1, 0, 0], [1, 0, 0], [1, 0, 0], 
                                                   [0, 0, 1], [0, 0, 1], [0, 0, 1]])
        all_lines.append(lines)

    path = get_ply_path(subject)
    mesh = o3d.io.read_triangle_mesh(path)
    mesh_coloured = colour_mesh(mesh)
    mesh_coloured.compute_vertex_normals()

    o3d.visualization.draw_geometries([mesh_coloured, *all_lines])