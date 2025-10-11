document.addEventListener('DOMContentLoaded', function() {
    console.log('Калькулятор инициализируется...');
    
    const tariff = Array.from(document.querySelectorAll(".tariff"));
    const option = Array.from(document.querySelectorAll(".option"));
    const time = document.querySelector("#time");
    const volume = document.querySelector("#volume");
    const total = document.querySelector("#total");
    const orderTariff = document.querySelector("#order_tariff");
    const orderTime = document.querySelector("#order_time");
    const orderOption = document.querySelector("#order_option");

    if (!time || !volume || !total) {
        console.error('Не все элементы найдены!');
        return;
    }

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
            if (this.option.length !== 0) {
                this.option.forEach((el) => {
                    optionPrice += priceInfo.option[el];
                });
            }
            return optionPrice;
        },
    };

    function tariffUpdate(e) {
        currentSet.tariff = e.target.id;
        updatePrice();
        orderUpdate();
    }

    function timeUpdate(e) {
        currentSet.time = parseInt(time.value); 
        volume.value = currentSet.time;
        updatePrice();
        orderUpdate();
    }

    function volumeUpdate(e) { 
        let value = parseInt(volume.value);
        if (isNaN(value) || value < 1) value = 1;
        if (value > 24) value = 24;
        
        volume.value = value;
        time.value = value;
        currentSet.time = value;
        updatePrice();
        orderUpdate();
    }

    function optionUpdate(e) {
        e.stopPropagation();
        if (e.target.checked) {
            currentSet.option.push(e.target.id);
        } else {
            let index = currentSet.option.indexOf(e.target.id);
            if (index > -1) {
                currentSet.option.splice(index, 1);
            }
        }
        updatePrice();
        orderUpdate();
    }

    function updatePrice() {
        let tariffPrice = currentSet.getTariffPrice();
        let optionPrice = currentSet.getOptionPrice();
        let totalPrice = currentSet.time * tariffPrice + optionPrice;
        total.value = totalPrice;
    }

    function orderUpdate() {
        if (currentSet.time === 1) {
            orderTime.value = currentSet.time + " час";
        } else if (currentSet.time < 5) {
            orderTime.value = currentSet.time + " часа";
        } else {
            orderTime.value = currentSet.time + " часов";
        }
        orderTariff.value = currentSet.getTariffPrice() + " ₽/час";
        orderOption.value = currentSet.getOptionPrice() + " ₽";
    }
    tariff.forEach((el) => {
        el.addEventListener("click", tariffUpdate);
    });

    time.addEventListener("input", timeUpdate);
    volume.addEventListener("input", volumeUpdate); 

    option.forEach((el) => {
        el.addEventListener("change", optionUpdate);
    });

    time.value = currentSet.time;
    volume.value = currentSet.time;
    updatePrice();
    orderUpdate();

    console.log('Все обработчики подключены успешно!');
});
