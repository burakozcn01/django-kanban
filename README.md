# Django Kanban

Django Kanban project! This project is a Kanban board application built using the Django framework.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Contributing](#contributing)

## Introduction

Django Kanban is a simple and intuitive Kanban board application designed to help you manage your tasks and projects efficiently. The application leverages the power of Django to provide a robust backend and a clean, user-friendly interface.

## Features

- **Task Management:** Create, update, and delete tasks with ease.
- **Boards and Columns:** Organize your tasks into boards and columns for better visualization.
- **Drag and Drop:** Easily move tasks between columns using drag and drop functionality.
- **User Authentication:** Secure user authentication to keep your data private.
- **Responsive Design:** A responsive design that works on both desktop and mobile devices.

## Installation

To get started with Django Kanban, follow these steps:

1. **Clone the repository:**
    ```sh
    git clone https://github.com/burakozcn01/django-kanban.git
    cd django-kanban
    cd be
    ```

2. **Create and activate a virtual environment:**
    ```sh
    python3 -m venv env
    source env/bin/activate  # On Windows use `env\Scripts\activate`
    ```

3. **Install the required dependencies:**
    ```sh
    pip install -r requirements.txt
    ```

4. **Run database migrations:**
    ```sh
    python manage.py migrate
    ```

5. **Create a superuser:**
    ```sh
    python manage.py createsuperuser
    ```

6. **Start the development server:**
    ```sh
    python manage.py runserver
    ```

7. Open your web browser and navigate to `http://127.0.0.1:8000` to see the application in action.

## Contributing

We welcome contributions to Django Kanban! If you'd like to contribute, please follow these steps:

1. **Fork the repository.**
2. **Create a new branch:**
    ```sh
    git checkout -b feature/your-feature-name
    ```
3. **Make your changes and commit them:**
    ```sh
    git commit -m 'Add some feature'
    ```
4. **Push to the branch:**
    ```sh
    git push origin feature/your-feature-name
    ```
5. **Open a pull request.**

---

Thank you for using Django Kanban! If you have any questions or feedback, please feel free to open an issue or contact us.
