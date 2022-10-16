<?php
    require_once 'controllers/authController.php';
    if (!isset($_SESSION['id'])) {
        header('location: login.php');
        exit();
    }
?>
<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8">
        <title>The Movie List</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="css/styles.css">
    </head>

    <body>
        <div class="container">
            <div class="row">
                <div class="col-md-4 offset-md-4 form-div login">
                    <h3 class="text-center">This is where the movie list would be</h3>
                    Back to <a href="theGangHomepage.php" class="homepage">The Gang's Homepage</a>
                </div>
            </div>
        </div>
    </body>
</html>