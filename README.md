#Digit Classification Application

##Live Demo
**Live Application:** https://digit-classification-vgg19-1.onrender.com/
A web-based Digit Classification Application that uses Deep Learning to recognize handwritten digits from images.
The model is built using VGG19 (Transfer Learning) and served through a Flask backend, providing fast and accurate predictions via a simple web interface.

##Features

Handwritten digit recognition (0–9)

Deep Learning model based on VGG19

Transfer learning for improved accuracy and faster training

Flask-powered REST API for prediction

User-friendly web interface

Real-time inference

## Tech Stack
# AI / Machine Learning

Python

TensorFlow / Keras

VGG19 (Pre-trained CNN)

Image preprocessing & normalization

# Backend

Flask

REST API for model inference

# Frontend

HTML, CSS, JavaScript

# Model Details

Used VGG19 pre-trained on ImageNet

Fine-tuned final layers for digit classification

Achieves high accuracy on handwritten digit data

Optimized for inference in a web environment

## Project Structure
digit-classification/
│
├── model/
│   └── vgg19_digit_model.h5
├── app.py
├── templates/
├── static/
├── requirements.txt
└── README.md

## Installation & Setup
# Clone the repository
git clone https://github.com/your-username/digit-classification.git

# Navigate to project directory
cd digit-classification

# Install dependencies
pip install -r requirements.txt

# Run the Flask app
python app.py

## Usage

Open the application in your browser

Upload or draw a digit image

Submit the image

Get the predicted digit instantly

## Use Cases

Learning AI & Deep Learning concepts

Understanding Transfer Learning with CNNs

Academic projects

AI-powered web applications

## Highlights for Recruiters

Practical application of AI & Machine Learning

Real-world usage of VGG19 Transfer Learning

End-to-end system (Model → API → UI)

Production-style deployment using Flask

## Author

Samira Ahmed
