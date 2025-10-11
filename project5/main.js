document.addEventListener('DOMContentLoaded', function() {
    console.log('Калькулятор инициализируется...');
    
    const tariffButtons = document.querySelectorAll('.tariff');
    const optionCheckboxes = document.querySelectorAll('.option');
    const timeSlider = document.querySelector('#time');
    const volumeInput = document.querySelector('#volume');
    const totalInput = document.querySelector('#total');
    const calculateBtn = document.querySelector('#calculate-btn');

    const orderTariff = document.querySelector('#order_tariff');
    const orderTime = document.querySelector('#order_time');
    const orderOption = document.querySelector('#order_option');

    const priceInfo = {
        tariff: {
            economy: 500,
            comfort: 800,
            business: 1100,
            premium: 1400,
        },
        option: {
            option1: 1000,
            option2: 1500,
            option3: 1500,
            option4: 2000,
        },
    };

    let currentSet = {
        tariff: "comfort",
        time: 2,
        option: [],
        getTariffPrice() {
            return priceInfo.tariff[this.tariff];
        },
        getOptionPrice() {
            let optionPrice = 0;
            this.option.forEach((el) => {
                optionPrice += priceInfo.option[el];
            });
            return optionPrice;
        },
    };

    tariffButtons.forEach((button) => {
        button.addEventListener('click', function(e) {
            tariffButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentSet.tariff = this.id;
            updatePrice();
            updateOrderDetails();
        });
    });

    timeSlider.addEventListener('input', function() {
        currentSet.time = parseInt(this.value);
        volumeInput.value = currentSet.time;
        updatePrice();
        updateOrderDetails();
    });

    volumeInput.addEventListener('input', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 1) value = 1;
        if (value > 24) value = 24;
        
        this.value = value;
        timeSlider.value = value;
        currentSet.time = value;
        updatePrice();
        updateOrderDetails();
    });

    optionCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                currentSet.option.push(this.id);
            } else {
                const index = currentSet.option.indexOf(this.id);
                if (index > -1) {
                    currentSet.option.splice(index, 1);
                }
            }
            updatePrice();
            updateOrderDetails();
        });
    });

    calculateBtn.addEventListener('click', function() {
        updatePrice();
        updateOrderDetails();
        
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
    function updatePrice() {
        const tariffPrice = currentSet.getTariffPrice();
        const optionPrice = currentSet.getOptionPrice();
        const totalPrice = currentSet.time * tariffPrice + optionPrice;
        totalInput.value = totalPrice;
    }

    function updateOrderDetails() {
        const hours = currentSet.time;
        let timeText;
        if (hours === 1) {
            timeText = "1 час";
        } else if (hours < 5) {
            timeText = hours + " часа";
        } else {
            timeText = hours + " часов";
        }
        orderTime.value = timeText;
        
        orderTariff.value = currentSet.getTariffPrice() + " ₽/час";
        orderOption.value = currentSet.getOptionPrice() + " ₽";
    }

    function initializeCalculator() {
        const defaultTariff = document.getElementById('comfort');
        if (defaultTariff) {
            defaultTariff.classList.add('active');
        }
        
        timeSlider.value = currentSet.time;
        volumeInput.value = currentSet.time;

        updatePrice();
        updateOrderDetails();
        
        console.log('Калькулятор готов к работе!');
    }

    initializeCalculator();
});
