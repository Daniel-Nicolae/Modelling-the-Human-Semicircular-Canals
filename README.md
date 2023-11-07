## IIB Project - Modelling the Human Semicircular Canals

This repository contains the code and the experiments involved in processing the inner ear 3D mesh data for the standardisation of the semicurcular canals' orientations. The CT data is not included.

The code makes significant use of the [Open3D](http://www.open3d.org/docs/release/) library, which runs on Python versions between 3.7 and 3.10 inclusive.

### Code structure

The code of the project can be found in the ```src``` folder. 

1. ```meshes.py``` contains some basic functions for reading meshes.
2. ```landmarks.py``` is used in ```init.py``` to extract external landmarks from the ```.ply``` and ```.sw``` files.
3. ```segmentations.py``` contains all the functions that break down the otic capsule into its subparts.
4. ```fit.py``` computes the orientation of the canals as well as the rotation with respect to the external landmarks.
5. ```vis.py``` has various visualisation functions.

### Initialisation

The script ```init.py``` imports various functions from the files above and performs all the computations that have to be done at the start: the landmark copying, the segmentation of each canal and the evaluation of landmark pairs. 

The latter 2 are already available in the ```.pickle``` files.