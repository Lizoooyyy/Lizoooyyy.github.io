$(document).ready(function(){
    let selectedCar = null;

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
    
    $('.car-slide').each(function(index) {
        const carName = $(this).find('h3').text() || `Автомобиль ${index + 1}`;
        $(this).append(`<button class="select-btn" data-car-index="${index}">Выбрать</button>`);
    });
    
    $(document).on('click', '.select-btn', function(e) {
        e.stopPropagation();
        
        const carIndex = $(this).data('car-index');
        const $slide = $('.car-slide').eq(carIndex);
        const carName = $slide.find('h3').text() || `Автомобиль ${carIndex + 1}`;
        const imgSrc = $slide.find('img').attr('src');
        
        $('.car-slide').removeClass('selected');
        
        $slide.addClass('selected');
        
        selectedCar = {
            index: carIndex,
            name: carName,
            image: imgSrc
        };
        
        $('#selected-car-name').text(carName);
        $('#confirm-btn').prop('disabled', false);
        
        console.log('Выбран автомобиль:', selectedCar);
    });
    
    $('#confirm-btn').on('click', function() {
        if (!selectedCar) {
            alert('Пожалуйста, выберите автомобиль');
            return;
        }
        
        alert(`Вы успешно выбрали: ${selectedCar.name}`);
        console.log('Подтвержден выбор:', selectedCar);
    });
    
    function calculateTotalPages() {
        const slick = $('.cars-slider').slick('getSlick');
        const slidesToShow = slick.options.slidesToShow;
        const totalSlides = slick.slideCount;
        return Math.ceil(totalSlides / slidesToShow);
    }
    
    function getCurrentPage(currentSlide) {
        const slick = $('.cars-slider').slick('getSlick');
        const slidesToShow = slick.options.slidesToShow;
        return Math.floor(currentSlide / slidesToShow) + 1;
    }
    
    $('.cars-slider').on('afterChange', function(event, slick, currentSlide){
        const currentPage = getCurrentPage(currentSlide);
        const totalPages = calculateTotalPages();
        
        $('#current-slide').text(currentPage);
        $('#total-slides').text(totalPages);
        
        console.log('Страница:', currentPage, 'из', totalPages);
    });

    const initialSlide = $('.cars-slider').slick('slickCurrentSlide');
    const currentPage = getCurrentPage(initialSlide);
    const totalPages = calculateTotalPages();
    
    $('#current-slide').text(currentPage);
    $('#total-slides').text(totalPages);
    $('.car-slide img').on('error', function() {
        const index = $(this).closest('.car-slide').index() + 1;
        $(this).attr('src', `https://via.placeholder.com/400x200/667eea/ffffff?text=Car+${index}`);
    });

    $(window).on('resize', function() {
        setTimeout(function() {
            const currentSlide = $('.cars-slider').slick('slickCurrentSlide');
            const currentPage = getCurrentPage(currentSlide);
            const totalPages = calculateTotalPages();
            
            $('#current-slide').text(currentPage);
            $('#total-slides').text(totalPages);
        }, 100);
    });
});
