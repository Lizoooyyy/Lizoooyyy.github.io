document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const openBtn = document.querySelector('.open-btn');
    const popup = document.getElementById('popup');
    const closeBtn = document.getElementById('close-btn');
    const messageContainer = document.getElementById('message-container');
    const submitBtn = document.getElementById('submit-btn');
    
    const STORAGE_KEY = 'feedbackFormData';
    
    
    // Элементы формы для сохранения данных
    const formElements = {
        fullname: document.getElementById('fullname'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        message: document.getElementById('message'),
        privacy: document.getElementById('privacy')
    };
    
    // Открытие попапа
    openBtn.addEventListener('click', function() {
        popup.classList.add('active');
        history.pushState({ formOpen: true }, '', '#feedback');
        restoreFormData();
    });
    
    // Закрытие попапа
    function closePopup() {
        popup.classList.remove('active');
        history.replaceState(null, '', window.location.pathname);
        hideMessage();
    }
    
    closeBtn.addEventListener('click', closePopup);
    
    // Обработка нажатия кнопки "Назад" в браузере
    window.addEventListener('popstate', function(event) {
        if (popup.classList.contains('active')) {
            closePopup();
        }
    });
    
    // Сохранение данных формы в localStorage
    function saveFormData() {
        const formData = {
            fullname: formElements.fullname.value,
            email: formElements.email.value,
            phone: formElements.phone.value,
            message: formElements.message.value,
            privacy: formElements.privacy.checked
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
    
    // Восстановление данных формы из localStorage
    function restoreFormData() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            formElements.fullname.value = formData.fullname || '';
            formElements.email.value = formData.email || '';
            formElements.phone.value = formData.phone || '';
            formElements.message.value = formData.message || '';
            formElements.privacy.checked = formData.privacy || false;
        }
    }
    
    // Очистка данных формы в localStorage
    function clearFormData() {
        localStorage.removeItem(STORAGE_KEY);
    }
    
    // Отображение сообщения
    function showMessage(message, isSuccess) {
        messageContainer.textContent = message;
        messageContainer.className = isSuccess ? 'message success' : 'message error';
        messageContainer.style.display = 'block';
        
        setTimeout(hideMessage, 5000);
    }
    
    function hideMessage() {
        messageContainer.style.display = 'none';
    }
    
    // Обработка отправки формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Получаем данные формы
        const formData = new FormData(form);
        const data = {
            fullname: formData.get('fullname'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message')
        };
        
        // Отключаем кнопку отправки
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        fetch(FORM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            return response.json();
        })
        .then(result => {
            showMessage('Сообщение успешно отправлено! ', true);
            form.reset();
            
            clearFormData();
        })
        .catch(error => {
            // Показываем сообщение об ошибке
            showMessage('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.', false);
            console.error('Ошибка:', error);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить';
        });
    });
    
    // Сохранение данных формы при изменении
    Object.values(formElements).forEach(element => {
        if (element.type === 'checkbox') {
            element.addEventListener('change', saveFormData);
        } else {
            element.addEventListener('input', saveFormData);
        }
    });
    
    // Обработка Escape для закрытия попапа
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.classList.contains('active')) {
            closePopup();
        }
    });
});