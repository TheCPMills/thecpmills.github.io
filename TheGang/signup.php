<?php require_once 'controllers/authController.php'; ?>
<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8">
        <title>Sign Up</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="css/styles.css">
    </head>

    <body>
        <div class="container">
            <div class="row">
                <div class="col-md-4 offset-md-4 form-div">
                    <form action="signup.php" method="post">
                        <h3 class="text-center">Register</h3>
                        <?php if(count($errors) > 0): ?>
                        <div class="alert alert-danger">
                            <?php foreach($errors as $error): ?>
                            <li><?php echo $error; ?></li>
                            <?php endforeach; ?>
                        </div>
                        <?php endif; ?>

                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" name="username" id="username" value="<?php echo $username; ?>" class="form-control form-control-lg" placeholder="Enter username" required>
                        </div>

                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" name="email" id="email" value="<?php echo $email; ?>" class="form-control form-control-lg" placeholder="Enter email" required>
                        </div>

                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" name="password" id="password" class="form-control form-control-lg" placeholder="Enter password" required>
                        </div>

                        <div class="form-group">
                            <label for="passwordConfirm">Confirm Password</label>
                            <input type="password" name="passwordConfirm" id="passwordConfirm" class="form-control form-control-lg" placeholder="Confirm password" required>
                        </div>

                        <div class="form-group">
                            <button type="submit" name="signup-btn" class="btn btn-primary btn-block btn-lg">Sign Up</button>
                        </div>

                        <p class="text-center">Already a member? <a href="login.php">Sign In</a></p>
                    </form>
                </div>
            </div>
        </div>
    </body>
</html>