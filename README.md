# Seat Car Digital Twin

## Overview

This project combines state-of-the-art 3D rendering techniques, including **NeRF (Neural Radiance Fields)** and **Gaussian Splatting**, to create a highly detailed and interactive digital twin of a Seat car. The digital twin enables real-time visualization, simulation, and analysis for automotive applications.

## What is NeRF?

NeRF is a neural rendering technique that represents scenes as neural radiance fields. It uses a fully connected neural network to map spatial locations and viewing directions to color and opacity, enabling photorealistic novel-view synthesis. While NeRF achieves impressive results, it is computationally intensive and requires significant time for training and rendering.

![NeRF Workflow](nerf-master/imgs/pipeline.jpg)

## What is Gaussian Splatting?

Gaussian Splatting is a novel approach to 3D scene representation and rendering. It uses 3D Gaussians to model scenes, optimizing their density and anisotropic covariance for accurate representation. This method achieves state-of-the-art visual quality while enabling real-time rendering at 1080p resolution, making it ideal for applications requiring both speed and quality.

![3D Gaussian Splatting Workflow](gaussian-splatting-main/assets/teaser.png)

## Project Goals

The primary objective of this project is to create a **digital twin** of a Seat car, which can be used for:

- **Real-time visualization**: Explore the car's interior and exterior in a virtual environment.
- **Simulation and analysis**: Test various scenarios, such as lighting conditions or material changes.
- **Marketing and training**: Provide an interactive experience for customers and staff.

## Getting Started

### Prerequisites

- A CUDA-enabled GPU with at least 24 GB VRAM for training.
- Python 3.8 or higher.
- Conda for environment management.

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:cyu60/hackupc.git --recursive
   cd hackupc
   ```

2. Set up the environment:
   ```bash
   conda env create -f environment.yml
   conda activate seat-car
   ```

3. Download the required datasets and pre-trained models:
   ```bash
   bash download_example_data.sh
   ```

### Training

To train a NeRF or Gaussian Splatting model on your dataset:
```bash
python train.py --config config_fern.txt
```

### Rendering

To render a trained model:
```bash
python render.py --model_path <path_to_model>
```

## Training Models for Car Digital Twins

This section provides detailed instructions on how to train NeRF and Gaussian Splatting models using the downloaded repositories.

### Preparing Your Data

Before training, you'll need a set of images of the car from multiple viewpoints:

1. **Capture Requirements**:
   - Consistent lighting conditions
   - Overlap between images (30-50%)
   - Coverage of all areas you want to reconstruct

2. **Data Organization**:
   - For NeRF: Place your images in a folder structure as per LLFF format
   - For Gaussian Splatting: Follow the COLMAP dataset structure

### Training with Gaussian Splatting

Gaussian Splatting generally provides faster training and real-time rendering capabilities, making it ideal for interactive applications.

#### Data Processing with COLMAP

First, convert your raw images to the required format:

```bash
cd gaussian-splatting-main
python convert.py -s /path/to/your/car/images --resize
```

This script:
- Runs COLMAP to extract camera poses
- Undistorts images
- Creates the necessary folder structure

#### Training Process

```bash
python train.py -s /path/to/processed/car/data
```

Advanced options for better results:

```bash
# For high-quality results
python train.py -s /path/to/processed/car/data --iterations 30000 --resolution 2

# For real-time optimization
python train.py -s /path/to/processed/car/data --iterations 15000 --resolution 1 --position_lr_init 0.00016
```

#### Monitoring Training Progress

You can monitor the training progress using the provided network viewer:

```bash
cd SIBR_viewers/bin
./SIBR_remoteGaussian_app
```

This allows you to see the 3D model as it's being trained.

### Training with NeRF

NeRF may provide higher quality results for complex lighting conditions but requires more training time and is slower to render.

#### Preparing NeRF Data

For LLFF-format data (real captured images):

```bash
cd nerf-master
python imgs2poses.py /path/to/your/car/images
```

#### Training NeRF Model

Create a configuration file for your dataset (similar to config_fern.txt):

```bash
cd nerf-master
# Example configuration file creation
echo "expname = seat_car
datadir = /path/to/car/data
dataset_type = llff
no_batching = True
use_viewdirs = True
white_bkgd = False
N_samples = 64
N_importance = 128
llffhold = 8" > config_seat_car.txt

# Run training
python run_nerf.py --config config_seat_car.txt
```

For best results:
- Train for at least 200,000 iterations (may take 15+ hours on a single GPU)
- Use `tensorboard --logdir=logs/summaries` to monitor training progress
- Final model and renderings will be saved in the `logs/[expname]` directory

### Tips for Car Digital Twins

1. **Interior Scans**: 
   - Use Gaussian Splatting with depth regularization for better results
   ```bash
   python train.py -s /path/to/data -d /path/to/depth_maps --depth_sil_weight 0.1
   ```

2. **Glossy Surfaces**:
   - Lower learning rates can help with reflective surfaces
   ```bash
   python train.py -s /path/to/data --position_lr_init 0.000016 --scaling_lr 0.001
   ```

3. **Exposure Variations**:
   - Enable exposure compensation for outdoor captures:
   ```bash
   python train.py -s /path/to/data --exposure_lr_init 0.001 --exposure_lr_final 0.0001
   ```

4. **Multi-View Consistency**:
   - Add anti-aliasing for better results across viewpoints:
   ```bash
   python train.py -s /path/to/data --antialiasing
   ```

### Rendering and Viewing

After training, you can render your model or view it interactively:

#### Gaussian Splatting Viewer

```bash
cd SIBR_viewers/bin
./SIBR_gaussianViewer_app -m /path/to/trained/model
```

#### NeRF Rendering

```bash
cd nerf-master
python run_nerf.py --config config_seat_car.txt --render_only
```

Rendered images and videos will be saved in the output directory.

## Repository

This project is hosted on GitHub. You can find the repository here:
[Seat Car Digital Twin Repository](https://github.com/cyu60/hackupc)

## Acknowledgments

This project builds upon the work of:
- [NeRF: Neural Radiance Fields](http://matthewtancik.com/nerf)
- [3D Gaussian Splatting](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)

Special thanks to the authors of these methods for their groundbreaking contributions to 3D rendering and scene representation.