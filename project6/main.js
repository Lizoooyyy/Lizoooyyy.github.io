const basePrices = {
    basic: 100,
    premium: 200,
    custom: 150
};

const optionPrices = {
    standard: 0,
    express: 50,
    priority: 100
};
const quantityInput = document.getElementById('quantity');
const serviceTypeRadios = document.querySelectorAll('input[name="serviceType"]');
const optionsGroup = document.getElementById('optionsGroup');
const optionsSelect = document.getElementById('options');
const propertyGroup = document.getElementById('propertyGroup');
const propertyCheckbox = document.getElementById('property');
const totalPriceElement = document.getElementById('totalPrice');

function updateFormVisibility() {
    const selectedType = document.querySelector('input[name="serviceType"]:checked').value;

    optionsSelect.value = 'standard';
    propertyCheckbox.checked = false;
    
    switch(selectedType) {
        case 'basic':
            optionsGroup.classList.add('hidden');
            propertyGroup.classList.add('hidden');
            break;
        case 'premium':
            optionsGroup.classList.remove('hidden');
            propertyGroup.classList.add('hidden');
            break;
        case 'custom':
            optionsGroup.classList.add('hidden');
            propertyGroup.classList.remove('hidden');
            break;
    }
}

function calculateTotalPrice() {
    const quantity = parseInt(quantityInput.value) || 1;
    const selectedType = document.querySelector('input[name="serviceType"]:checked').value;
    
    let total = basePrices[selectedType] * quantity;
    if (selectedType === 'premium') {
        const selectedOption = optionsSelect.value;
        total += optionPrices[selectedOption] * quantity;
    }
    
    if (selectedType === 'custom' && propertyCheckbox.checked) {
        total *= 1.25;
    }
    
    return total;
}

function updatePriceDisplay() {
    const totalPrice = calculateTotalPrice();
    totalPriceElement.textContent = `${totalPrice.toFixed(2)} руб`;
}

function initializeCalculator() {
    updateFormVisibility();
    updatePriceDisplay();
}

serviceTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
        updateFormVisibility();
        updatePriceDisplay();
    });
});

quantityInput.addEventListener('input', updatePriceDisplay);
optionsSelect.addEventListener('change', updatePriceDisplay);
propertyCheckbox.addEventListener('change', updatePriceDisplay);

document.addEventListener('DOMContentLoaded', initializeCalculator);