<?php

session_start();

require 'config/db.php';

$errors = array();
$username = "";
$email = "";

if (isset($_POST['signup-btn'])) {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $passwordConfirm = $_POST['passwordConfirm'];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = "Email address is invalid";
    }

    if (empty($username) || empty($email) || empty($password) || empty($passwordConfirm)) {
        $errors[] = 'All fields are required';
    }

    if ($password !== $passwordConfirm) {
        $errors[] = 'Passwords do not match';
    }

    $emailQuery = "SELECT * FROM users WHERE email=? LIMIT 1";
    $stmt = $conn -> prepare($emailQuery);
    $stmt -> bind_param('s', $email);
    $stmt -> execute();
    $result = $stmt -> get_result();
    $userCount = $result -> num_rows;

    if ($userCount > 0) {
        $errors['email'] = 'Email already exists';
    }

    if (count($errors) === 0) {
        $password = password_hash($password, PASSWORD_DEFAULT);
        $uuid = bin2hex(random_bytes(50));

        $sql = "INSERT INTO users (username, email, uuid, password) VALUES (?, ?, ?, ?)";
        $stmt = $conn -> prepare($sql);
        $stmt -> bind_param('ssss', $username, $email, $uuid, $password);

        if ($stmt -> execute()) {
            // login user
            $user_id = $conn -> insert_id;
            $_SESSION['id'] = $user_id;
            $_SESSION['username'] = $username;
            $_SESSION['email'] = $email;

            // flash message
            $_SESSION['message'] = 'You are now logged in!';
            $_SESSION['alert-class'] = 'alert-success';
            header('location: theGangHomepage.php');
            exit();
        } else {
            $errors[] = 'Database error: failed to register';
        }
    }
}

if (isset($_POST['login-btn'])) {
    $username = $_POST['usernameEmail'];
    $password = $_POST['password'];

    if (empty($username) || empty($password)) {
        $errors[] = 'All fields are required';
    }

    if (count($errors) === 0) {
        $sql = "SELECT * FROM users WHERE username=? OR email=? LIMIT 1";
        $stmt = $conn -> prepare($sql);
        $stmt -> bind_param('ss', $username, $username);
        $stmt -> execute();
        $result = $stmt -> get_result();
        $user = $result -> fetch_assoc();

        if (password_verify($password, $user['password'])) {
            // login success
            $_SESSION['id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['email'] = $user['email'];

            // flash message
            $_SESSION['message'] = 'You are now logged in!';
            $_SESSION['alert-class'] = 'alert-success';
            header('location: theGangHomepage.php');
            exit();
        } else {
            $errors['login_fail'] = 'Wrong credentials';
        }
    }
}

if (isset($_GET['logout'])) {
    session_destroy();
    unset($_SESSION['id']);
    unset($_SESSION['username']);
    unset($_SESSION['email']);
    header('location: login.php');
    exit();
}