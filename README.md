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
   git clone https://github.com/your-repo/seat-car-digital-twin.git --recursive
   cd seat-car-digital-twin
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

## Acknowledgments

This project builds upon the work of:
- [NeRF: Neural Radiance Fields](http://matthewtancik.com/nerf)
- [3D Gaussian Splatting](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)

Special thanks to the authors of these methods for their groundbreaking contributions to 3D rendering and scene representation.