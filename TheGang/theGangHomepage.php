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
        <title>The Gang's Homepage</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="css/styles.css">
    </head>

    <body>
        <div class="container">
            <div class="row">
                <div class="col-md-4 offset-md-4 form-div login">
                    <?php if(isset($_SESSION['message'])): ?>
                        <div class="alert <?php echo $_SESSION['alert-class']; ?>">
                            <?php
                                echo $_SESSION['message'];
                                unset($_SESSION['message']);
                                unset($_SESSION['alert-class']);
                            ?>
                        </div>
                    <?php endif; ?>

                    <h3>Welcome, <?php echo $_SESSION['username']; ?></h3>
                    <p class="text-center">Go To <a href="movieList.php">The Movie List</a></p>

                    <a href="theGangHomepage.php?logout=1" class="logout">Logout</a>
                </div>
            </div>
        </div>
    </body>
</html>