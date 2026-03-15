<?php
session_start();
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Форма регистрации</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2em;
            margin-bottom: 10px;
        }

        .form-container {
            padding: 40px;
        }

        .form-group {
            margin-bottom: 25px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }

        input[type="text"],
        input[type="tel"],
        input[type="email"],
        input[type="date"],
        select,
        textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }

        input[type="text"]:focus,
        input[type="tel"]:focus,
        input[type="email"]:focus,
        input[type="date"]:focus,
        select:focus,
        textarea:focus {
            outline: none;
            border-color: #667eea;
        }

        .radio-group {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }

        .radio-option {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .radio-option input[type="radio"] {
            width: auto;
            margin-right: 5px;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .checkbox-group input[type="checkbox"] {
            width: auto;
        }

        select[multiple] {
            height: 150px;
        }

        textarea {
            min-height: 120px;
            resize: vertical;
        }

        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 40px;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .error-list {
            margin-top: 10px;
            padding-left: 20px;
        }

        @media (max-width: 600px) {
            .form-container {
                padding: 20px;
            }
            
            .radio-group {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Форма регистрации</h1>
            <p>Заполните все поля для сохранения в базу данных</p>
        </div>
        
        <div class="form-container">
            <?php if (isset($_SESSION['success'])): ?>
                <div class="alert alert-success">
                    <?php 
                    echo $_SESSION['success'];
                    unset($_SESSION['success']);
                    ?>
                </div>
            <?php endif; ?>

            <?php if (isset($_SESSION['errors']) && !empty($_SESSION['errors'])): ?>
                <div class="alert alert-error">
                    <strong>Ошибки при заполнении формы:</strong>
                    <ul class="error-list">
                        <?php foreach ($_SESSION['errors'] as $error): ?>
                            <li><?php echo htmlspecialchars($error); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
                <?php unset($_SESSION['errors']); ?>
            <?php endif; ?>

            <form action="process.php" method="POST" id="registrationForm">
                <div class="form-group">
                    <label for="fullname">ФИО *</label>
                    <input type="text" id="fullname" name="fullname" required 
                           placeholder="Иванов Иван Иванович"
                           value="<?php echo isset($_SESSION['old']['fullname']) ? htmlspecialchars($_SESSION['old']['fullname']) : ''; ?>">
                </div>

                <div class="form-group">
                    <label for="phone">Телефон *</label>
                    <input type="tel" id="phone" name="phone" required 
                           placeholder="+7 (999) 123-45-67"
                           value="<?php echo isset($_SESSION['old']['phone']) ? htmlspecialchars($_SESSION['old']['phone']) : ''; ?>">
                </div>

                <div class="form-group">
                    <label for="email">E-mail *</label>
                    <input type="email" id="email" name="email" required 
                           placeholder="example@domain.com"
                           value="<?php echo isset($_SESSION['old']['email']) ? htmlspecialchars($_SESSION['old']['email']) : ''; ?>">
                </div>

                <div class="form-group">
                    <label for="birthdate">Дата рождения *</label>
                    <input type="date" id="birthdate" name="birthdate" required
                           value="<?php echo isset($_SESSION['old']['birthdate']) ? htmlspecialchars($_SESSION['old']['birthdate']) : ''; ?>">
                </div>

                <div class="form-group">
                    <label>Пол *</label>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="gender" value="male" required
                                <?php echo (isset($_SESSION['old']['gender']) && $_SESSION['old']['gender'] == 'male') ? 'checked' : ''; ?>>
                            Мужской
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="gender" value="female" required
                                <?php echo (isset($_SESSION['old']['gender']) && $_SESSION['old']['gender'] == 'female') ? 'checked' : ''; ?>>
                            Женский
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="gender" value="other" required
                                <?php echo (isset($_SESSION['old']['gender']) && $_SESSION['old']['gender'] == 'other') ? 'checked' : ''; ?>>
                            Другой
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label for="languages">Любимые языки программирования * (можно выбрать несколько)</label>
                    <select id="languages" name="languages[]" multiple required size="6">
                        <option value="Pascal" <?php echo (isset($_SESSION['old']['languages']) && in_array('Pascal', $_SESSION['old']['languages'])) ? 'selected' : ''; ?>>Pascal</option>
                        <option value="C" <?php echo (isset($_SESSION['old']['languages']) && in_array('C', $_SESSION['old']['languages'])) ? 'selected' : ''; ?>>C</option>
                        <option value="C++" <?php echo (isset($_SESSION['old']['languages']) && in_array('C++', $_SESSION['old']['languages'])) ? 'selected' : ''; ?>>C++</option>
                        <option value="JavaScript" <?php echo (isset($_SESSION['old']['languages']) && in_array('JavaScript', $_SESSION['old']['languages'])) ? 'selected' : ''; ?>>JavaScript</option>
                        <option value="PHP" <?php echo (isset($_SESSION['old']['languages']) && in_array('PHP', $_SESSION['old']['languages'])) ? 'selected' : ''; ?>>PHP</option>
                        <option value="Python" <?php echo (isset($_SESSION['old']['languages']) && in_array('Python', $_SESSION['old']['languages'])) ? 'selected' : ''; ?>>Python</option>
                        <option value="Java" <?php echo (isset($_SESSION['old']['languages']) && in_array('Java', $_SESSION['old']['languages'])) ? 'selected' : ''; ?>>Java</option>
                        <option value="Haskel" <?php echo (isset($_SESSION['old']['languages']) && in_array('Haskel', $_SESSION['old']['languages'])) ? 'selected' : ''; ?>>Haskel</option>
                        <option value="Clojure" <?php echo (isset($_SESSION['old']['languages']) && in_array('Clojure', $_SESSION['old']['languages'])) ? 'selected' : ''; ?>>Clojure</option>
                        <option value="Prolog" <?php echo (isset($_SESSION['old']['languages']) && in_array('Prolog', $_SESSION['old']['languages'])) ? 'selected' : ''; ?>>Prolog</option>
                        <option value="Scala" <?php echo (isset($_SESSION['old']['languages']) && in_array('Scala', $_SESSION['old']['languages'])) ? 'selected' : ''; ?>>Scala</option>
                        <option value="Go" <?php echo (isset($_SESSION['old']['languages']) && in_array('Go', $_SESSION['old']['languages'])) ? 'selected' : ''; ?>>Go</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="biography">Биография</label>
                    <textarea id="biography" name="biography" placeholder="Расскажите о себе..."><?php echo isset($_SESSION['old']['biography']) ? htmlspecialchars($_SESSION['old']['biography']) : ''; ?></textarea>
                </div>

                <div class="form-group">
                    <div class="checkbox-group">
                        <input type="checkbox" id="contract" name="contract_accepted" value="1" required
                            <?php echo (isset($_SESSION['old']['contract_accepted']) && $_SESSION['old']['contract_accepted'] == '1') ? 'checked' : ''; ?>>
                        <label for="contract">Я ознакомлен(а) с контрактом *</label>
                    </div>
                </div>

                <div class="form-group">
                    <button type="submit" class="btn">Сохранить</button>
                </div>
            </form>
        </div>
    </div>
    <?php unset($_SESSION['old']); ?>
</body>
</html>
