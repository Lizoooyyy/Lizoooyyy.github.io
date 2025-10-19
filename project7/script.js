$(document).ready(function(){
    let selectedCarId = null;
    
    // Инициализация слайдера
    $('.cars-slider').slick({
        slidesToShow: 3,
        slidesToScroll: 3,
        dots: true,
        arrows: true,
        infinite: false,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });
    
    // Добавляем data-id к каждому слайду для постоянной идентификации
    $('.car-slide').each(function(index) {
        $(this).attr('data-car-id', index + 1);
    });
    
    // Функция для выделения автомобиля
    function selectCar(carId) {
        // Снимаем выделение со всех слайдов
        $('.car-slide').removeClass('selected');
        
        // Выделяем выбранный слайд по data-car-id
        $(`.car-slide[data-car-id="${carId}"]`).addClass('selected');
        
        selectedCarId = carId;
        
        // Получаем информацию об автомобиле
        const $selectedSlide = $(`.car-slide[data-car-id="${carId}"]`);
        const carName = $selectedSlide.find('h3').text();
        const carInfo = $selectedSlide.find('p').map(function() {
            return $(this).text();
        }).get();
        
        // Обновляем отображение выбранного автомобиля
        $('#selected-car-name').text(carName);
        $('#confirm-btn').prop('disabled', false);
    }
    
    // Обработчик выбора автомобиля через делегирование
    $(document).on('click', '.car-slide', function() {
        const carId = $(this).data('car-id');
        selectCar(carId);
    });
    
    // Обработчик подтверждения выбора
    $('#confirm-btn').on('click', function() {
        if (!selectedCarId) {
            alert('Пожалуйста, выберите автомобиль');
            return;
        }
        
        const $selectedSlide = $(`.car-slide[data-car-id="${selectedCarId}"]`);
        const carName = $selectedSlide.find('h3').text();
        const carInfo = $selectedSlide.find('p').map(function() {
            return $(this).text();
        }).get();
        
        alert(`Вы успешно выбрали автомобиль: ${carName}\n${carInfo[0]}\n${carInfo[1]}`);
        
        console.log('Выбран автомобиль:', { id: selectedCarId, name: carName });
    });
    
    // Функция для расчета количества страниц
    function calculateTotalPages() {
        const slick = $('.cars-slider').slick('getSlick');
        const slidesToShow = slick.options.slidesToShow;
        const totalSlides = slick.slideCount;
        return Math.ceil(totalSlides / slidesToShow);
    }
    
    // Функция для получения текущей страницы
    function getCurrentPage(currentSlide) {
        const slick = $('.cars-slider').slick('getSlick');
        const slidesToShow = slick.options.slidesToShow;
        return Math.floor(currentSlide / slidesToShow) + 1;
    }
    
    // Обновление счетчика страниц
    $('.cars-slider').on('afterChange', function(event, slick, currentSlide){
        const currentPage = getCurrentPage(currentSlide);
        const totalPages = calculateTotalPages();
        
        $('#current-page').text(currentPage);
        $('#total-pages').text(totalPages);
        
        // Восстанавливаем выделение после перестроения слайдера
        if (selectedCarId) {
            selectCar(selectedCarId);
        }
    });
    
    // Инициализация счетчика при загрузке
    const initialSlide = $('.cars-slider').slick('slickCurrentSlide');
    const currentPage = getCurrentPage(initialSlide);
    const totalPages = calculateTotalPages();
    
    $('#current-page').text(currentPage);
    $('#total-pages').text(totalPages);
    
    // Добавляем заглушки для изображений
    $('.car-slide img').on('error', function() {
        const carId = $(this).closest('.car-slide').data('car-id');
        $(this).attr('src', `https://via.placeholder.com/400x200/667eea/ffffff?text=Car+${carId}`);
    });
    
    // Восстанавливаем выделение при инициализации
    $('.cars-slider').on('init', function(){
        if (selectedCarId) {
            selectCar(selectedCarId);
        }
    });
    
    // Восстанавливаем выделение при изменении размера окна
    $(window).on('resize', function() {
        setTimeout(function() {
            const currentSlide = $('.cars-slider').slick('slickCurrentSlide');
            const currentPage = getCurrentPage(currentSlide);
            const totalPages = calculateTotalPages();
            
            $('#current-page').text(currentPage);
            $('#total-pages').text(totalPages);
            
            // Восстанавливаем выделение
            if (selectedCarId) {
                selectCar(selectedCarId);
            }
        }, 100);
    });
});