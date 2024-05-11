from segmentations import *
from variations import *


def visualise_meshes(meshes):
    o3d.visualization.draw_geometries(meshes, mesh_show_back_face=True)

def visualise_vertices(vertices, has_color=False):
    vertices -= np.mean(vertices, axis=0)
    cloud = o3d.geometry.PointCloud()
    cloud.points = o3d.utility.Vector3dVector(vertices)
    if not has_color: cloud.paint_uniform_color([1, 0.7, 0]) 
    o3d.visualization.draw_geometries([cloud])

def visualise_canal_mesh(subject, canal):
    col_dict = {"anterior": [0, 1.0, 0], "posterior": [0, 0.23, 1], "lateral": [0.5, 0.5, 1]}
    vertices, triangles = get_canal_mesh(subject, canal)
    canal_mesh = o3d.geometry.TriangleMesh()
    canal_mesh.vertices = o3d.utility.Vector3dVector(vertices)
    canal_mesh.triangles = o3d.utility.Vector3iVector(triangles)
    canal_mesh.compute_vertex_normals()
    canal_mesh.paint_uniform_color(col_dict[canal])
    visualise_meshes([canal_mesh])

def visualise_segmented_subjects(subjects):
    if type(subjects) == int: subjects = [subjects]
    meshes = []
    for i in subjects:
        path = get_ply_path(i)
        mesh = o3d.io.read_triangle_mesh(path)
        mesh_coloured = colour_mesh(mesh)
        if i in left: mesh_coloured.vertices = o3d.utility.Vector3dVector(flip_left(mesh_coloured))
        mesh_coloured.compute_vertex_normals()
        mesh_coloured.vertices = o3d.utility.Vector3dVector(center_mesh_vertices(mesh_coloured))
        meshes.append(mesh_coloured)
    visualise_meshes(meshes)


def visualise_canal_planes(subjects, canal, landmarks=None, filter=False, rotate=True, verbose=False):
    if filter: subjects = get_subjects_having_landmarks(subjects, landmarks)
    if verbose: print("Subjects shown (green to blue):", subjects)

    all_lines = []
    all_canal_meshes = []
    blue = np.array([0x00, 0x22, 0xaa])/256
    gold = np.array([0xff, 0xbb, 0x33])/256
    colour_step = (gold - blue) / len(subjects)

    offset = np.zeros(3)
    for i, subject in enumerate(subjects):
        vertices = get_canal_mesh(subject, canal, True, True)[0] 
        if landmarks is not None and rotate:
            vals, vecs = get_canal_plane(subject, canal, landmarks)
            rotation_matrix = get_rotation_matrix(subject, landmarks)
            vertices = rotate_vertices(vertices, rotation_matrix)
        else: 
            vals, vecs = get_canal_plane(subject, canal)
        offset += 20*vals[0]*vecs[:, 0]

        canal_mesh = o3d.geometry.PointCloud()
        canal_mesh.points = o3d.utility.Vector3dVector(vertices + offset)

        canal_mesh.paint_uniform_color(blue + i*colour_step) 

        lines = o3d.geometry.LineSet()
        a = vecs[:, 2]*np.sqrt(vals[2])*2 # "major semiaxis"
        b = vecs[:, 1]*np.sqrt(vals[1])*2 # "minor semiaxis"
        lines.points = o3d.utility.Vector3dVector([list(b+offset), list(b+a+offset), list(b-a+offset), 
                                                list(a+offset), list(-a+offset), list(-b+offset), 
                                                list(-b+a+offset), list(-b-a+offset)])
        lines.lines = o3d.utility.Vector2iVector([[1, 2], [3, 4], [6, 7],   # major
                                                    [0, 5], [1, 6], [2, 7]])  # minor
        lines.colors = o3d.utility.Vector3dVector([[1, 0, 0], [1, 0, 0], [1, 0, 0], 
                                                [0, 0, 1], [0, 0, 1], [0, 0, 1]])

        all_canal_meshes.append(canal_mesh)
        all_lines.append(lines)

    o3d.visualization.draw_geometries([*all_canal_meshes, *all_lines])


def best_alignment(subjects, canal, mode, visible=True, all=False, corrected=False, verbose=False):
    if all: key = "all"
    else: key = canal
    results_dict, best_fids_dict, best_angles, best_improvs, kept_dict = load_fiducials_dicts(visible, corrected)
    best_landmarks = get_landmarks_from_key(best_fids_dict[key][mode])
    kept = get_subjects_having_landmarks(subjects, best_landmarks)

    mean_ang, improvement = results_dict[best_fids_dict[key][mode]][key]
    mean_init, cov_init, mean_ang_init, max_ang_init = compute_normals_stats(kept, canal)
    
    if verbose: 
        print("Canal {}".format(canal))
        print("Subjects shown (green to blue):", kept)
        print("Best landmarks", best_landmarks)
        print("Spread before:", mean_ang_init)
        print("Spread after:", mean_ang)
        print("Improvement:", improvement)
    visualise_canal_planes(kept, canal, best_landmarks)



def visualise_subject_planes(subject):
    all_lines = []
    for canal in ["anterior", "posterior", "lateral"]:

        vals, vecs = get_canal_plane(subject, canal) 
        canal_centroid = np.mean(get_canal_mesh(subject, canal)[0], axis=0)

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

def visualise_variation_modes(subject, canal, save_screenshots=False):
    evals, evecs = load_variation_modes(canal)
    
    canal_mesh = o3d.geometry.TriangleMesh()
    v, t = get_canal_mesh(subject, canal)
    canal_mesh.vertices = o3d.utility.Vector3dVector(v)
    canal_mesh.triangles = o3d.utility.Vector3iVector(t)
    canal_mesh.compute_vertex_normals()
    canal_mesh.paint_uniform_color([0, 0.7, 1]) 

    points_original = o3d.geometry.PointCloud()
    points_original.points = o3d.utility.Vector3dVector(v)
    points_original.paint_uniform_color([1, 0.7, 0]) 

    mode_vertices = evecs[:, -1].reshape(len(v), 3)
    step = np.sqrt(evals[-1])/25
    step_count = 0

    def set_mode_1(vis):
        nonlocal mode_vertices, step
        reset1()
        mode_vertices = evecs[:, -1].reshape(len(v), 3)
        step = np.sqrt(evals[-1])/25
        reset2(vis)

    def set_mode_2(vis):
        nonlocal mode_vertices, step
        reset1()
        mode_vertices = evecs[:, -2].reshape(len(v), 3)
        step = np.sqrt(evals[-2])/25
        reset2(vis)

    def set_mode_3(vis):
        nonlocal mode_vertices, step
        reset1()
        mode_vertices = evecs[:, -3].reshape(len(v), 3)
        step = np.sqrt(evals[-3])/25
        reset2(vis)

    def add_mode(vis):
        nonlocal step_count
        v = np.array(canal_mesh.vertices)
        if step_count <= 50:
            v += mode_vertices*step
            step_count += 1
            if save_screenshots and step_count % 3 == 0: screenshot(vis)
            canal_mesh.vertices = o3d.utility.Vector3dVector(v)
            canal_mesh.compute_vertex_normals()
            vis.update_geometry(canal_mesh)
            vis.update_renderer()
            vis.poll_events()
            vis.run()

    def subtract_mode(vis):
        nonlocal step_count
        v = np.array(canal_mesh.vertices)
        if step_count >= -50:
            v -= mode_vertices*step
            step_count -= 1
            if save_screenshots and step_count % 3 == 0: screenshot(vis)
            canal_mesh.vertices = o3d.utility.Vector3dVector(v)
            canal_mesh.compute_vertex_normals()
            vis.update_geometry(canal_mesh)
            vis.update_renderer()
            vis.poll_events()
            vis.run()

    def reset1():
        nonlocal step_count
        v = np.array(canal_mesh.vertices)
        v -= mode_vertices*step*step_count
        step_count = 0
        canal_mesh.vertices = o3d.utility.Vector3dVector(v)
        canal_mesh.compute_vertex_normals()

    def reset2(vis):
        vis.update_geometry(canal_mesh)
        vis.update_renderer()
        vis.poll_events()
        vis.run()

    def reset(vis):
        reset1()
        reset2(vis)

    ss_count=0
    def screenshot(vis):
        nonlocal ss_count
        ss_count += 1
        vis.capture_screen_image("{}.png".format(ss_count), do_render=False)

    vis = o3d.visualization.VisualizerWithKeyCallback()
    vis.create_window()
    vis.add_geometry(canal_mesh)
    vis.add_geometry(points_original)

    vis.register_key_callback(ord("A"), add_mode)
    vis.register_key_callback(ord("D"), subtract_mode)
    vis.register_key_callback(ord("F"), reset)
    vis.register_key_callback(49, set_mode_1)
    vis.register_key_callback(50, set_mode_2)
    vis.register_key_callback(51, set_mode_3)
    vis.register_key_callback(ord("W"), screenshot)

    vis.get_render_option().mesh_show_back_face = True
    vis.run()
    vis.destroy_window()