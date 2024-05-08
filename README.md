## IIB Project - Modelling the Human Semicircular Canals

This repository contains the code and the experiments involved in processing the inner ear 3D mesh data for the standardisation of the semicurcular canals' orientations, as well as the code for the Epley assistance web application.

### Pyhton code

The ```python``` folder contains all the code related to the CT data analysis and mesh processing: 

1. ```meshes.py``` contains some basic functions for reading meshes.
2. ```landmarks.py``` is used in ```init.py``` to extract external landmarks from the ```.ply``` and ```.sw``` files.
3. ```segmentations.py``` contains all the functions that break down the otic capsule into its subparts.
4. ```fit.py``` computes the orientation of the canals as well as the rotation with respect to the external landmarks, and contains the fiducial ranking procedure.
5. ```variations.py``` is used for finding the residual variations in the canals' anatomy, after standardisation.
6. ```vis.py``` has various visualisation functions.

The CT data used for analysis, as well as the StradView ```.sw``` files are not included.

The code makes significant use of the [Open3D](http://www.open3d.org/docs/release/) library, which runs on Python versions between 3.7 and 3.10 inclusive.

#### Experiments

All of the functions in the files above can be expermented with in the Jupyter Notebook.

#### Initialisation

The script ```init.py``` imports various functions from the files above and performs all the computations that have to be done at the start: the landmark copying, the segmentation of each canal and the evaluation of landmark triplets. 

#### Results

The results of evaluating each landmark triplet and the modes of residual variation are all available in the ```pickles``` folder, and are loaded by various other functions in the ```python``` folder.

### Epley assistance application

The ```epley_web``` folder contains the React TypeScript web application.

---

The ```epley_app``` folder contains a yet incomplete React Native mobile app, built with Expo.


